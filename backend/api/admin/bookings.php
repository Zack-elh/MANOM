<?php
/**
 * MANOM BarberShop - Admin Bookings API
 * GET    /api/admin/bookings.php          - List all bookings
 * POST   /api/admin/bookings.php          - Create manual booking (walk-in)
 * PUT    /api/admin/bookings.php          - Actions: cancel, complete, start, approve
 * DELETE /api/admin/bookings.php          - Delete a booking
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('admin_bookings');

$admin = require_admin();
$db = db();

// Auto-complete past bookings
auto_complete_bookings();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Filters
    $status = isset($_GET['status']) ? sanitize_input($_GET['status']) : null;
    $barberId = isset($_GET['barber_id']) ? (int)$_GET['barber_id'] : null;
    $date = isset($_GET['date']) ? sanitize_input($_GET['date']) : null;
    $search = isset($_GET['search']) ? sanitize_input($_GET['search']) : null;

    $sql = "
        SELECT 
            b.id, b.ref_code, b.booking_date, b.booking_time, b.status, b.notes, b.created_at,
            b.cancelled_at, b.completed_at,
            s.title AS service_title, s.duration, s.price,
            br.name AS barber_name,
            u.name AS client_name, u.email AS client_email, u.phone AS client_phone,
            u.no_show_count
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN barbers br ON b.barber_id = br.id
        LEFT JOIN users u ON b.user_id = u.id
        WHERE 1=1
    ";
    $params = [];

    if ($status) {
        $sql .= " AND b.status = ?";
        $params[] = $status;
    }
    if ($barberId) {
        $sql .= " AND b.barber_id = ?";
        $params[] = $barberId;
    }
    if ($date) {
        $sql .= " AND b.booking_date = ?";
        $params[] = $date;
    }
    if ($search) {
        $sql .= " AND (b.ref_code LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR b.notes LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $sql .= " ORDER BY b.booking_date DESC, b.booking_time DESC LIMIT 100";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();

    // Parse multi-service notes
    foreach ($bookings as &$booking) {
        $multiNote = json_decode($booking['notes'], true);
        if (isset($multiNote['__multi__']) && is_array($multiNote['__multi__'])) {
            $ids = $multiNote['__multi__'];
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt2 = $db->prepare("SELECT id, title, duration, price FROM services WHERE id IN ($placeholders)");
            $stmt2->execute($ids);
            $multiServices = $stmt2->fetchAll();
            $names = array_column($multiServices, 'title');
            $booking['service_title'] = implode(', ', $names);
            $booking['multi_service_ids'] = $ids;
            $booking['price'] = array_sum(array_column($multiServices, 'price'));
            $booking['duration'] = array_sum(array_column($multiServices, 'duration'));
        }
    }
    unset($booking);

    json_response(['bookings' => $bookings, 'total' => count($bookings)]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Admin creates manual booking (walk-in: user_id nullable)
    // Supports both service_id (single) and service_ids (multi)
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        json_response(['error' => 'Invalid request body'], 400);
    }

    // Support both service_id and service_ids
    $serviceIds = [];
    if (isset($input['service_ids']) && is_array($input['service_ids'])) {
        $serviceIds = array_map('intval', $input['service_ids']);
    } elseif (isset($input['service_id'])) {
        $serviceIds = [(int)$input['service_id']];
    }

    if (empty($serviceIds)) {
        json_response(['error' => 'service_id or service_ids is required'], 400);
    }

    $error = validate_required(['barber_id', 'booking_date', 'booking_time'], $input);
    if ($error) {
        json_response(['error' => $error], 400);
    }

    $barberId = (int)$input['barber_id'];
    $bookingDate = sanitize_input($input['booking_date']);
    $bookingTime = sanitize_input($input['booking_time']);
    $userId = !empty($input['user_id']) ? (int)$input['user_id'] : null;
    $guestName = isset($input['guest_name']) ? sanitize_input($input['guest_name']) : null;
    $guestPhone = isset($input['guest_phone']) ? sanitize_input($input['guest_phone']) : null;
    $notes = isset($input['notes']) ? sanitize_input($input['notes']) : null;

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $bookingDate)) {
        json_response(['error' => 'Invalid date format'], 400);
    }
    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $bookingTime)) {
        json_response(['error' => 'Invalid time format'], 400);
    }
    if (strlen($bookingTime) === 5) {
        $bookingTime .= ':00';
    }

    // Fetch all selected services
    $placeholders = implode(',', array_fill(0, count($serviceIds), '?'));
    $stmt = $db->prepare("SELECT id, title, duration, price, active FROM services WHERE id IN ($placeholders)");
    $stmt->execute($serviceIds);
    $services = $stmt->fetchAll();

    if (count($services) !== count($serviceIds)) {
        json_response(['error' => 'One or more services not found'], 404);
    }
    foreach ($services as $svc) {
        if (!$svc['active']) {
            json_response(['error' => 'Service "' . $svc['title'] . '" is not available'], 400);
        }
    }

    // Calculate combined info
    $totalPrice = 0;
    $maxDuration = 0;
    $serviceNames = [];
    foreach ($services as $svc) {
        $totalPrice += (float)$svc['price'];
        $maxDuration = max($maxDuration, (int)$svc['duration']);
        $serviceNames[] = $svc['title'];
    }
    $primaryService = $services[0];

    $refCode = generate_ref_code();

    try {
        $db->beginTransaction();

        // Conflict check with lock
        $stmt = $db->prepare("
            SELECT id FROM bookings 
            WHERE barber_id = ? AND booking_date = ? AND booking_time = ? 
            AND status IN ('pending', 'confirmed', 'pending_approval')
            FOR UPDATE
        ");
        $stmt->execute([$barberId, $bookingDate, $bookingTime]);

        if ($stmt->fetch()) {
            $db->rollBack();
            json_response(['error' => 'Time slot already booked'], 409);
        }

        // Build notes with walk-in info and multi-service data
        $finalNotes = $notes;
        if (count($services) > 1) {
            $multiData = ['__multi__' => $serviceIds];
            if ($notes) $multiData['note'] = $notes;
            $finalNotes = json_encode($multiData);
        }
        if ($guestName || $guestPhone) {
            $walkinInfo = 'Walk-in: ' . ($guestName ?: 'Guest');
            if ($guestPhone) $walkinInfo .= ' | ' . $guestPhone;
            if ($finalNotes) $walkinInfo .= ' | Notes: ' . $finalNotes;
            $finalNotes = $walkinInfo;
        }

        $stmt = $db->prepare("
            INSERT INTO bookings (ref_code, user_id, service_id, barber_id, booking_date, booking_time, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)
        ");
        $stmt->execute([$refCode, $userId, $primaryService['id'], $barberId, $bookingDate, $bookingTime, $finalNotes]);

        $bookingId = $db->lastInsertId();

        $stmt = $db->prepare("
            INSERT INTO bookings_audit (booking_id, action, new_status, performed_by)
            VALUES (?, 'created', 'confirmed', ?)
        ");
        $stmt->execute([$bookingId, $admin['id']]);

        // Notification
        $clientLabel = $userId ? 'registered client' : 'walk-in';
        $serviceLabel = implode(', ', $serviceNames);
        $stmt = $db->prepare("
            INSERT INTO notifications (type, booking_id, message)
            VALUES ('new_booking', ?, ?)
        ");
        $stmt->execute([$bookingId, 'Manual booking created by admin (ref: ' . $refCode . ') — ' . $serviceLabel . ' — ' . $clientLabel]);

        $db->commit();

        json_response([
            'message' => 'Booking created',
            'booking' => [
                'id' => (int)$bookingId,
                'ref_code' => $refCode,
                'service' => implode(', ', $serviceNames),
                'price' => $totalPrice,
                'duration' => $maxDuration,
            ],
        ], 201);

    } catch (Exception $e) {
        $db->rollBack();
        json_response(['error' => 'Failed to create booking'], 500);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Admin actions: cancel, complete, start (in_progress), approve (pending_approval)
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['booking_id'])) {
        json_response(['error' => 'booking_id is required'], 400);
    }

    $bookingId = (int)$input['booking_id'];
    $action = isset($input['action']) ? sanitize_input($input['action']) : 'cancel';
    $reason = isset($input['reason']) ? sanitize_input($input['reason']) : null;

    $stmt = $db->prepare("
        SELECT b.id, b.status, b.ref_code, b.user_id, u.name AS client_name
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
    ");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) {
        json_response(['error' => 'Booking not found'], 404);
    }

    switch ($action) {

        case 'start':
            // confirmed → in_progress (admin clicks "Start" when client sits down)
            if ($booking['status'] !== 'confirmed') {
                json_response(['error' => 'Only confirmed bookings can be started'], 400);
            }
            try {
                $db->beginTransaction();
                $db->prepare("UPDATE bookings SET status = 'in_progress', updated_at = NOW() WHERE id = ?")->execute([$bookingId]);
                $db->prepare("
                    INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
                    VALUES (?, 'started', 'confirmed', 'in_progress', ?, 'Client seated — service in progress')
                ")->execute([$bookingId, $admin['id']]);
                $db->commit();
                json_response(['message' => 'Booking started', 'booking' => ['id' => $booking['id'], 'ref_code' => $booking['ref_code'], 'status' => 'in_progress']]);
            } catch (Exception $e) {
                $db->rollBack();
                json_response(['error' => 'Failed to start booking'], 500);
            }
            break;

        case 'complete':
            // confirmed/in_progress → completed
            if (!in_array($booking['status'], ['confirmed', 'in_progress'])) {
                json_response(['error' => 'Only confirmed or in-progress bookings can be completed'], 400);
            }
            try {
                $db->beginTransaction();
                $oldStatus = $booking['status'];
                $db->prepare("UPDATE bookings SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = ?")->execute([$bookingId]);
                $db->prepare("
                    INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
                    VALUES (?, 'completed', ?, 'completed', ?, 'Marked as completed by admin')
                ")->execute([$bookingId, $oldStatus, $admin['id']]);

                // Strike reset: completing a booking clears ALL strikes (client proved they're real)
                if (!empty($booking['user_id'])) {
                    $db->prepare("
                        UPDATE users SET no_show_count = 0 WHERE id = ? AND no_show_count > 0
                    ")->execute([$booking['user_id']]);
                }

                $db->commit();
                json_response(['message' => 'Booking completed', 'booking' => ['id' => $booking['id'], 'ref_code' => $booking['ref_code']]]);
            } catch (Exception $e) {
                $db->rollBack();
                json_response(['error' => 'Failed to complete booking'], 500);
            }
            break;

        case 'approve':
            // pending_approval → confirmed (admin approves a strike-2 client's booking)
            if ($booking['status'] !== 'pending_approval') {
                json_response(['error' => 'This booking is not pending approval'], 400);
            }
            try {
                $db->beginTransaction();
                $db->prepare("UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = ?")->execute([$bookingId]);
                $db->prepare("
                    INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
                    VALUES (?, 'approved', 'pending_approval', 'confirmed', ?, 'Booking approved by admin')
                ")->execute([$bookingId, $admin['id']]);

                if ($booking['client_name']) {
                    $stmt = $db->prepare("SELECT email FROM users WHERE id = ?");
                    $stmt->execute([$booking['user_id']]);
                    $clientEmail = $stmt->fetchColumn();
                    if ($clientEmail) {
                        $stmt = $db->prepare("
                            INSERT INTO notifications (type, booking_id, message)
                            VALUES ('new_booking', ?, ?)
                        ");
                        $stmt->execute([$bookingId, 'Booking ' . $booking['ref_code'] . ' approved for ' . $booking['client_name']]);
                    }
                }

                $db->commit();
                json_response(['message' => 'Booking approved', 'booking' => ['id' => $booking['id'], 'ref_code' => $booking['ref_code'], 'status' => 'confirmed']]);
            } catch (Exception $e) {
                $db->rollBack();
                json_response(['error' => 'Failed to approve booking'], 500);
            }
            break;

        default:
            // Cancel action (default)
            if ($booking['status'] === 'cancelled' || $booking['status'] === 'late_cancel') {
                json_response(['error' => 'Booking is already cancelled'], 400);
            }
            if ($booking['status'] === 'completed') {
                json_response(['error' => 'Cannot cancel a completed booking'], 400);
            }

            try {
                $db->beginTransaction();
                $oldStatus = $booking['status'];
                $db->prepare("UPDATE bookings SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE id = ?")->execute([$bookingId]);
                $db->prepare("
                    INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
                    VALUES (?, 'cancelled', ?, 'cancelled', ?, ?)
                ")->execute([$bookingId, $oldStatus, $admin['id'], $reason ?: 'Cancelled by admin']);

                $stmt = $db->prepare("
                    INSERT INTO notifications (type, booking_id, message)
                    VALUES ('cancellation', ?, ?)
                ");
                $stmt->execute([$bookingId, 'Booking ' . $booking['ref_code'] . ' cancelled by admin']);

                $db->commit();
                json_response([
                    'message' => 'Booking cancelled',
                    'booking' => ['id' => $booking['id'], 'ref_code' => $booking['ref_code'], 'status' => 'cancelled'],
                ]);
            } catch (Exception $e) {
                $db->rollBack();
                json_response(['error' => 'Failed to cancel booking'], 500);
            }
            break;
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['booking_id'])) {
        json_response(['error' => 'booking_id is required'], 400);
    }
    $bookingId = (int)$input['booking_id'];

    $stmt = $db->prepare("SELECT id, status, ref_code FROM bookings WHERE id = ?");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();
    if (!$booking) {
        json_response(['error' => 'Booking not found'], 404);
    }

    $db->prepare("DELETE FROM bookings WHERE id = ?")->execute([$bookingId]);
    json_response(['message' => 'Booking deleted', 'booking' => ['id' => $booking['id'], 'ref_code' => $booking['ref_code']]]);

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
