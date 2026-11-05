<?php
// Website/api/contact.php
// Public API Endpoint untuk menerima pesan kontak / pesan kolaborasi

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan']);
    exit;
}

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/DataStore.php';

// Mendapatkan data POST (baik json maupun form-data)
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    $input = $_POST;
}

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$subject = trim($input['subject'] ?? 'Pesan Baru dari Website');
$message = trim($input['message'] ?? '');

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Harap isi nama, email, dan pesan dengan lengkap.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Format email tidak valid.']);
    exit;
}

try {
    $db = DataStore::getInstance();
    $messages = $db->get('messages', []);

    $newMessage = [
        'id' => 'msg_' . time() . '_' . bin2hex(random_bytes(3)),
        'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
        'email' => htmlspecialchars($email, ENT_QUOTES, 'UTF-8'),
        'subject' => htmlspecialchars($subject, ENT_QUOTES, 'UTF-8'),
        'message' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8'),
        'created_at' => date('c'),
        'is_read' => false
    ];

    // Simpan pesan di urutan paling atas
    array_unshift($messages, $newMessage);
    $db->set('messages', $messages);

    echo json_encode([
        'status' => 'success',
        'message' => 'Terima kasih! Pesan Anda telah terkirim ke tim zerobrain.'
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Gagal mengirim pesan: ' . $e->getMessage()
    ]);
}
