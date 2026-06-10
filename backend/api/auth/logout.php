<?php
/**
 * MANOM BarberShop - Logout API
 * POST /api/auth/logout.php
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

// Clear all session data
$_SESSION = [];

// Delete session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// Destroy session
session_destroy();

json_response(['message' => 'Logged out successfully']);
