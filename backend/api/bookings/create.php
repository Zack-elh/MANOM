<?php
/**
 * MANOM BarberShop - Create Booking API
 * POST /api/bookings/create.php
 * 
 * Supports both single (service_id) and multi-service (service_ids array) booking.
 * Multi-service bookings are created atomically inside a DB transaction.
 * 
 * Rules enforced:
 *   - 2h minimum lead time (cannot book slots starting within 2h)
 *   - Max 2 active future bookings per client
 *   - Strike 2 → booking goes to pending_approval (admin confirms manually)
 *   - Race condition prevented via SELECT ... FOR UPDATE
 */

require_once __DIR__ . '/../middleware.php';
require_once __DIR__ . '/../lib/mail_helper.php';

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

// Support both service_id (single) and service_ids (multi)
$serviceIds = [];
if (isset($input['service_ids']) && is_array($input['service_ids'])) {
    $serviceIds = array_map('intval', $input['service_ids']);
} elseif (isset($input['service_id'])) {
    $serviceIds = [(int)$input['service_id']];
}

if (empty($serviceIds)) {
    json_response(['error' => 'service_id or service_ids is required'], 400);
}

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

// === RULE: 2-hour minimum lead time ===
$slotDateTime = new DateTime($bookingDate . ' ' . $bookingTime);
$now = new DateTime();
$hoursUntilSlot = ($slotDateTime->getTimestamp() - $now->getTimestamp()) / 3600;
if ($hoursUntilSlot < BOOKING_MIN_LEAD_HOURS) {
    json_response([
        'error' => 'Appointments must be booked at least ' . BOOKING_MIN_LEAD_HOURS . ' hours in advance',
    ], 400);
}

