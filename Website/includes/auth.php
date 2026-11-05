<?php
// Website/includes/auth.php
// Manajemen Autentikasi dan Sesi Admin

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/DataStore.php';

class Auth {
    /**
     * Memeriksa apakah user sedang login sebagai admin
     */
    public static function isLoggedIn(): bool {
        return !empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
    }

    /**
     * Memastikan user login, jika tidak redirect ke halaman login
     */
    public static function requireLogin(): void {
        if (!self::isLoggedIn()) {
            header('Location: login.php');
            exit;
        }
    }

    /**
     * Memeriksa kredensial login admin
     */
    public static function login(string $username, string $password): bool {
        $db = DataStore::getInstance();
        $authData = $db->get('admin_auth', []);

        if (empty($authData)) {
            return false;
        }

        if ($authData['username'] === trim($username) && password_verify($password, $authData['password_hash'])) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $username;
            $_SESSION['admin_login_time'] = time();
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            return true;
        }

        return false;
    }

    /**
     * Logout admin
     */
    public static function logout(): void {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    }

    /**
     * Mendapatkan atau membuat token CSRF
     */
    public static function getCsrfToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Memverifikasi token CSRF
     */
    public static function verifyCsrfToken(?string $token): bool {
        if (empty($token) || empty($_SESSION['csrf_token'])) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Mengubah password admin
     */
    public static function updatePassword(string $currentPassword, string $newPassword): bool {
        $db = DataStore::getInstance();
        $authData = $db->get('admin_auth', []);

        if (empty($authData) || !password_verify($currentPassword, $authData['password_hash'])) {
            return false;
        }

        $authData['password_hash'] = password_hash($newPassword, PASSWORD_BCRYPT);
        $authData['updated_at'] = date('c');

        return $db->set('admin_auth', $authData);
    }
}
