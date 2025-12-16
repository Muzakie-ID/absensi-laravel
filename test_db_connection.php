<?php

// Script sederhana untuk mengetes koneksi database berdasarkan file .env
// Simpan file ini di root folder project (sejajar dengan .env)
// Jalankan dengan perintah: php test_db_connection.php

echo "--------------------------------------------------\n";
echo "       TEST KONEKSI DATABASE (RAW PHP)            \n";
echo "--------------------------------------------------\n";

$envFile = __DIR__ . '/.env';

if (!file_exists($envFile)) {
    die("❌ File .env tidak ditemukan di: $envFile\n");
}

echo "📂 Membaca file .env...\n";

$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$env = [];

foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) {
        continue;
    }

    $parts = explode('=', $line, 2);
    if (count($parts) === 2) {
        $key = trim($parts[0]);
        $value = trim($parts[1]);
        // Hapus tanda kutip jika ada
        $value = trim($value, '"\'');
        $env[$key] = $value;
    }
}

$host = $env['DB_HOST'] ?? '127.0.0.1';
$port = $env['DB_PORT'] ?? '3306';
$database = $env['DB_DATABASE'] ?? 'laravel';
$username = $env['DB_USERNAME'] ?? 'root';
$password = $env['DB_PASSWORD'] ?? '';

echo "   DB_HOST     : $host\n";
echo "   DB_PORT     : $port\n";
echo "   DB_DATABASE : $database\n";
echo "   DB_USERNAME : $username\n";
echo "   DB_PASSWORD : " . ($password ? '******' : '(kosong)') . "\n";

echo "--------------------------------------------------\n";
echo "🔄 Mencoba menghubungkan...\n";

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$database";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5, // Timeout 5 detik
    ];

    $pdo = new PDO($dsn, $username, $password, $options);

    echo "✅ KONEKSI SUKSES!\n";
    echo "   Berhasil terhubung ke database '$database' di '$host'.\n";
    
} catch (PDOException $e) {
    // Cek jika errornya adalah "Unknown database" (Kode 1049)
    if ($e->getCode() == 1049) {
        echo "⚠️  DATABASE TIDAK DITEMUKAN: '$database'\n";
        echo "🔄 Mencoba membuat database secara otomatis...\n";
        
        try {
            // Koneksi tanpa nama database
            $dsn_no_db = "mysql:host=$host;port=$port";
            $pdo_root = new PDO($dsn_no_db, $username, $password, $options);
            
            // Buat database
            $pdo_root->exec("CREATE DATABASE `$database`");
            echo "✅ DATABASE BERHASIL DIBUAT!\n";
            echo "   Silakan jalankan ulang 'php artisan migrate --seed'.\n";
            
        } catch (PDOException $e2) {
            echo "❌ GAGAL MEMBUAT DATABASE OTOMATIS.\n";
            echo "   Pesan Error: " . $e2->getMessage() . "\n";
            echo "   Silakan buat database '$database' secara manual melalui phpMyAdmin atau terminal MySQL.\n";
        }
    } else {
        echo "❌ KONEKSI GAGAL!\n";
        echo "   Pesan Error : " . $e->getMessage() . "\n";
        
        if (strpos($e->getMessage(), 'php_network_getaddresses') !== false) {
            echo "\n💡 TIPS PERBAIKAN:\n";
            echo "   Error ini berarti komputer TIDAK BISA menemukan alamat host '$host'.\n";
            echo "   1. Jika ini di server lokal/VPS, ubah DB_HOST di .env menjadi '127.0.0.1' atau 'localhost'.\n";
            echo "   2. Jika menggunakan Docker, pastikan nama service container benar (misal: 'mysql' atau 'db').\n";
        }
    }
}

echo "--------------------------------------------------\n";
