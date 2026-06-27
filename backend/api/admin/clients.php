<?php
/**
 * MANOM BarberShop - Admin Clients API
 * GET /api/admin/clients.php - List all registered clients
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('admin_clients');

$admin = require_admin();
$db = db();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$search = isset($_GET['search']) ? sanitize_input($_GET['search']) : null;

$sql = "
    SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.created_at, u.no_show_count,
        COUNT(b.id) AS total_bookings,
        SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) AS active_bookings
    FROM users u
    LEFT JOIN bookings b ON u.id = b.user_id
    WHERE u.role = 'client'
";
$params = [];

if ($search) {
    $sql .= " AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
    $term = "%{$search}%";
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
}

$sql .= " GROUP BY u.id ORDER BY u.created_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$clients = $stmt->fetchAll();

json_response([
    'clients' => $clients,
    'total'   => count($clients),
]);
