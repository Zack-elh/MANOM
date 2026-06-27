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
 * Require authenticated user (session-only)
 */
function require_auth(): array
{
    init_session();
    if (!empty($_SESSION['user_id'])) {
        return [
            'id'    => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'],
            'role'  => $_SESSION['user_role'],
            'name'  => $_SESSION['user_name'],
        ];
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
 * Auto-complete past bookings + safety-net no-show detection
 * Admin manually marks bookings as completed or no-show.
 * This function only cleans up bookings older than 24h that admin forgot to handle.
 * 
 * Updated to handle in_progress status and set proper timestamps.
 */
function auto_complete_bookings(): void
{
    $db = db();

    // Safety net: confirmed bookings past by >1 day → admin forgot, mark no_show
    $db->prepare("
        UPDATE bookings 
        SET status = 'no_show', updated_at = NOW()
        WHERE status = 'confirmed'
        AND booking_date < DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    ")->execute();

    // Safety net: in_progress bookings past by >1 day → admin forgot, mark completed
    $db->prepare("
        UPDATE bookings 
        SET status = 'completed', completed_at = NOW(), updated_at = NOW()
        WHERE status = 'in_progress'
        AND booking_date < DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    ")->execute();

    // Safety net: pending_approval bookings past by >1 day → auto-reject
    $db->prepare("
        UPDATE bookings 
        SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
        WHERE status = 'pending_approval'
        AND booking_date < DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    ")->execute();

    // Cleanup: bookings past by >2 days in any active status → finalize
    $db->prepare("
        UPDATE bookings 
        SET status = 'completed', completed_at = NOW(), updated_at = NOW()
        WHERE status IN ('confirmed', 'no_show', 'in_progress')
        AND booking_date < DATE_SUB(CURDATE(), INTERVAL 2 DAY)
    ")->execute();
}
