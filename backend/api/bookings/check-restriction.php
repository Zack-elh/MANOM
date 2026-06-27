<?php
/**
 * MANOM BarberShop - Check User Restriction API
 * GET /api/bookings/check-restriction.php - Check if current user is restricted
 * 
 * Restriction levels:
 *   0 strikes → none
 *   1 strike  → warning
 *   2 strikes → pending_approval (admin must manually confirm)
 *   3 strikes → blocked (must call shop)
 * 
 * 30-day decay: strikes older than 30 days from last_strike_at are auto-reduced.
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('check_restriction');

$user = require_auth();
$db = db();

// Auto-decay: if last strike was >30 days ago, reduce count by 1
$db->prepare("
    UPDATE users SET no_show_count = GREATEST(no_show_count - 1, 0)
    WHERE id = ? AND last_strike_at IS NOT NULL
    AND last_strike_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND no_show_count > 0
")->execute([$user['id']]);

// Get current state
$stmt = $db->prepare("SELECT no_show_count FROM users WHERE id = ?");
$stmt->execute([$user['id']]);
$row = $stmt->fetch();

$count = (int)($row['no_show_count'] ?? 0);

$level = 'none';
$message = '';

if ($count >= 3) {
    $level = 'blocked';
    $message = 'Your online booking has been suspended due to repeated no-shows or late cancellations. Please call the shop to book.';
} elseif ($count >= 2) {
    $level = 'pending_approval';
    $message = 'You have ' . $count . ' strikes on record. Your next booking will require admin approval before being confirmed.';
} elseif ($count >= 1) {
    $level = 'warning';
    $message = 'You have 1 strike on record. Please cancel in advance if you cannot make it.';
}

json_response([
    'no_show_count' => $count,
    'restriction_level' => $level,
    'message' => $message,
]);
