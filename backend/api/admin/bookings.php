<?php
/**
 * MANOM BarberShop - Admin Bookings API
 * GET  /api/admin/bookings.php          - List all bookings
 * POST /api/admin/bookings.php          - Create manual booking (no user_id)
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
            s.title AS service_title, s.duration, s.price,
            br.name AS barber_name,
            u.name AS client_name, u.email AS client_email, u.phone AS client_phone
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
        $sql .= " AND (b.ref_code LIKE ? OR u.name LIKE ? OR u.email LIKE ?)";
        $searchTerm = "%{$search}%";
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
    // Admin creates manual booking (user_id nullable)
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        json_response(['error' => 'Invalid request body'], 400);
    }

    $error = validate_required(['service_id', 'barber_id', 'booking_date', 'booking_time'], $input);
    if ($error) {
        json_response(['error' => $error], 400);
    }

    $serviceId = (int)$input['service_id'];
    $barberId = (int)$input['barber_id'];
    $bookingDate = sanitize_input($input['booking_date']);
    $bookingTime = sanitize_input($input['booking_time']);
    $userId = !empty($input['user_id']) ? (int)$input['user_id'] : null;
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

    $refCode = generate_ref_code();

    try {
        $db->beginTransaction();

        // Conflict check (Rule 3)
        $stmt = $db->prepare("
            SELECT id FROM bookings 
            WHERE barber_id = ? AND booking_date = ? AND booking_time = ? 
            AND status IN ('pending', 'confirmed')
            FOR UPDATE
        ");
        $stmt->execute([$barberId, $bookingDate, $bookingTime]);

        if ($stmt->fetch()) {
            $db->rollBack();
            json_response(['error' => 'Time slot already booked'], 409);
        }

        $stmt = $db->prepare("
            INSERT INTO bookings (ref_code, user_id, service_id, barber_id, booking_date, booking_time, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)
        ");
        $stmt->execute([$refCode, $userId, $serviceId, $barberId, $bookingDate, $bookingTime, $notes]);

        $bookingId = $db->lastInsertId();

        $stmt = $db->prepare("
            INSERT INTO bookings_audit (booking_id, action, new_status, performed_by)
            VALUES (?, 'created', 'confirmed', ?)
        ");
        $stmt->execute([$bookingId, $admin['id']]);

        $db->commit();

        json_response([
            'message' => 'Booking created',
            'booking' => ['id' => (int)$bookingId, 'ref_code' => $refCode],
        ], 201);

    } catch (Exception $e) {
        $db->rollBack();
        json_response(['error' => 'Failed to create booking'], 500);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Admin cancel booking
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['booking_id'])) {
        json_response(['error' => 'booking_id is required'], 400);
    }

    $bookingId = (int)$input['booking_id'];
    $reason = isset($input['reason']) ? sanitize_input($input['reason']) : 'Cancelled by admin';

    $stmt = $db->prepare("SELECT id, status, ref_code FROM bookings WHERE id = ?");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) {
        json_response(['error' => 'Booking not found'], 404);
    }

    if ($booking['status'] === 'cancelled') {
        json_response(['error' => 'Booking is already cancelled'], 400);
    }

    if ($booking['status'] === 'completed') {
        json_response(['error' => 'Cannot cancel a completed booking'], 400);
    }

    try {
        $db->beginTransaction();

        $oldStatus = $booking['status'];

        $stmt = $db->prepare("UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = ?");
        $stmt->execute([$bookingId]);

        $stmt = $db->prepare("
            INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
            VALUES (?, 'cancelled', ?, 'cancelled', ?, ?)
        ");
        $stmt->execute([$bookingId, $oldStatus, $admin['id'], $reason]);

        $db->commit();

        json_response([
            'message' => 'Booking cancelled',
            'booking' => [
                'id' => $booking['id'],
                'ref_code' => $booking['ref_code'],
                'status' => 'cancelled',
            ],
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        json_response(['error' => 'Failed to cancel booking'], 500);
    }

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
