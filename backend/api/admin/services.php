<?php
/**
 * MANOM BarberShop - Admin Services API
 * GET    /api/admin/services.php  - List all services
 * POST   /api/admin/services.php  - Create service
 * PUT    /api/admin/services.php  - Update service
 * DELETE /api/admin/services.php?id=X - Delete service
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('admin_services');

$admin = require_admin();
$db = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("SELECT * FROM services ORDER BY id ASC");
    json_response(['services' => $stmt->fetchAll()]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $error = validate_required(['title', 'duration', 'price'], $input);
    if ($error) json_response(['error' => $error], 400);

    $title = sanitize_input($input['title']);
    $description = isset($input['description']) ? sanitize_input($input['description']) : null;
    $duration = (int)$input['duration'];
    $price = (float)$input['price'];

    if ($duration < 5 || $duration > 480) json_response(['error' => 'Duration must be 5-480 minutes'], 400);
    if ($price < 0) json_response(['error' => 'Price cannot be negative'], 400);

    $stmt = $db->prepare("INSERT INTO services (title, description, duration, price) VALUES (?, ?, ?, ?)");
    $stmt->execute([$title, $description, $duration, $price]);

    json_response(['message' => 'Service created', 'id' => (int)$db->lastInsertId()], 201);

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['id'])) json_response(['error' => 'id is required'], 400);

    $id = (int)$input['id'];
    $fields = [];
    $params = [];

    if (isset($input['title'])) { $fields[] = 'title = ?'; $params[] = sanitize_input($input['title']); }
    if (isset($input['description'])) { $fields[] = 'description = ?'; $params[] = sanitize_input($input['description']); }
    if (isset($input['duration'])) { $fields[] = 'duration = ?'; $params[] = (int)$input['duration']; }
    if (isset($input['price'])) { $fields[] = 'price = ?'; $params[] = (float)$input['price']; }
    if (isset($input['active'])) { $fields[] = 'active = ?'; $params[] = (int)$input['active']; }

    if (empty($fields)) json_response(['error' => 'No fields to update'], 400);

    $params[] = $id;
    $sql = "UPDATE services SET " . implode(', ', $fields) . " WHERE id = ?";
    $db->prepare($sql)->execute($params);

    json_response(['message' => 'Service updated']);

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if (!$id) json_response(['error' => 'id is required'], 400);

    $db->prepare("DELETE FROM services WHERE id = ?")->execute([$id]);
    json_response(['message' => 'Service deleted']);

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
