<?php
/**
 * MANOM BarberShop - Forgot Password API
 * POST /api/auth/forgot-password.php
 * 
 * Accepts email, generates reset token, returns it (for local dev).
 * In production: would send email with reset link.
 */

require_once __DIR__ . '/../middleware.php';
require_once __DIR__ . '/../lib/mail_helper.php';

set_cors_headers();
init_session();
check_rate_limit('forgot_password');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['email'])) {
    json_response(['error' => 'Email is required'], 400);
}

$email = sanitize_input($input['email']);

if (!validate_email($email)) {
    json_response(['error' => 'Invalid email format'], 400);
}

$db = db();

// Find user by email
$stmt = $db->prepare("SELECT id, name FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

// Always return success to prevent email enumeration
if (!$user) {
    json_response([
        'message' => 'If an account with that email exists, a reset link has been generated.',
    ]);
}

// Invalidate any existing unused tokens for this user
$stmt = $db->prepare("UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0");
$stmt->execute([$user['id']]);

// Generate reset token (64-char hex)
$token = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Store token
$stmt = $db->prepare("
    INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)
");
$stmt->execute([$user['id'], $token, $expiresAt]);

// Send email with reset link
send_password_reset($email, $user['name'], $token);

json_response([
    'message' => 'If an account with that email exists, a reset link has been generated.',
    'expires_in' => 3600,
]);
