<?php
/**
 * MANOM BarberShop - My Bookings API
 * GET /api/bookings/my-bookings.php
 * 
 * Auto-completes past bookings on load (Rule: no cron needed)
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('my_bookings');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$user = require_auth();

// Auto-complete past bookings
auto_complete_bookings();

// Optional status filter
$status = isset($_GET['status']) ? sanitize_input($_GET['status']) : null;
$validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

if ($status && !in_array($status, $validStatuses)) {
    json_response(['error' => 'Invalid status filter'], 400);
}

$db = db();

$sql = "
    SELECT 
        b.id, b.ref_code, b.booking_date, b.booking_time, b.status, b.notes, b.created_at,
        s.title AS service_title, s.duration, s.price,
        br.name AS barber_name, br.specialty
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN barbers br ON b.barber_id = br.id
    WHERE b.user_id = ?
";

$params = [$user['id']];

if ($status) {
    $sql .= " AND b.status = ?";
    $params[] = $status;
}

$sql .= " ORDER BY b.booking_date DESC, b.booking_time DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$bookings = $stmt->fetchAll();

// Add can_cancel flag for each booking
$cancelWindow = CANCEL_WINDOW_HOURS;
foreach ($bookings as &$booking) {
    $bookingDateTime = new DateTime($booking['booking_date'] . ' ' . $booking['booking_time']);
    $now = new DateTime();
    $hoursUntil = ($bookingDateTime->getTimestamp() - $now->getTimestamp()) / 3600;

    $booking['can_cancel'] = (
        in_array($booking['status'], ['pending', 'confirmed']) &&
        $hoursUntil > $cancelWindow
    );
    $booking['hours_until'] = round($hoursUntil, 1);

    // Ensure ref_code is always present
    if (empty($booking['ref_code'])) {
        $booking['ref_code'] = 'MNM-' . str_pad($booking['id'], 6, '0', STR_PAD_LEFT);
    }
}
unset($booking);

json_response([
    'bookings' => $bookings,
    'total'    => count($bookings),
]);
