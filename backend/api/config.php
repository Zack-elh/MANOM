<?php
/**
 * MANOM BarberShop - Database Configuration
 * OWASP compliant: no hardcoded credentials
 */

// Environment detection
define('ENV', getenv('MANOM_ENV') ?: 'development');

// Suppress PHP error output to prevent HTML corrupting JSON responses
@ini_set('display_errors', '0');

// Database credentials (use environment variables in production)
define('DB_HOST', getenv('MANOM_DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('MANOM_DB_NAME') ?: 'manom_barbershop');
define('DB_USER', getenv('MANOM_DB_USER') ?: 'root');
define('DB_PASS', getenv('MANOM_DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// Session configuration
define('SESSION_LIFETIME', 3600 * 24); // 24 hours
define('SESSION_NAME', 'MANOM_SESSION');

// Rate limiting
define('RATE_LIMIT_MAX', 30); // max attempts
define('RATE_LIMIT_WINDOW', 900); // 15 minutes in seconds

// CORS (restrict in production)
define('ALLOWED_ORIGIN', ENV === 'development' ? 'http://localhost:3000' : 'https://yourdomain.com');

// Booking rules
define('CANCEL_WINDOW_HOURS', 24);      // Free cancel: >24h before appointment
define('LATE_CANCEL_THRESHOLD', 2);     // Late cancel: <2h before = strike
define('BOOKING_MIN_LEAD_HOURS', 2);    // Minimum hours before a slot can be booked
define('MAX_ACTIVE_BOOKINGS', 2);       // Max active future bookings per client
define('BOOKING_REF_PREFIX', 'MNM');

/**
 * Get PDO database connection
 */
function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // Use real prepared statements
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }

    return $pdo;
}

/**
 * Send JSON response
 */
function json_response(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Sanitize string output for HTML
 */
function sanitize_output(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Generate CSRF token
 */
function generate_csrf_token(): string
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = $token;
    return $token;
}

/**
 * Verify CSRF token
 */
function verify_csrf_token(string $token): bool
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
