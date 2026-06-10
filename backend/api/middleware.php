<?php
/**
 * MANOM BarberShop - API Middleware
 * OWASP security guidelines enforced
 */

require_once __DIR__ . '/config.php';

/**
 * Initialize session with secure settings
 */
function init_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_name(SESSION_NAME);
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path'     => '/',
            'domain'   => '',
            'secure'   => false,
            'httponly'  => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

/**
 * Set CORS headers
 */
function set_cors_headers(): void
{
    header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Authorization');
    header('Access-Control-Allow-Credentials: true');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Rate limiting check
 * Uses database to track attempts per IP per endpoint
 */
function check_rate_limit(string $endpoint): void
{
    $ip = get_client_ip();
    $db = db();

    // Clean old entries
    $db->prepare("DELETE FROM rate_limits WHERE first_attempt < DATE_SUB(NOW(), INTERVAL ? SECOND)")
       ->execute([RATE_LIMIT_WINDOW]);

    // Check current attempts
    $stmt = $db->prepare("
        SELECT attempts, first_attempt 
        FROM rate_limits 
        WHERE ip_address = ? AND endpoint = ? 
        AND first_attempt > DATE_SUB(NOW(), INTERVAL ? SECOND)
    ");
    $stmt->execute([$ip, $endpoint, RATE_LIMIT_WINDOW]);
    $row = $stmt->fetch();

    if ($row && $row['attempts'] >= RATE_LIMIT_MAX) {
        json_response(['error' => 'Too many requests. Please try again later.'], 429);
    }

    // Increment or create
    if ($row) {
        $db->prepare("UPDATE rate_limits SET attempts = attempts + 1 WHERE ip_address = ? AND endpoint = ?")
           ->execute([$ip, $endpoint]);
    } else {
        $db->prepare("INSERT INTO rate_limits (ip_address, endpoint, attempts) VALUES (?, ?, 1)")
           ->execute([$ip, $endpoint]);
    }
}

/**
 * Get client IP (handles proxies)
 */
function get_client_ip(): string
{
    $headers = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = explode(',', $_SERVER[$header])[0];
            $ip = trim($ip);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }

    return '127.0.0.1';
}

/**
 * Require authenticated user - supports both session and token auth
 */
function require_auth(): array
{
    // Try session first
    init_session();
    if (!empty($_SESSION['user_id'])) {
        return [
            'id'    => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'],
            'role'  => $_SESSION['user_role'],
            'name'  => $_SESSION['user_name'],
        ];
    }

    // Fallback: token auth via header
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(.+)$/i', $authHeader, $m)) {
        $token = $m[1];
        $parts = explode(':', base64_decode($token));
        if (count($parts) === 3) {
            [$userId, $email, $hash] = $parts;
            $expected = hash_hmac('sha256', $userId . ':' . $email, 'manom_dev_secret');
            if (hash_equals($expected, $hash)) {
                $db = db();
                $stmt = $db->prepare("SELECT id, name, email, role FROM users WHERE id = ? AND email = ?");
                $stmt->execute([(int)$userId, $email]);
                $user = $stmt->fetch();
                if ($user) {
                    return [
                        'id'    => $user['id'],
                        'email' => $user['email'],
                        'role'  => $user['role'],
                        'name'  => $user['name'],
                    ];
                }
            }
        }
    }

    json_response(['error' => 'Authentication required'], 401);
}

/**
 * Require admin role
 */
function require_admin(): array
{
    $user = require_auth();

    if ($user['role'] !== 'admin') {
        json_response(['error' => 'Admin access required'], 403);
    }

    return $user;
}

/**
 * Validate and sanitize input
 */
function sanitize_input(string $value): string
{
    $value = trim($value);
    $value = stripslashes($value);
    $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    return $value;
}

/**
 * Validate email
 */
function validate_email(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate required fields
 */
function validate_required(array $fields, array $data): ?string
{
    foreach ($fields as $field) {
        if (empty($data[$field]) && $data[$field] !== '0') {
            return "Field '{$field}' is required";
        }
    }
    return null;
}

/**
 * Generate unique booking reference code
 * Format: MNM-XXXXXX (6 digits)
 */
function generate_ref_code(): string
{
    $db = db();
    do {
        $code = BOOKING_REF_PREFIX . '-' . str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $stmt = $db->prepare("SELECT id FROM bookings WHERE ref_code = ?");
        $stmt->execute([$code]);
    } while ($stmt->fetch());

    return $code;
}

/**
 * Auto-complete past bookings
 * Runs on page load - no cron needed
 */
function auto_complete_bookings(): void
{
    $db = db();
    $db->prepare("
        UPDATE bookings 
        SET status = 'completed', updated_at = NOW() 
        WHERE status = 'confirmed' 
        AND booking_date < CURDATE()
    ")->execute();

    // Also complete today's bookings that have passed
    $db->prepare("
        UPDATE bookings 
        SET status = 'completed', updated_at = NOW() 
        WHERE status = 'confirmed' 
        AND booking_date = CURDATE() 
        AND booking_time < CURTIME()
    ")->execute();
}
