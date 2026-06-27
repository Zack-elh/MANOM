<?php
/**
 * MANOM BarberShop - No-Show Management API
 * POST /api/admin/no-show.php              - Mark booking as no-show (strike)
 * DELETE /api/admin/no-show.php            - Remove no-show (forgive strike)
 * 
 * Both actions update the strikes audit table for full history.
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('admin_no_show');

$admin = require_admin();
$db = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['booking_id'])) {
        json_response(['error' => 'booking_id is required'], 400);
    }

    $bookingId = (int)$input['booking_id'];

    $stmt = $db->prepare("
        SELECT b.id, b.user_id, b.status, b.ref_code,
               u.name AS client_name, u.no_show_count
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
    ");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) {
        json_response(['error' => 'Booking not found'], 404);
    }

    if ($booking['status'] === 'no_show') {
        json_response(['error' => 'Already marked as no-show'], 400);
    }

    if ($booking['status'] === 'cancelled' || $booking['status'] === 'late_cancel') {
        json_response(['error' => 'Cannot mark cancelled booking as no-show'], 400);
    }

    if (empty($booking['user_id'])) {
        json_response(['error' => 'No client attached to this booking (walk-in)'], 400);
    }

    try {
        $db->beginTransaction();

        // Update booking status
        $stmt = $db->prepare("UPDATE bookings SET status = 'no_show', updated_at = NOW() WHERE id = ?");
        $stmt->execute([$bookingId]);

        // Increment user no_show_count by 2 (no-show is serious) + update last_strike_at
        $stmt = $db->prepare("
            UPDATE users SET no_show_count = no_show_count + 2, last_strike_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$booking['user_id']]);

        // Record strike in audit table (2 entries for tracking)
        $stmt = $db->prepare("
            INSERT INTO strikes (user_id, booking_id, strike_type)
            VALUES (?, ?, 'no_show')
        ");
        $stmt->execute([$booking['user_id'], $bookingId]);

        // Audit log
        $stmt = $db->prepare("
            INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
            VALUES (?, 'no_show', ?, 'no_show', ?, 'Marked as no-show by admin')
        ");
        $stmt->execute([$bookingId, $booking['status'], $admin['id']]);

        // Create admin notification
        $stmt = $db->prepare("
            INSERT INTO notifications (type, booking_id, message)
            VALUES ('no_show', ?, ?)
        ");
        $stmt->execute([$bookingId, 'No-show marked for ' . $booking['client_name'] . ' (ref: ' . $booking['ref_code'] . ')']);

        // Auto-decay: if last strike was >30 days ago, decrement by 1
        $stmt = $db->prepare("
            UPDATE users SET no_show_count = GREATEST(no_show_count - 1, 0)
            WHERE id = ? AND last_strike_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
            AND no_show_count > 0
        ");
        $stmt->execute([$booking['user_id']]);

        // Get updated count
        $stmt = $db->prepare("SELECT no_show_count FROM users WHERE id = ?");
        $stmt->execute([$booking['user_id']]);
        $updated = $stmt->fetch();

        $db->commit();

        // Determine restriction level
        $level = 'none';
        if ($updated['no_show_count'] >= 3) $level = 'blocked';
        elseif ($updated['no_show_count'] >= 2) $level = 'pending_approval';
        elseif ($updated['no_show_count'] >= 1) $level = 'warning';

        json_response([
            'message' => 'Booking marked as no-show',
            'client_name' => $booking['client_name'],
            'no_show_count' => (int)$updated['no_show_count'],
            'restriction_level' => $level,
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        json_response(['error' => 'Failed to mark no-show'], 500);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['booking_id'])) {
        json_response(['error' => 'booking_id is required'], 400);
    }

    $bookingId = (int)$input['booking_id'];

    $stmt = $db->prepare("
        SELECT b.id, b.user_id, b.status,
               u.name AS client_name, u.no_show_count
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
    ");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) {
        json_response(['error' => 'Booking not found'], 404);
    }

    if ($booking['status'] !== 'no_show') {
        json_response(['error' => 'Booking is not a no-show'], 400);
    }

    if (empty($booking['user_id'])) {
        json_response(['error' => 'No client attached'], 400);
    }

    try {
        $db->beginTransaction();

        // Restore booking status to confirmed
        $stmt = $db->prepare("UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = ?");
        $stmt->execute([$bookingId]);

        // Decrement user no_show_count
        $stmt = $db->prepare("
            UPDATE users SET no_show_count = GREATEST(no_show_count - 1, 0)
            WHERE id = ? AND no_show_count > 0
        ");
        $stmt->execute([$booking['user_id']]);

        // Mark strike as forgiven in audit table
        $stmt = $db->prepare("
            UPDATE strikes SET forgiven_at = NOW(), forgiven_by = ?
            WHERE booking_id = ? AND strike_type = 'no_show' AND forgiven_at IS NULL
            LIMIT 1
        ");
        $stmt->execute([$admin['id'], $bookingId]);

        // Audit log
        $stmt = $db->prepare("
            INSERT INTO bookings_audit (booking_id, action, old_status, new_status, performed_by, notes)
            VALUES (?, 'forgiven', 'no_show', 'confirmed', ?, 'No-show forgiven by admin')
        ");
        $stmt->execute([$bookingId, $admin['id']]);

        $stmt = $db->prepare("SELECT no_show_count FROM users WHERE id = ?");
        $stmt->execute([$booking['user_id']]);
        $updated = $stmt->fetch();

        $db->commit();

        $level = 'none';
        if ($updated['no_show_count'] >= 3) $level = 'blocked';
        elseif ($updated['no_show_count'] >= 2) $level = 'pending_approval';
        elseif ($updated['no_show_count'] >= 1) $level = 'warning';

        json_response([
            'message' => 'No-show forgiven',
            'client_name' => $booking['client_name'],
            'no_show_count' => (int)$updated['no_show_count'],
            'restriction_level' => $level,
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        json_response(['error' => 'Failed to forgive no-show'], 500);
    }

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
