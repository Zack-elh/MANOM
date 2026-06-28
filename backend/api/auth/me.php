<?php
/**
 * MANOM BarberShop - Get/Update Current User API
 * GET  /api/auth/me.php - Get current user
 * PUT  /api/auth/me.php - Update profile (name, phone)
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();

$user = require_auth();
$db = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        json_response(['error' => 'Invalid request body'], 400);
    }

    $updates = [];
    $params = [];

    // Update name
    if (isset($input['name']) && trim($input['name']) !== '') {
        $name = sanitize_input(trim($input['name']));
        if (strlen($name) < 2 || strlen($name) > 100) {
            json_response(['error' => 'Name must be between 2 and 100 characters'], 400);
        }
        $updates[] = 'name = ?';
        $params[] = $name;
    }

    // Update phone
    if (isset($input['phone'])) {
        $phone = sanitize_input(trim($input['phone']));
        if ($phone !== '') {
            $cleanPhone = preg_replace('/[\s\-\(\)\+]/', '', $phone);
            if (strlen($cleanPhone) < 6 || strlen($cleanPhone) > 15 || !preg_match('/^[0-9]+$/', $cleanPhone)) {
                json_response(['error' => 'Enter a valid phone number (e.g. +212 6 12 34 56 78 or +33 6 12 34 56 78)'], 400);
            }
            // Check if phone is already used by another user
            $stmt = $db->prepare("SELECT id FROM users WHERE phone = ? AND id != ?");
            $stmt->execute([$phone, $user['id']]);
            if ($stmt->fetch()) {
                json_response(['error' => 'Phone number already in use'], 409);
            }
        }
        $updates[] = 'phone = ?';
        $params[] = $phone !== '' ? $phone : null;
    }

    if (empty($updates)) {
        json_response(['error' => 'No fields to update'], 400);
    }

    $params[] = $user['id'];
    $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    // Return updated user
    $stmt = $db->prepare("SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $userData = $stmt->fetch();

    json_response([
        'message' => 'Profile updated',
        'user' => [
            'id'         => $userData['id'],
            'name'       => $userData['name'],
            'email'      => $userData['email'],
            'role'       => $userData['role'],
            'phone'      => $userData['phone'],
            'created_at' => $userData['created_at'],
        ],
    ]);

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
