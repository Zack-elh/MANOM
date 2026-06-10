<?php
/**
 * MANOM BarberShop - Admin Stats API
 * GET /api/admin/stats.php - Dashboard statistics
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('admin_stats');

$admin = require_admin();
$db = db();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

// Auto-complete past bookings
auto_complete_bookings();

// Today's stats
$today = date('Y-m-d');

$stmt = $db->prepare("
    SELECT COUNT(*) as count FROM bookings 
    WHERE booking_date = ? AND status IN ('pending', 'confirmed')
");
$stmt->execute([$today]);
$todayBookings = $stmt->fetch()['count'];

// Today's revenue
$stmt = $db->prepare("
    SELECT COALESCE(SUM(s.price), 0) as total FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.booking_date = ? AND b.status IN ('confirmed', 'completed')
");
$stmt->execute([$today]);
$todayRevenue = $stmt->fetch()['total'];

// Pending bookings
$stmt = $db->query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
$pendingBookings = $stmt->fetch()['count'];

// Total clients
$stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE role = 'client'");
$totalClients = $stmt->fetch()['count'];

// Total bookings this month
$monthStart = date('Y-m-01');
$stmt = $db->prepare("
    SELECT COUNT(*) as count FROM bookings 
    WHERE booking_date >= ? AND status IN ('confirmed', 'completed')
");
$stmt->execute([$monthStart]);
$monthBookings = $stmt->fetch()['count'];

// Monthly revenue
$stmt = $db->prepare("
    SELECT COALESCE(SUM(s.price), 0) as total FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.booking_date >= ? AND b.status IN ('confirmed', 'completed')
");
$stmt->execute([$monthStart]);
$monthRevenue = $stmt->fetch()['total'];

// Upcoming bookings (next 7 days)
$weekEnd = date('Y-m-d', strtotime('+7 days'));
$stmt = $db->prepare("
    SELECT b.id, b.ref_code, b.booking_date, b.booking_time, b.status,
           s.title AS service_title, s.price,
           br.name AS barber_name,
           u.name AS client_name, u.email AS client_email
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN barbers br ON b.barber_id = br.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.booking_date BETWEEN ? AND ?
    AND b.status IN ('pending', 'confirmed')
    ORDER BY b.booking_date ASC, b.booking_time ASC
    LIMIT 20
");
$stmt->execute([$today, $weekEnd]);
$upcomingBookings = $stmt->fetchAll();

// Recent bookings (last 10)
$stmt = $db->prepare("
    SELECT b.id, b.ref_code, b.booking_date, b.booking_time, b.status, b.created_at,
           s.title AS service_title, s.price,
           br.name AS barber_name,
           u.name AS client_name
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN barbers br ON b.barber_id = br.id
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
    LIMIT 10
");
$stmt->execute();
$recentBookings = $stmt->fetchAll();

json_response([
    'today' => [
        'bookings' => (int)$todayBookings,
        'revenue'  => (float)$todayRevenue,
    ],
    'month' => [
        'bookings' => (int)$monthBookings,
        'revenue'  => (float)$monthRevenue,
    ],
    'pending_bookings' => (int)$pendingBookings,
    'total_clients'    => (int)$totalClients,
    'upcoming'         => $upcomingBookings,
    'recent'           => $recentBookings,
]);
