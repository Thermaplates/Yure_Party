<?php
// Website/includes/config.php
// Konfigurasi Dasar Website Zerobrain Studio

if (!defined('APP_ROOT')) {
    define('APP_ROOT', dirname(__DIR__));
}

define('DATA_DIR', APP_ROOT . DIRECTORY_SEPARATOR . 'data');
define('UPLOADS_DIR', DATA_DIR . DIRECTORY_SEPARATOR . 'uploads');
define('DB_FILE', DATA_DIR . DIRECTORY_SEPARATOR . 'db.json');

// Pastikan direktori data & uploads tersedia
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0777, true);
}
if (!is_dir(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0777, true);
}

// Session security setup
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    session_start();
}
