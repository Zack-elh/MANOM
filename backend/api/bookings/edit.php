<?php
/**
 * MANOM BarberShop - Edit Booking API
 * PUT /api/bookings/edit.php
 * 
 * Allows clients to reschedule: change service, barber, date, and/or time.
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('edit_booking');

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_response(['error' => 'Method not allowed'], 405);
}

$user = require_auth();

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['booking_id'])) {
    json_response(['error' => 'booking_id is required'], 400);
}

$bookingId = (int)$input['booking_id'];

$db = db();

// Fetch the booking and verify ownership
$stmt = $db->prepare("
    SELECT b.*, s.duration AS service_duration, s.price AS service_price
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.id = ? AND b.user_id = ?
");
$stmt->execute([$bookingId, $user['id']]);
$booking = $stmt->fetch();

if (!$booking) {
    json_response(['error' => 'Booking not found'], 404);
}

// Check if booking can be edited
if (in_array($booking['status'], ['cancelled', 'completed'])) {
    json_response(['error' => 'Cannot edit a ' . $booking['status'] . ' booking'], 400);
}

// Determine service(s)
$serviceIds = [];
if (isset($input['service_ids']) && is_array($input['service_ids'])) {
    $serviceIds = array_map('intval', $input['service_ids']);
} elseif (isset($input['service_id'])) {
    $serviceIds = [(int)$input['service_id']];
} else {
    $serviceIds = [(int)$booking['service_id']];
}

$barberId = isset($input['barber_id']) ? (int)$input['barber_id'] : (int)$booking['barber_id'];
$bookingDate = isset($input['booking_date']) ? sanitize_input($input['booking_date']) : $booking['booking_date'];
$bookingTime = isset($input['booking_time']) ? sanitize_input($input['booking_time']) : $booking['booking_time'];

// Normalize time
if (strlen($bookingTime) === 5) {
    $bookingTime .= ':00';
}

// Validate date format if changed
if (isset($input['booking_date']) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $bookingDate)) {
    json_response(['error' => 'Invalid date format. Use YYYY-MM-DD'], 400);
}

// Validate time format if changed
if (isset($input['booking_time']) && !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $bookingTime)) {
    json_response(['error' => 'Invalid time format. Use HH:MM'], 400);
}

// Validate date is not in the past
$dateObj = new DateTime($bookingDate);
if ($dateObj < new DateTime('today')) {
    json_response(['error' => 'Cannot book appointments in the past'], 400);
}

// Verify all selected services exist and are active
$placeholders = implode(',', array_fill(0, count($serviceIds), '?'));
$stmt = $db->prepare("SELECT id, title, duration, price, active FROM services WHERE id IN ($placeholders)");
$stmt->execute($serviceIds);
$newServices = $stmt->fetchAll();
if (count($newServices) !== count($serviceIds)) {
    json_response(['error' => 'One or more services not found'], 404);
}
foreach ($newServices as $svc) {
    if (!$svc['active']) {
        json_response(['error' => 'Service "' . $svc['title'] . '" is not available'], 400);
    }
}

// If barber changed, verify new barber exists and is active
if (isset($input['barber_id'])) {
    $stmt = $db->prepare("SELECT id FROM barbers WHERE id = ? AND active = 1");
    $stmt->execute([$barberId]);
    if (!$stmt->fetch()) {
        json_response(['error' => 'Barber not found or unavailable'], 404);
    }
}

// Check barber availability for this day of week
$dayOfWeek = (int)$dateObj->format('w');
$stmt = $db->prepare("
    SELECT id FROM barber_availability 
    WHERE barber_id = ? AND day_of_week = ? AND active = 1 
    AND start_time <= ? AND end_time >= ?
");
$stmt->execute([$barberId, $dayOfWeek, $bookingTime, $bookingTime]);
if (!$stmt->fetch()) {
    json_response(['error' => 'Barber is not available at this time'], 400);
}

try {
    $db->beginTransaction();

    // Build updated notes with multi-service data
    $updatedNotes = $booking['notes'];
    if (count($newServices) > 1) {
        $multiIds = array_column($newServices, 'id');
        $multiData = ['__multi__' => $multiIds];
        // Preserve any existing note text from the original notes
        $existingNote = null;
        $origParsed = json_decode($booking['notes'], true);
        if (isset($origParsed['__multi__'])) {
            $existingNote = $origParsed['note'] ?? null;
        } elseif ($booking['notes']) {
            $existingNote = $booking['notes'];
        }
        if ($existingNote) {
            $multiData['note'] = $existingNote;
        }
        $updatedNotes = json_encode($multiData);
    } elseif (count($newServices) === 1) {
        // Switching to single service: strip multi-service JSON
        $origParsed = json_decode($booking['notes'], true);
        if (isset($origParsed['__multi__'])) {
            $updatedNotes = $origParsed['note'] ?? null;
        }
    }

    // Determine max duration for overlap check
    $maxDuration = max(array_column($newServices, 'duration'));

    // Lock + conflict check for this barber+date+time (exclude own booking)
    $stmt = $db->prepare("
        SELECT id FROM bookings 
        WHERE barber_id = ? AND booking_date = ? AND booking_time = ? 
        AND id != ? AND status IN ('pending', 'confirmed')
        FOR UPDATE
    ");
    $stmt->execute([$barberId, $bookingDate, $bookingTime, $bookingId]);
    if ($stmt->fetch()) {
        $db->rollBack();
        json_response(['error' => 'This time slot is already booked'], 409);
    }

    // Overlap check (exclude own booking)
    $endTime = date('H:i:s', strtotime($bookingTime) + ($maxDuration * 60));
    $stmt = $db->prepare("
        SELECT b.id FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.barber_id = ? AND b.booking_date = ? 
        AND b.id != ?
        AND b.status IN ('pending', 'confirmed')
        AND b.booking_time < ? AND (ADDTIME(b.booking_time, SEC_TO_TIME(s.duration * 60)) > ?)
        FOR UPDATE
    ");
    $stmt->execute([$barberId, $bookingDate, $bookingId, $endTime, $bookingTime]);
    if ($stmt->fetch()) {
        $db->rollBack();
        json_response(['error' => 'This time overlaps with an existing booking'], 409);
    }

    // Update the booking
    $primaryService = $newServices[0];
    $stmt = $db->prepare("
        UPDATE bookings 
        SET service_id = ?, barber_id = ?, booking_date = ?, booking_time = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$primaryService['id'], $barberId, $bookingDate, $bookingTime, $updatedNotes, $bookingId]);

    // Audit log
    $oldStatus = $booking['status'];
    $stmt = $db->prepare("
        INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
        VALUES (?, 'edited', ?, ?, ?, ?)
    ");
    $stmt->execute([$bookingId, $oldStatus, $oldStatus, $user['id'], 'Edited by client']);

    $db->commit();

    json_response([
        'message' => 'Booking updated successfully',
        'booking' => [
            'id'           => $bookingId,
            'ref_code'     => $booking['ref_code'],
            'status'       => $oldStatus,
            'service_ids'  => $serviceIds,
            'barber_id'    => $barberId,
            'booking_date' => $bookingDate,
            'booking_time' => $bookingTime,
        ],
    ]);

} catch (Exception $e) {
    $db->rollBack();
    json_response(['error' => 'Failed to update booking. Please try again.'], 500);
}
