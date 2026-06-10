<?php
/**
 * MANOM BarberShop - Get Current User API
 * GET /api/auth/me.php
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$user = require_auth();

// Fetch fresh data from database
$db = db();
$stmt = $db->prepare("SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?");
$stmt->execute([$user['id']]);
$userData = $stmt->fetch();

if (!$userData) {
    json_response(['error' => 'User not found'], 404);
}

json_response([
    'user' => [
        'id'         => $userData['id'],
        'name'       => $userData['name'],
        'email'      => $userData['email'],
        'role'       => $userData['role'],
        'phone'      => $userData['phone'],
        'created_at' => $userData['created_at'],
    ],
]);
