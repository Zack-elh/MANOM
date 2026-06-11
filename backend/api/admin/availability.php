<?php
/**
 * MANOM BarberShop - Admin Barber Availability API
 * GET  /api/admin/availability.php?barber_id=X  - List availability for a barber
 * POST /api/admin/availability.php              - Bulk replace availability for a barber
 *
 * POST body:
 * {
 *   "barber_id": 1,
 *   "availability": [
 *     { "day_of_week": 0, "start_time": "09:00", "end_time": "20:00" },
 *     { "day_of_week": 1, "start_time": null, "end_time": null },  // closed
 *     ...
 *   ]
 * }
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('admin_availability');

$admin = require_admin();
$db = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $barber_id = isset($_GET['barber_id']) ? (int)$_GET['barber_id'] : 0;
    if (!$barber_id) json_response(['error' => 'barber_id is required'], 400);

    // Verify barber exists
    $stmt = $db->prepare("SELECT id FROM barbers WHERE id = ?");
    $stmt->execute([$barber_id]);
    if (!$stmt->fetch()) json_response(['error' => 'Barber not found'], 404);

    $stmt = $db->prepare("SELECT id, barber_id, day_of_week, start_time, end_time, active FROM barber_availability WHERE barber_id = ? ORDER BY day_of_week, start_time");
    $stmt->execute([$barber_id]);
    $rows = $stmt->fetchAll();

    // Format times to H:i
    foreach ($rows as &$row) {
        $row['start_time'] = substr($row['start_time'], 0, 5);
        $row['end_time'] = substr($row['end_time'], 0, 5);
    }

    json_response(['availability' => $rows]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $error = validate_required(['barber_id', 'availability'], $input);
    if ($error) json_response(['error' => $error], 400);

    $barber_id = (int)$input['barber_id'];

    // Verify barber exists
    $stmt = $db->prepare("SELECT id FROM barbers WHERE id = ?");
    $stmt->execute([$barber_id]);
    if (!$stmt->fetch()) json_response(['error' => 'Barber not found'], 404);

    $availability = $input['availability'];
    if (!is_array($availability)) json_response(['error' => 'availability must be an array'], 400);

    // Delete existing availability for this barber
    $db->prepare("DELETE FROM barber_availability WHERE barber_id = ?")->execute([$barber_id]);

    // Insert new entries
    $inserted = 0;
    foreach ($availability as $entry) {
        $day = isset($entry['day_of_week']) ? (int)$entry['day_of_week'] : -1;
        if ($day < 0 || $day > 6) continue;

        $start = isset($entry['start_time']) ? trim($entry['start_time']) : '';
        $end = isset($entry['end_time']) ? trim($entry['end_time']) : '';

        // Skip if start/end are missing (day is closed)
        if ($start === '' || $end === '') continue;

        // Validate time format (H:i or H:i:s)
        if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $start) || !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $end)) {
            continue;
        }

        // Ensure end_time > start_time
        if ($start >= $end) continue;

        // Normalize to H:i:s format
        $start .= ':00';
        $end .= ':00';

        $stmt = $db->prepare("INSERT INTO barber_availability (barber_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)");
        $stmt->execute([$barber_id, $day, $start, $end]);
        $inserted++;
    }

    json_response(['message' => 'Availability updated', 'entries' => $inserted]);

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
