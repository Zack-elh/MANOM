<?php
/**
 * MANOM BarberShop - Cancel Booking API
 * POST /api/bookings/cancel.php
 * 
 * Cancellation rules:
 *   >24h before appointment → cancelled (no strike)
 *   2-24h before            → cancelled + 1 strike
 *   <2h before              → late_cancel + 2 strikes
 *   Walk-ins (no user_id)   → cannot cancel online
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
if ($booking['status'] === 'cancelled' || $booking['status'] === 'late_cancel') {
    json_response(['error' => 'Booking is already cancelled'], 400);
}

if ($booking['status'] === 'completed') {
    json_response(['error' => 'Cannot cancel a completed booking'], 400);
}

if ($booking['status'] === 'no_show') {
    json_response(['error' => 'Cannot cancel a no-show booking'], 400);
}

// Calculate hours until appointment
$bookingDateTime = new DateTime($booking['booking_date'] . ' ' . $booking['booking_time']);
$now = new DateTime();
$hoursUntil = ($bookingDateTime->getTimestamp() - $now->getTimestamp()) / 3600;

try {
    $db->beginTransaction();

    $oldStatus = $booking['status'];

    if ($hoursUntil < LATE_CANCEL_THRESHOLD) {
        // LATE CANCEL: <2h before → late_cancel status + 2 strikes
        $stmt = $db->prepare("
            UPDATE bookings SET status = 'late_cancel', cancelled_at = NOW(), updated_at = NOW() WHERE id = ?
        ");
        $stmt->execute([$bookingId]);

        // Add 2 strikes
        $stmt = $db->prepare("
            UPDATE users SET no_show_count = no_show_count + 2, last_strike_at = NOW()
            WHERE id = ? AND role = 'client'
        ");
        $stmt->execute([$user['id']]);

        // Record strike in audit table
        $stmt = $db->prepare("
            INSERT INTO strikes (user_id, booking_id, strike_type)
            VALUES (?, ?, 'late_cancel')
        ");
        $stmt->execute([$user['id'], $bookingId]);

        // Audit log
        $stmt = $db->prepare("
            INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
            VALUES (?, 'late_cancel', ?, 'late_cancel', ?, ?)
        ");
        $stmt->execute([$bookingId, $oldStatus, $user['id'], 'Late cancellation (less than 2h before appointment)']);

        // Create admin notification
        $stmt = $db->prepare("
            INSERT INTO notifications (type, booking_id, message)
            VALUES ('late_cancel', ?, ?)
        ");
        $stmt->execute([$bookingId, 'Late cancellation by ' . $user['name'] . ' (ref: ' . $booking['ref_code'] . ') — 2 strikes added']);

        // Get updated count
        $stmt = $db->prepare("SELECT no_show_count FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $updated = $stmt->fetch();

        $db->commit();

        json_response([
            'message' => 'Booking cancelled (late cancellation — 2 strikes added)',
            'strike' => true,
            'strike_count' => 2,
            'no_show_count' => (int)$updated['no_show_count'],
            'booking' => [
                'id'           => $booking['id'],
                'ref_code'     => $booking['ref_code'],
                'status'       => 'late_cancel',
                'service'      => $booking['service_title'],
                'booking_date' => $booking['booking_date'],
                'booking_time' => $booking['booking_time'],
            ],
        ]);

    } elseif ($hoursUntil <= CANCEL_WINDOW_HOURS) {
        // SHORT NOTICE CANCEL: 2-24h before → cancelled + 1 strike
        $stmt = $db->prepare("
            UPDATE bookings SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE id = ?
        ");
        $stmt->execute([$bookingId]);

        // Add 1 strike
        $stmt = $db->prepare("
            UPDATE users SET no_show_count = no_show_count + 1, last_strike_at = NOW()
            WHERE id = ? AND role = 'client'
        ");
        $stmt->execute([$user['id']]);

        // Record strike in audit table
        $stmt = $db->prepare("
            INSERT INTO strikes (user_id, booking_id, strike_type)
            VALUES (?, ?, 'late_cancel')
        ");
        $stmt->execute([$user['id'], $bookingId]);

        // Audit log
        $stmt = $db->prepare("
            INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
            VALUES (?, 'cancelled', ?, 'cancelled', ?, ?)
        ");
        $stmt->execute([$bookingId, $oldStatus, $user['id'], 'Short-notice cancellation (2-24h before appointment)']);

        // Create admin notification
        $stmt = $db->prepare("
            INSERT INTO notifications (type, booking_id, message)
            VALUES ('late_cancel', ?, ?)
        ");
        $stmt->execute([$bookingId, 'Short-notice cancellation by ' . $user['name'] . ' (ref: ' . $booking['ref_code'] . ') — 1 strike added']);

        // Get updated count
        $stmt = $db->prepare("SELECT no_show_count FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $updated = $stmt->fetch();

        $db->commit();

        json_response([
            'message' => 'Booking cancelled (short notice — 1 strike added)',
            'strike' => true,
            'strike_count' => 1,
            'no_show_count' => (int)$updated['no_show_count'],
            'booking' => [
                'id'           => $booking['id'],
                'ref_code'     => $booking['ref_code'],
                'status'       => 'cancelled',
                'service'      => $booking['service_title'],
                'booking_date' => $booking['booking_date'],
                'booking_time' => $booking['booking_time'],
            ],
        ]);

    } else {
        // FREE CANCEL: >24h before → cancelled (no strike)
        $stmt = $db->prepare("
            UPDATE bookings SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE id = ?
        ");
        $stmt->execute([$bookingId]);

        // Audit log
        $stmt = $db->prepare("
            INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
            VALUES (?, 'cancelled', ?, 'cancelled', ?, 'Cancelled by client')
        ");
        $stmt->execute([$bookingId, $oldStatus, $user['id']]);

        // Create admin notification
        $stmt = $db->prepare("
            INSERT INTO notifications (type, booking_id, message)
            VALUES ('cancellation', ?, ?)
        ");
        $stmt->execute([$bookingId, 'Booking cancelled by ' . $user['name'] . ' (ref: ' . $booking['ref_code'] . ')']);

        $db->commit();

        json_response([
            'message' => 'Booking cancelled successfully',
            'strike' => false,
            'booking' => [
                'id'           => $booking['id'],
                'ref_code'     => $booking['ref_code'],
                'status'       => 'cancelled',
                'service'      => $booking['service_title'],
                'booking_date' => $booking['booking_date'],
                'booking_time' => $booking['booking_time'],
            ],
        ]);
    }

} catch (Exception $e) {
    $db->rollBack();
    json_response(['error' => 'Failed to cancel booking. Please try again.'], 500);
}