// === RULE: Max active bookings per client ===
$stmt = $db->prepare("
    SELECT COUNT(*) FROM bookings
    WHERE user_id = ? AND status IN ('pending', 'confirmed', 'in_progress', 'pending_approval')
    AND (booking_date > CURDATE() OR (booking_date = CURDATE() AND booking_time > CURTIME()))
");
$stmt->execute([$user['id']]);
$activeCount = (int)$stmt->fetchColumn();
if ($activeCount >= MAX_ACTIVE_BOOKINGS) {
    json_response([
        'error' => 'You can have a maximum of ' . MAX_ACTIVE_BOOKINGS . ' active bookings at a time. Please cancel or complete an existing booking first.',
    ], 400);
}

// === RULE: Strike 2 → pending_approval ===
$stmt = $db->prepare("SELECT no_show_count FROM users WHERE id = ?");
$stmt->execute([$user['id']]);
$userStrikes = (int)$stmt->fetchColumn();
$initialStatus = ($userStrikes >= 2) ? 'pending_approval' : 'confirmed';

// Verify barber exists and is active
$stmt = $db->prepare("SELECT id FROM barbers WHERE id = ? AND active = 1");
$stmt->execute([$barberId]);
if (!$stmt->fetch()) {
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

// Fetch all selected services
$placeholders = implode(',', array_fill(0, count($serviceIds), '?'));
$stmt = $db->prepare("SELECT id, title, duration, price, active FROM services WHERE id IN ($placeholders)");
$stmt->execute($serviceIds);
$services = $stmt->fetchAll();

// Validate all services exist and are active
if (count($services) !== count($serviceIds)) {
    json_response(['error' => 'One or more services not found'], 404);
}
foreach ($services as $svc) {
    if (!$svc['active']) {
        json_response(['error' => 'Service "' . $svc['title'] . '" is not available'], 400);
    }
}

// Calculate combined info
$multiServiceIds = [];
$totalPrice = 0;
$maxDuration = 0;
$serviceNames = [];
foreach ($services as $svc) {
    $multiServiceIds[] = $svc['id'];
    $totalPrice += (float)$svc['price'];
    $maxDuration = max($maxDuration, (int)$svc['duration']);
    $serviceNames[] = $svc['title'];
}

// Build notes with multi-service info if more than one service
$finalNotes = $notes;
if (count($services) > 1) {
    $multiData = ['__multi__' => $multiServiceIds];
    if ($notes) {
        $multiData['note'] = $notes;
    }
    $finalNotes = json_encode($multiData);
}

// === Atomic single booking transaction ===
try {
    $db->beginTransaction();

    $refCode = generate_ref_code();
    $primaryService = $services[0];
    $endTime = date('H:i:s', strtotime($bookingTime) + ($maxDuration * 60));

    // Lock + conflict check for this barber+date+time
    $stmt = $db->prepare("
        SELECT id FROM bookings 
        WHERE barber_id = ? AND booking_date = ? AND booking_time = ? 
        AND status IN ('pending', 'confirmed', 'pending_approval')
        FOR UPDATE
    ");
    $stmt->execute([$barberId, $bookingDate, $bookingTime]);
    if ($stmt->fetch()) {
        $db->rollBack();
        json_response(['error' => 'This time slot is already booked'], 409);
    }

    // Overlap check
    $stmt = $db->prepare("
        SELECT b.id FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.barber_id = ? AND b.booking_date = ? 
        AND b.status IN ('pending', 'confirmed', 'pending_approval')
        AND b.booking_time < ? AND (ADDTIME(b.booking_time, SEC_TO_TIME(s.duration * 60)) > ?)
        FOR UPDATE
    ");
    $stmt->execute([$barberId, $bookingDate, $endTime, $bookingTime]);
    if ($stmt->fetch()) {
        $db->rollBack();
        json_response(['error' => 'This time overlaps with an existing booking'], 409);
    }

    // Insert the booking (status depends on strike count)
    $stmt = $db->prepare("
        INSERT INTO bookings (ref_code, user_id, service_id, barber_id, booking_date, booking_time, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$refCode, $user['id'], $primaryService['id'], $barberId, $bookingDate, $bookingTime, $initialStatus, $finalNotes]);

    $bookingId = $db->lastInsertId();

    // Audit log
    $stmt = $db->prepare("
        INSERT INTO bookings_audit (booking_id, action, new_status, performed_by, notes)
        VALUES (?, 'created', ?, ?, ?)
    ");
    $auditNote = $initialStatus === 'pending_approval' ? 'Booking pending admin approval (client has ' . $userStrikes . ' strikes)' : 'Created by client';
    $stmt->execute([$bookingId, $initialStatus, $user['id'], $auditNote]);

    // Create admin notification
    if ($initialStatus === 'pending_approval') {
        $stmt = $db->prepare("
            INSERT INTO notifications (type, booking_id, message)
            VALUES ('new_booking', ?, ?)
        ");
        $stmt->execute([$bookingId, 'New booking from ' . $user['name'] . ' (ref: ' . $refCode . ') — PENDING APPROVAL (' . $userStrikes . ' strikes)']);
    } else {
        $stmt = $db->prepare("
            INSERT INTO notifications (type, booking_id, message)
            VALUES ('new_booking', ?, ?)
        ");
        $stmt->execute([$bookingId, 'New booking from ' . $user['name'] . ' (ref: ' . $refCode . ')']);
    }

    $db->commit();

    // Fetch names for email (before response goes out)
    $stmt = $db->prepare("SELECT name FROM barbers WHERE id = ?");
    $stmt->execute([$barberId]);
    $emailBarberName = $stmt->fetchColumn() ?: 'Barber';

    $stmt = $db->prepare("SELECT name FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $emailUserName = $stmt->fetchColumn() ?: 'Valued Client';

    $emailDate = (new DateTime($bookingDate))->format('l, F j, Y');
    $emailTime = (new DateTime($bookingTime))->format('g:i A');

    // Send confirmation email (non-blocking — runs after response sent)
    $emailBookingId = (int)$bookingId;
    $emailRefCode = $refCode;
    $emailTo = $user['email'];
    $emailServiceNames = $serviceNames;
    $emailDuration = $maxDuration;
    register_shutdown_function(function () use ($emailBookingId, $emailRefCode, $emailTo, $emailUserName, $emailServiceNames, $emailBarberName, $emailDate, $emailTime, $emailDuration) {
        send_booking_confirmation(
            $emailBookingId,
            $emailRefCode,
            $emailTo,
            $emailUserName,
            [
                'service'  => implode(', ', $emailServiceNames),
                'barber'   => $emailBarberName,
                'date'     => $emailDate,
                'time'     => $emailTime,
                'duration' => $emailDuration,
            ]
        );
    });

    json_response([
        'message' => $initialStatus === 'pending_approval'
            ? 'Booking created — pending admin approval due to account restrictions'
            : 'Booking created successfully',
        'booking' => [
            'id'            => (int)$bookingId,
            'ref_code'      => $refCode,
            'service'       => implode(', ', $serviceNames),
            'service_id'    => $primaryService['id'],
            'barber_id'     => $barberId,
            'booking_date'  => $bookingDate,
            'booking_time'  => $bookingTime,
            'status'        => $initialStatus,
            'duration'      => $maxDuration,
            'price'         => $totalPrice,
        ],
    ], 201);

} catch (Exception $e) {
    $db->rollBack();
    json_response(['error' => 'Failed to create booking. Please try again.'], 500);
}
