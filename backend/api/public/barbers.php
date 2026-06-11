<?php
require_once __DIR__ . '/../middleware.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $db = db();
    $stmt = $db->query("SELECT id, name, specialty, image FROM barbers WHERE active = 1 ORDER BY id ASC");
    json_response(['barbers' => $stmt->fetchAll()]);
} else {
    json_response(['error' => 'Method not allowed'], 405);
}
