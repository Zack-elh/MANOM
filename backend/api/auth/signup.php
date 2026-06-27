<?php
/**
 * MANOM BarberShop - Signup API
 * POST /api/auth/signup.php
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('signup');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    json_response(['error' => 'Invalid request body'], 400);
}

// Validate required fields
$error = validate_required(['name', 'email', 'password', 'phone'], $input);
if ($error) {
    json_response(['error' => $error], 400);
}

$name = sanitize_input($input['name']);
$email = sanitize_input($input['email']);
$phone = sanitize_input($input['phone']);
$password = $input['password'];
$confirmPassword = isset($input['confirm_password']) ? $input['confirm_password'] : '';

// Validate phone (digits, spaces, dashes, +, min 6 chars)
$cleanPhone = preg_replace('/[\s\-\(\)\+]/', '', $phone);
if (strlen($cleanPhone) < 6 || !preg_match('/^[0-9]+$/', $cleanPhone)) {
    json_response(['error' => 'Please enter a valid phone number'], 400);
}

// Check if phone already exists
$stmt = $db->prepare("SELECT id FROM users WHERE phone = ?");
$stmt->execute([$phone]);
if ($stmt->fetch()) {
    json_response(['error' => 'Phone number already registered'], 409);
}

// Validate password confirmation
if ($password !== $confirmPassword) {
    json_response(['error' => 'Passwords do not match'], 400);
}

// Validate email
if (!validate_email($email)) {
    json_response(['error' => 'Invalid email format'], 400);
}

// Validate password strength
if (strlen($password) < 8) {
    json_response(['error' => 'Password must be at least 8 characters'], 400);
}

if (!preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    json_response(['error' => 'Password must contain uppercase, lowercase, and a number'], 400);
}

// Validate name length
if (strlen($name) < 2 || strlen($name) > 100) {
    json_response(['error' => 'Name must be between 2 and 100 characters'], 400);
}

// Check if email already exists
$db = db();
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->fetch()) {
    json_response(['error' => 'Email already registered'], 409);
}

// Hash password and insert
$hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

$stmt = $db->prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'client')");
$stmt->execute([$name, $email, $phone, $hashedPassword]);

$userId = $db->lastInsertId();

// Auto-login after signup
session_regenerate_id(true);
$_SESSION['user_id'] = $userId;
$_SESSION['user_email'] = $email;
$_SESSION['user_name'] = $name;
$_SESSION['user_role'] = 'client';
$_SESSION['login_time'] = time();

json_response([
    'message' => 'Account created successfully',
    'user' => [
        'id'    => (int)$userId,
        'name'  => $name,
        'email' => $email,
        'role'  => 'client',
    ],
], 201);
