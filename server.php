<?php
// Router script untuk PHP built-in server — serve static dari public/, fallback ke index.php.
// Pakai dgn: php -S 127.0.0.1:8765 server.php
$uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));

if ($uri !== "/" && file_exists(__DIR__ . "/public" . $uri)) {
    return false;
}

require_once __DIR__ . "/public/index.php";
