<?php
/**
 * MANOM BarberShop - Reset Password API
 * POST /api/auth/reset-password.php
 * 
 * Accepts token + new password, validates token, updates password.
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('reset_password');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['token']) || empty($input['password'])) {
    json_response(['error' => 'Token and password are required'], 400);
}

$token = sanitize_input($input['token']);
$password = $input['password']; // Don't sanitize password

// Password strength validation
if (strlen($password) < 8) {
    json_response(['error' => 'Password must be at least 8 characters'], 400);
}
if (!preg_match('/[A-Z]/', $password)) {
    json_response(['error' => 'Password must contain at least one uppercase letter'], 400);
}
if (!preg_match('/[a-z]/', $password)) {
    json_response(['error' => 'Password must contain at least one lowercase letter'], 400);
}
if (!preg_match('/[0-9]/', $password)) {
    json_response(['error' => 'Password must contain at least one number'], 400);
}

$db = db();

// Find valid token
$stmt = $db->prepare("
    SELECT id, user_id, expires_at FROM password_resets 
    WHERE token = ? AND used = 0
");
$stmt->execute([$token]);
$resetToken = $stmt->fetch();

if (!$resetToken) {
    json_response(['error' => 'Invalid or already used reset token'], 400);
}

// Check expiry
if (strtotime($resetToken['expires_at']) < time()) {
    json_response(['error' => 'Reset token has expired. Please request a new one.'], 400);
}

try {
    $db->beginTransaction();

    // Hash new password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    // Update user password
    $stmt = $db->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$hashedPassword, $resetToken['user_id']]);

    // Mark token as used
    $stmt = $db->prepare("UPDATE password_resets SET used = 1 WHERE id = ?");
    $stmt->execute([$resetToken['id']]);

    // Invalidate all other tokens for this user
    $stmt = $db->prepare("UPDATE password_resets SET used = 1 WHERE user_id = ? AND id != ? AND used = 0");
    $stmt->execute([$resetToken['user_id'], $resetToken['id']]);

    $db->commit();

    json_response([
        'message' => 'Password reset successfully. You can now sign in with your new password.',
    ]);

} catch (Exception $e) {
    $db->rollBack();
    json_response(['error' => 'Failed to reset password. Please try again.'], 500);
}
