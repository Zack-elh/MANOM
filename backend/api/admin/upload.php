<?php
/**
 * MANOM BarberShop - Image Upload API
 * POST /api/admin/upload.php  - Upload an image file
 *
 * Accepts multipart/form-data with field "file" and optional "dir" (barbers|services).
 * Returns the relative path to the uploaded file.
 */

require_once __DIR__ . '/../middleware.php';
require_once __DIR__ . '/../lib/upload_helper.php';

set_cors_headers();
init_session();
check_rate_limit('admin_upload');

$admin = require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$dir = isset($_POST['dir']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['dir']) : '';

$result = handle_upload('file', $dir);

if (!$result['success']) {
    json_response(['error' => $result['error']], 400);
}

json_response([
    'message' => 'File uploaded successfully',
    'filename' => $result['filename'],
    'url' => '/uploads/' . $result['filename'],
]);
