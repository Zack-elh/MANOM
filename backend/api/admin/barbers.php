<?php
/**
 * MANOM BarberShop - Admin Barbers API
 * GET    /api/admin/barbers.php  - List all barbers
 * POST   /api/admin/barbers.php  - Create barber
 * PUT    /api/admin/barbers.php  - Update barber
 * DELETE /api/admin/barbers.php?id=X - Delete barber
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('admin_barbers');

$admin = require_admin();
$db = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("SELECT * FROM barbers ORDER BY id ASC");
    json_response(['barbers' => $stmt->fetchAll()]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $error = validate_required(['name'], $input);
    if ($error) json_response(['error' => $error], 400);

    $name = sanitize_input($input['name']);
    $specialty = isset($input['specialty']) ? sanitize_input($input['specialty']) : null;
    $image = isset($input['image']) ? sanitize_input($input['image']) : null;

    $stmt = $db->prepare("INSERT INTO barbers (name, specialty, image) VALUES (?, ?, ?)");
    $stmt->execute([$name, $specialty, $image]);

    json_response(['message' => 'Barber created', 'id' => (int)$db->lastInsertId()], 201);

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['id'])) json_response(['error' => 'id is required'], 400);

    $id = (int)$input['id'];
    $fields = [];
    $params = [];

    if (isset($input['name'])) { $fields[] = 'name = ?'; $params[] = sanitize_input($input['name']); }
    if (isset($input['specialty'])) { $fields[] = 'specialty = ?'; $params[] = sanitize_input($input['specialty']); }
    if (isset($input['image'])) { $fields[] = 'image = ?'; $params[] = sanitize_input($input['image']); }
    if (isset($input['active'])) { $fields[] = 'active = ?'; $params[] = (int)$input['active']; }

    if (empty($fields)) json_response(['error' => 'No fields to update'], 400);

    $params[] = $id;
    $sql = "UPDATE barbers SET " . implode(', ', $fields) . " WHERE id = ?";
    $db->prepare($sql)->execute($params);

    json_response(['message' => 'Barber updated']);

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if (!$id) json_response(['error' => 'id is required'], 400);

    $db->prepare("DELETE FROM barbers WHERE id = ?")->execute([$id]);
    json_response(['message' => 'Barber deleted']);

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
