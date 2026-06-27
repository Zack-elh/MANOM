<?php
/**
 * MANOM BarberShop - Notifications API
 * GET  /api/admin/notifications.php       - List notifications (with unread count)
 * PUT  /api/admin/notifications.php       - Mark notification(s) as read
 * DELETE /api/admin/notifications.php     - Delete notification(s)
 */

require_once __DIR__ . '/../middleware.php';

set_cors_headers();
init_session();
check_rate_limit('admin_notifications');

$admin = require_admin();
$db = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare("
        SELECT id, type, booking_id, message, is_read, created_at
        FROM notifications
        ORDER BY created_at DESC
        LIMIT 50
    ");
    $stmt->execute();
    $notifications = $stmt->fetchAll();

    $stmt = $db->prepare("SELECT COUNT(*) FROM notifications WHERE is_read = 0");
    $stmt->execute();
    $unreadCount = (int)$stmt->fetchColumn();

    json_response([
        'notifications' => $notifications,
        'unread_count' => $unreadCount,
        'total' => count($notifications),
    ]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['notification_id'])) {
        // Mark single notification as read
        $id = (int)$input['notification_id'];
        $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?")->execute([$id]);
        json_response(['message' => 'Notification marked as read']);
    } elseif (isset($input['mark_all'])) {
        // Mark all as read
        $db->prepare("UPDATE notifications SET is_read = 1 WHERE is_read = 0")->execute();
        json_response(['message' => 'All notifications marked as read']);
    } else {
        json_response(['error' => 'notification_id or mark_all is required'], 400);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['notification_id'])) {
        $id = (int)$input['notification_id'];
        $db->prepare("DELETE FROM notifications WHERE id = ?")->execute([$id]);
        json_response(['message' => 'Notification deleted']);
    } elseif (isset($input['clear_all'])) {
        $db->prepare("DELETE FROM notifications")->execute();
        json_response(['message' => 'All notifications cleared']);
    } else {
        json_response(['error' => 'notification_id or clear_all is required'], 400);
    }

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
