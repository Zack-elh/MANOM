<?php
/**
 * MANOM BarberShop - Create Booking API
 * POST /api/bookings/create.php
 * 
 * Rule 3: Conflict check happens INSIDE the transaction
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('create_booking');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$user = require_auth();

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    json_response(['error' => 'Invalid request body'], 400);
}

// Validate required fields
$error = validate_required(['service_id', 'barber_id', 'booking_date', 'booking_time'], $input);
if ($error) {
    json_response(['error' => $error], 400);
}

$serviceId = (int)$input['service_id'];
$barberId = (int)$input['barber_id'];
$bookingDate = sanitize_input($input['booking_date']);
$bookingTime = sanitize_input($input['booking_time']);
$notes = isset($input['notes']) ? sanitize_input($input['notes']) : null;

// Validate date format (YYYY-MM-DD)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $bookingDate)) {
    json_response(['error' => 'Invalid date format. Use YYYY-MM-DD'], 400);
}

// Validate time format (HH:MM or HH:MM:SS)
if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $bookingTime)) {
    json_response(['error' => 'Invalid time format. Use HH:MM'], 400);
}

// Normalize time to HH:MM:SS
if (strlen($bookingTime) === 5) {
    $bookingTime .= ':00';
}

// Validate date is not in the past
$dateObj = new DateTime($bookingDate);
if ($dateObj < new DateTime('today')) {
    json_response(['error' => 'Cannot book appointments in the past'], 400);
}

$db = db();

// Verify service exists and is active
$stmt = $db->prepare("SELECT id, duration, price FROM services WHERE id = ? AND active = 1");
$stmt->execute([$serviceId]);
$service = $stmt->fetch();

if (!$service) {
    json_response(['error' => 'Service not found or unavailable'], 404);
}

// Verify barber exists and is active
$stmt = $db->prepare("SELECT id FROM barbers WHERE id = ? AND active = 1");
$stmt->execute([$barberId]);
$barber = $stmt->fetch();

if (!$barber) {
    json_response(['error' => 'Barber not found or unavailable'], 404);
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

// Generate ref code
$refCode = generate_ref_code();

// === RULE 3: Conflict check INSIDE transaction ===
try {
    $db->beginTransaction();

    // Lock the bookings table for this barber+date+time to prevent race conditions
    $stmt = $db->prepare("
        SELECT id FROM bookings 
        WHERE barber_id = ? AND booking_date = ? AND booking_time = ? 
        AND status IN ('pending', 'confirmed')
        FOR UPDATE
    ");
    $stmt->execute([$barberId, $bookingDate, $bookingTime]);

    if ($stmt->fetch()) {
        $db->rollBack();
        json_response(['error' => 'This time slot is already booked'], 409);
    }

    // Also check for overlapping bookings (same barber, overlapping time window)
    $endTime = date('H:i:s', strtotime($bookingTime) + ($service['duration'] * 60));
    $stmt = $db->prepare("
        SELECT b.id FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.barber_id = ? AND b.booking_date = ? 
        AND b.status IN ('pending', 'confirmed')
        AND b.booking_time < ? AND (ADDTIME(b.booking_time, SEC_TO_TIME(s.duration * 60)) > ?)
        FOR UPDATE
    ");
    $stmt->execute([$barberId, $bookingDate, $endTime, $bookingTime]);

    if ($stmt->fetch()) {
        $db->rollBack();
        json_response(['error' => 'This time slot overlaps with an existing booking'], 409);
    }

    // Insert the booking
    $stmt = $db->prepare("
        INSERT INTO bookings (ref_code, user_id, service_id, barber_id, booking_date, booking_time, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)
    ");
    $stmt->execute([$refCode, $user['id'], $serviceId, $barberId, $bookingDate, $bookingTime, $notes]);

    $bookingId = $db->lastInsertId();

    // Audit log
    $stmt = $db->prepare("
        INSERT INTO bookings_audit (booking_id, action, new_status, performed_by)
        VALUES (?, 'created', 'confirmed', ?)
    ");
    $stmt->execute([$bookingId, $user['id']]);

    $db->commit();

    json_response([
        'message' => 'Booking created successfully',
        'booking' => [
            'id'            => (int)$bookingId,
            'ref_code'      => $refCode,
            'service'       => $service['title'] ?? $input['service_id'],
            'barber_id'     => $barberId,
            'booking_date'  => $bookingDate,
            'booking_time'  => $bookingTime,
            'status'        => 'confirmed',
            'duration'      => $service['duration'],
            'price'         => $service['price'],
        ],
    ], 201);

} catch (Exception $e) {
    $db->rollBack();
    json_response(['error' => 'Failed to create booking. Please try again.'], 500);
}
