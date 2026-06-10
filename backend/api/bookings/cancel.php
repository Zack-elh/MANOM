<?php
/**
 * MANOM BarberShop - Cancel Booking API
 * POST /api/bookings/cancel.php
 * 
 * Rule: Cancel window >24h enforced server-side, not just UI
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('cancel_booking');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$user = require_auth();

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['booking_id'])) {
    json_response(['error' => 'booking_id is required'], 400);
}

$bookingId = (int)$input['booking_id'];

$db = db();

// Fetch the booking
$stmt = $db->prepare("
    SELECT b.*, s.title AS service_title
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.id = ? AND b.user_id = ?
");
$stmt->execute([$bookingId, $user['id']]);
$booking = $stmt->fetch();

if (!$booking) {
    json_response(['error' => 'Booking not found'], 404);
}

// Check if already cancelled or completed
if ($booking['status'] === 'cancelled') {
    json_response(['error' => 'Booking is already cancelled'], 400);
}

if ($booking['status'] === 'completed') {
    json_response(['error' => 'Cannot cancel a completed booking'], 400);
}

// ENFORCE CANCEL WINDOW: Must be >24h before appointment
$bookingDateTime = new DateTime($booking['booking_date'] . ' ' . $booking['booking_time']);
$now = new DateTime();
$hoursUntil = ($bookingDateTime->getTimestamp() - $now->getTimestamp()) / 3600;

if ($hoursUntil <= CANCEL_WINDOW_HOURS) {
    json_response([
        'error' => 'Bookings can only be cancelled more than ' . CANCEL_WINDOW_HOURS . ' hours before the appointment',
        'hours_until' => round($hoursUntil, 1),
        'cancel_window' => CANCEL_WINDOW_HOURS,
    ], 400);
}

// Cancel the booking
try {
    $db->beginTransaction();

    $oldStatus = $booking['status'];

    $stmt = $db->prepare("
        UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = ?
    ");
    $stmt->execute([$bookingId]);

    // Audit log
    $stmt = $db->prepare("
        INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
        VALUES (?, 'cancelled', ?, 'cancelled', ?, ?)
    ");
    $stmt->execute([$bookingId, $oldStatus, $user['id'], 'Cancelled by client']);

    $db->commit();

    json_response([
        'message' => 'Booking cancelled successfully',
        'booking' => [
            'id'           => $booking['id'],
            'ref_code'     => $booking['ref_code'],
            'status'       => 'cancelled',
            'service'      => $booking['service_title'],
            'booking_date' => $booking['booking_date'],
            'booking_time' => $booking['booking_time'],
        ],
    ]);

} catch (Exception $e) {
    $db->rollBack();
    json_response(['error' => 'Failed to cancel booking. Please try again.'], 500);
}
