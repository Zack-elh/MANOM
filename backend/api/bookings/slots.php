<?php
/**
 * MANOM BarberShop - Available Time Slots API
 * GET /api/bookings/slots.php?barber_id=1&date=2026-06-15&service_id=1
 * 
 * Returns available time slots for a barber on a specific date
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('slots');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$barberId = isset($_GET['barber_id']) ? (int)$_GET['barber_id'] : 0;
$date = isset($_GET['date']) ? sanitize_input($_GET['date']) : '';
$serviceId = isset($_GET['service_id']) ? (int)$_GET['service_id'] : 0;

if (!$barberId || !$date || !$serviceId) {
    json_response(['error' => 'barber_id, date, and service_id are required'], 400);
}

// Validate date format
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    json_response(['error' => 'Invalid date format. Use YYYY-MM-DD'], 400);
}

$dateObj = new DateTime($date);

// Can't book in the past
if ($dateObj < new DateTime('today')) {
    json_response(['error' => 'Cannot view slots for past dates'], 400);
}

$db = db();

// Get service duration
$stmt = $db->prepare("SELECT duration FROM services WHERE id = ? AND active = 1");
$stmt->execute([$serviceId]);
$service = $stmt->fetch();

if (!$service) {
    json_response(['error' => 'Service not found'], 404);
}

$duration = $service['duration'];

// Get barber availability for this day of week
$dayOfWeek = (int)$dateObj->format('w');
$stmt = $db->prepare("
    SELECT start_time, end_time FROM barber_availability 
    WHERE barber_id = ? AND day_of_week = ? AND active = 1
    ORDER BY start_time
");
$stmt->execute([$barberId, $dayOfWeek]);
$availability = $stmt->fetchAll();

if (empty($availability)) {
    json_response(['slots' => [], 'message' => 'Barber not available on this day']);
}

// Get existing bookings for this barber on this date
$stmt = $db->prepare("
    SELECT b.booking_time, s.duration
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.barber_id = ? AND b.booking_date = ? 
    AND b.status IN ('pending', 'confirmed')
");
$stmt->execute([$barberId, $date]);
$existingBookings = $stmt->fetchAll();

// Generate available slots (30-minute intervals)
$allSlots = [];
$slotInterval = 30; // minutes

foreach ($availability as $avail) {
    $start = strtotime($avail['start_time']);
    $end = strtotime($avail['end_time']);

    while ($start + ($duration * 60) <= $end) {
        $slotTime = date('H:i:s', $start);
        $allSlots[] = $slotTime;
        $start += $slotInterval * 60;
    }
}

// Build all slots with availability status
$allSlotsWithStatus = [];
$now = new DateTime();
$isToday = ($date === $now->format('Y-m-d'));
$minLeadTime = new DateInterval('PT' . BOOKING_MIN_LEAD_HOURS . 'H');
$earliestBookable = (clone $now)->add($minLeadTime);

foreach ($allSlots as $slot) {
    $slotDateTime = new DateTime($date . ' ' . $slot);

    // Skip past slots if today
    if ($isToday && $slotDateTime <= $now) {
        continue;
    }

    // Skip slots within minimum lead time (2h)
    if ($slotDateTime <= $earliestBookable) {
        continue;
    }

    $isAvailable = true;

    foreach ($existingBookings as $booking) {
        $bookingStart = strtotime($booking['booking_time']);
        $bookingEnd = $bookingStart + ($booking['duration'] * 60);
        $slotStart = strtotime($slot);
        $slotEnd = $slotStart + ($duration * 60);

        // Check for overlap
        if ($slotStart < $bookingEnd && $slotEnd > $bookingStart) {
            $isAvailable = false;
            break;
        }
    }

    $allSlotsWithStatus[] = [
        'time'      => date('H:i', strtotime($slot)),
        'datetime'  => $date . ' ' . $slot,
        'available' => $isAvailable,
    ];
}

json_response([
    'date'      => $date,
    'barber_id' => $barberId,
    'duration'  => $duration,
    'slots'     => array_values($allSlotsWithStatus),
]);
