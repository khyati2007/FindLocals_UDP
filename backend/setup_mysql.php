<?php
// Creates the dedicated FindLocals database and application user from backend/.env.
$envPath = __DIR__ . DIRECTORY_SEPARATOR . '.env';
if (!is_file($envPath)) {
    fwrite(STDERR, "Missing backend/.env. Copy .env.example and set the MySQL fields first.\n");
    exit(1);
}
$settings = [];
foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    $line = trim($line);
    if ($line !== '' && $line[0] !== '#' && str_contains($line, '=')) {
        [$key, $value] = explode('=', $line, 2);
        $settings[trim($key)] = trim(trim($value), "\"'");
    }
}
$database = $settings['FINDLOCALS_MYSQL_DATABASE'] ?? 'findlocals';
$dbUser = $settings['FINDLOCALS_MYSQL_USER'] ?? 'findlocals_app';
$dbPassword = $settings['FINDLOCALS_MYSQL_PASSWORD'] ?? '';
$port = intval($settings['FINDLOCALS_MYSQL_PORT'] ?? '3306');
if (!preg_match('/^[A-Za-z0-9_]+$/', $database) || !preg_match('/^[A-Za-z0-9_]+$/', $dbUser) || $dbPassword === '') {
    fwrite(STDERR, "Set a database name, application user, and non-empty private password in backend/.env.\n");
    exit(1);
}
// XAMPP's local MariaDB installation commonly exposes its local root account to PHP CLI.
$root = @new mysqli('127.0.0.1', 'root', '', '', $port);
if ($root->connect_errno) {
    fwrite(STDERR, "Could not connect to local MariaDB as root: {$root->connect_error}\n");
    exit(1);
}
$root->set_charset('utf8mb4');
$root->query("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$quotedUser = $root->real_escape_string($dbUser);
$quotedPassword = $root->real_escape_string($dbPassword);
$root->query("CREATE USER IF NOT EXISTS '{$quotedUser}'@'127.0.0.1' IDENTIFIED BY '{$quotedPassword}'");
$root->query("ALTER USER '{$quotedUser}'@'127.0.0.1' IDENTIFIED BY '{$quotedPassword}'");
$root->query("GRANT ALL PRIVILEGES ON `{$database}`.* TO '{$quotedUser}'@'127.0.0.1'");
$root->close();
echo "Created/checked database '{$database}' and restricted application account '{$dbUser}'@'127.0.0.1'.\n";
