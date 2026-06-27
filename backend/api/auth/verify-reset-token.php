<?php
/**
 * MANOM BarberShop - Verify Reset Token API
 * POST /api/auth/verify-reset-token.php
 * 
 * Step 2 of 3: User enters token from email. We verify it's valid and not expired.
 * Does NOT consume the token — that happens when they actually reset the password.
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('verify_reset_token');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['token'])) {
    json_response(['error' => 'Token is required'], 400);
}

$token = sanitize_input($input['token']);

$db = db();

// Find valid token (not used, not expired)
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

// Token is valid — store in session so step 3 can use it
$_SESSION['reset_token_verified'] = true;
$_SESSION['reset_token_id'] = $resetToken['id'];
$_SESSION['reset_token_user_id'] = $resetToken['user_id'];
$_SESSION['reset_token_verified_at'] = time();

json_response([
    'message' => 'Token verified. You can now set your new password.',
    'verified' => true,
]);
