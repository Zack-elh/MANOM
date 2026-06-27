<?php
/**
 * MANOM BarberShop - Client Strike History API
 * GET /api/admin/client-strikes.php?user_id=2
 * 
 * Returns full strike history for a specific client.
 * Admin uses this to decide whether to approve a pending_booking.
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('admin_client_strikes');

$admin = require_admin();
$db = db();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
if (!$userId) {
    json_response(['error' => 'user_id is required'], 400);
}

// Get user info
$stmt = $db->prepare("SELECT id, name, email, no_show_count FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    json_response(['error' => 'User not found'], 404);
}

// Get strike history
$stmt = $db->prepare("
    SELECT s.id, s.strike_type, s.created_at, s.forgiven_at,
           b.ref_code, b.booking_date, b.booking_time,
           sv.title AS service_title,
           br.name AS barber_name,
           fb.name AS forgiven_by_name
    FROM strikes s
    JOIN bookings b ON s.booking_id = b.id
    JOIN services sv ON b.service_id = sv.id
    JOIN barbers br ON b.barber_id = br.id
    LEFT JOIN users fb ON s.forgiven_by = fb.id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
");
$stmt->execute([$userId]);
$strikes = $stmt->fetchAll();

// Get pending bookings count
$stmt = $db->prepare("
    SELECT COUNT(*) FROM bookings 
    WHERE user_id = ? AND status = 'pending_approval'
");
$stmt->execute([$userId]);
$pendingCount = (int)$stmt->fetchColumn();

json_response([
    'user' => $user,
    'strikes' => $strikes,
    'pending_bookings' => $pendingCount,
]);
