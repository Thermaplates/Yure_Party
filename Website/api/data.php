<?php
// Website/api/data.php
// Public API Endpoint untuk mendapatkan data studio, pengembang, proyek, musik, dan galeri

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/DataStore.php';

try {
    $db = DataStore::getInstance();
    $data = $db->load();

    // Hapus data sensitif seperti hash password
    unset($data['admin_auth']);
    unset($data['messages']); // Pesan hanya untuk admin

    echo json_encode([
        'status' => 'success',
        'data' => $data,
        'timestamp' => time()
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Gagal memuat data studio: ' . $e->getMessage()
    ]);
}
