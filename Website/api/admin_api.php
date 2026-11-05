<?php
// Website/api/admin_api.php
// Admin API terproteksi untuk operasi CRUD dan pengaturan sistem

header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/DataStore.php';
require_once __DIR__ . '/../includes/auth.php';

// Verifikasi Sesi Admin
if (!Auth::isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Sesi admin tidak valid. Silakan login kembali.']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$db = DataStore::getInstance();

try {
    switch ($action) {
        case 'get_dashboard_data':
            $data = $db->load();
            unset($data['admin_auth']['password_hash']);
            echo json_encode([
                'status' => 'success',
                'data' => $data,
                'csrf_token' => Auth::getCsrfToken()
            ]);
            break;

        case 'update_studio':
            $payload = json_decode(file_get_contents('php://input'), true);
            if (!is_array($payload) || empty($payload['studio'])) {
                throw new Exception('Data studio tidak valid.');
            }
            $db->set('studio', $payload['studio']);
            echo json_encode(['status' => 'success', 'message' => 'Profil studio berhasil diperbarui!']);
            break;

        case 'save_member':
            $payload = json_decode(file_get_contents('php://input'), true);
            $member = $payload['member'] ?? null;
            if (!is_array($member) || empty($member['name']) || empty($member['role'])) {
                throw new Exception('Nama dan Role pengembang wajib diisi.');
            }
            $saved = $db->upsertItem('members', $member);
            echo json_encode(['status' => 'success', 'message' => 'Data developer berhasil disimpan!', 'item' => $saved]);
            break;

        case 'delete_member':
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                throw new Exception('ID developer tidak ditentukan.');
            }
            $db->deleteItem('members', $id);
            echo json_encode(['status' => 'success', 'message' => 'Developer berhasil dihapus.']);
            break;

        case 'save_project':
            $payload = json_decode(file_get_contents('php://input'), true);
            $project = $payload['project'] ?? null;
            if (!is_array($project) || empty($project['title'])) {
                throw new Exception('Judul proyek wajib diisi.');
            }
            $saved = $db->upsertItem('projects', $project);
            echo json_encode(['status' => 'success', 'message' => 'Proyek game berhasil disimpan!', 'item' => $saved]);
            break;

        case 'delete_project':
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                throw new Exception('ID proyek tidak ditentukan.');
            }
            $db->deleteItem('projects', $id);
            echo json_encode(['status' => 'success', 'message' => 'Proyek berhasil dihapus.']);
            break;

        case 'save_music':
            $payload = json_decode(file_get_contents('php://input'), true);
            $music = $payload['music'] ?? null;
            if (!is_array($music) || empty($music['title'])) {
                throw new Exception('Judul lagu wajib diisi.');
            }
            $saved = $db->upsertItem('music_tracks', $music);
            echo json_encode(['status' => 'success', 'message' => 'Musik track berhasil disimpan!', 'item' => $saved]);
            break;

        case 'delete_music':
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                throw new Exception('ID musik tidak ditentukan.');
            }
            $db->deleteItem('music_tracks', $id);
            echo json_encode(['status' => 'success', 'message' => 'Musik track berhasil dihapus.']);
            break;

        case 'save_gallery':
            $payload = json_decode(file_get_contents('php://input'), true);
            $gallery = $payload['gallery'] ?? null;
            if (!is_array($gallery) || empty($gallery['title'])) {
                throw new Exception('Judul karya seni/aset wajib diisi.');
            }
            $saved = $db->upsertItem('gallery_items', $gallery);
            echo json_encode(['status' => 'success', 'message' => 'Karya seni / aset berhasil disimpan!', 'item' => $saved]);
            break;

        case 'delete_gallery':
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                throw new Exception('ID karya tidak ditentukan.');
            }
            $db->deleteItem('gallery_items', $id);
            echo json_encode(['status' => 'success', 'message' => 'Karya berhasil dihapus.']);
            break;

        case 'mark_message_read':
            $id = $_GET['id'] ?? '';
            $messages = $db->get('messages', []);
            foreach ($messages as &$msg) {
                if (($msg['id'] ?? '') === $id) {
                    $msg['is_read'] = true;
                    break;
                }
            }
            $db->set('messages', $messages);
            echo json_encode(['status' => 'success', 'message' => 'Pesan ditandai sudah dibaca.']);
            break;

        case 'delete_message':
            $id = $_GET['id'] ?? '';
            $db->deleteItem('messages', $id);
            echo json_encode(['status' => 'success', 'message' => 'Pesan berhasil dihapus.']);
            break;

        case 'upload_media':
            if (empty($_FILES['file'])) {
                throw new Exception('Tidak ada file yang diunggah.');
            }
            $file = $_FILES['file'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('Terjadi error saat mengunggah file.');
            }

            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'mp3', 'wav', 'ogg'];
            $fileName = basename($file['name']);
            $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

            if (!in_array($ext, $allowedExtensions, true)) {
                throw new Exception('Ekstensi file tidak diizinkan. Gunakan gambar (png/jpg/svg/webp) atau audio (mp3/wav/ogg).');
            }

            $newFileName = 'upload_' . time() . '_' . bin2hex(random_bytes(3)) . '.' . $ext;
            $destination = UPLOADS_DIR . DIRECTORY_SEPARATOR . $newFileName;

            if (!move_uploaded_file($file['tmp_name'], $destination)) {
                throw new Exception('Gagal memindahkan file ke direktori uploads.');
            }

            $webPath = 'data/uploads/' . $newFileName;
            echo json_encode([
                'status' => 'success',
                'message' => 'File berhasil diunggah!',
                'url' => $webPath
            ]);
            break;

        case 'change_password':
            $payload = json_decode(file_get_contents('php://input'), true);
            $current = $payload['current_password'] ?? '';
            $new = $payload['new_password'] ?? '';

            if (empty($current) || empty($new)) {
                throw new Exception('Password saat ini dan password baru wajib diisi.');
            }
            if (strlen($new) < 6) {
                throw new Exception('Password baru minimal 6 karakter.');
            }

            if (!Auth::updatePassword($current, $new)) {
                throw new Exception('Password saat ini salah.');
            }

            echo json_encode(['status' => 'success', 'message' => 'Password admin berhasil diubah!']);
            break;

        case 'reset_defaults':
            $db->initDefaultData(true);
            echo json_encode(['status' => 'success', 'message' => 'Data studio berhasil di-reset ke pengaturan default zerobrain.']);
            break;

        default:
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Aksi admin tidak dikenali: ' . htmlspecialchars($action)]);
            break;
    }
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
