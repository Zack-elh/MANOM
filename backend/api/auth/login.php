<?php
/**
 * MANOM BarberShop - Login API
 * POST /api/auth/login.php
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('login');

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    json_response(['error' => 'Invalid request body'], 400);
}

// Validate required fields
$error = validate_required(['email', 'password'], $input);
if ($error) {
    json_response(['error' => $error], 400);
}

$email = sanitize_input($input['email']);
$password = $input['password']; // Don't sanitize password

// Validate email format
if (!validate_email($email)) {
    json_response(['error' => 'Invalid email format'], 400);
}

// Find user
$db = db();
$stmt = $db->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    // Generic message to prevent user enumeration
    json_response(['error' => 'Invalid email or password'], 401);
}

// Regenerate session ID to prevent session fixation
session_regenerate_id(true);

// Store user data in session
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_role'] = $user['role'];
$_SESSION['login_time'] = time();

// Generate auth token for header-based auth (fallback for cookie issues)
$token = base64_encode($user['id'] . ':' . $user['email'] . ':' . hash_hmac('sha256', $user['id'] . ':' . $user['email'], 'manom_dev_secret'));

json_response([
    'message' => 'Login successful',
    'token'   => $token,
    'user' => [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'role'  => $user['role'],
    ],
]);
