<?php
/**
 * Handles file upload with validation
 *
 * @param string $field_name  $_FILES key
 * @param string $subdir     Subdirectory under uploads/ (e.g. 'barbers', 'services')
 * @param int    $max_size   Max file size in bytes (default 5MB)
 * @return array{success: bool, filename?: string, error?: string}
 */
function handle_upload(string $field_name, string $subdir = '', int $max_size = 5242880): array
{
    if (!isset($_FILES[$field_name]) || $_FILES[$field_name]['error'] !== UPLOAD_ERR_OK) {
        $code = $_FILES[$field_name]['error'] ?? -1;
        $messages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds server upload limit',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds form size limit',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        ];
        return ['success' => false, 'error' => $messages[$code] ?? 'Upload failed'];
    }

    $file = $_FILES[$field_name];

    if ($file['size'] > $max_size) {
        return ['success' => false, 'error' => 'File exceeds maximum size of ' . ($max_size / 1024 / 1024) . 'MB'];
    }

    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowed)) {
        return ['success' => false, 'error' => 'Invalid file type. Allowed: JPG, PNG, WebP, GIF'];
    }

    $ext_map = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];
    $ext = $ext_map[$mime];

    $uploads_dir = __DIR__ . '/../../uploads';
    if ($subdir !== '') {
        $uploads_dir .= '/' . ltrim($subdir, '/');
        if (!is_dir($uploads_dir)) {
            mkdir($uploads_dir, 0755, true);
        }
    }

    $filename = uniqid($subdir !== '' ? str_replace('/', '_', $subdir) . '_' : '', true) . '.' . $ext;

    // Avoid collisions
    while (file_exists($uploads_dir . '/' . $filename)) {
        $filename = uniqid($subdir !== '' ? str_replace('/', '_', $subdir) . '_' : '', true) . '.' . $ext;
    }

    if (!move_uploaded_file($file['tmp_name'], $uploads_dir . '/' . $filename)) {
        return ['success' => false, 'error' => 'Failed to save file'];
    }

    $relative_path = $subdir !== '' ? $subdir . '/' . $filename : $filename;

    return ['success' => true, 'filename' => $relative_path];
}
