<?php
/**
 * MANOM BarberShop - Reset Password API
 * POST /api/auth/reset-password.php
 * 
 * Step 3 of 3: User sets new password after token was verified in step 2.
 * Uses session to confirm token was already verified.
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('reset_password');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

// Must have verified token in session (from verify-reset-token.php step 2)
if (empty($_SESSION['reset_token_verified']) || empty($_SESSION['reset_token_id'])) {
    json_response(['error' => 'Token not verified. Please go back and verify your reset token first.'], 400);
}

// Session token must be recent (within 15 minutes)
$verifiedAt = $_SESSION['reset_token_verified_at'] ?? 0;
if ((time() - $verifiedAt) > 900) {
    unset($_SESSION['reset_token_verified'], $_SESSION['reset_token_id'], $_SESSION['reset_token_user_id'], $_SESSION['reset_token_verified_at']);
    json_response(['error' => 'Token verification expired. Please verify your token again.'], 400);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['password'])) {
    json_response(['error' => 'New password is required'], 400);
}

$password = $input['password'];

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

// Get the token from DB using session info
$tokenId = $_SESSION['reset_token_id'];
$userId = $_SESSION['reset_token_user_id'];

$stmt = $db->prepare("
    SELECT id, user_id, expires_at FROM password_resets 
    WHERE id = ? AND user_id = ? AND used = 0
");
$stmt->execute([$tokenId, $userId]);
$resetToken = $stmt->fetch();

if (!$resetToken) {
    // Clean session
    unset($_SESSION['reset_token_verified'], $_SESSION['reset_token_id'], $_SESSION['reset_token_user_id'], $_SESSION['reset_token_verified_at']);
    json_response(['error' => 'Token no longer valid. Please start over.'], 400);
}

// Double-check expiry
if (strtotime($resetToken['expires_at']) < time()) {
    unset($_SESSION['reset_token_verified'], $_SESSION['reset_token_id'], $_SESSION['reset_token_user_id'], $_SESSION['reset_token_verified_at']);
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

    // Clean session
    unset($_SESSION['reset_token_verified'], $_SESSION['reset_token_id'], $_SESSION['reset_token_user_id'], $_SESSION['reset_token_verified_at']);

    json_response([
        'message' => 'Password reset successfully. You can now sign in with your new password.',
    ]);

} catch (Exception $e) {
    $db->rollBack();
    json_response(['error' => 'Failed to reset password. Please try again.'], 500);
}
