# Sistem Informasi Manajemen KBM & Absensi (SIM KBM)
**SMK Batik Perbaik Purworejo**

![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-Inertia-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Aplikasi berbasis web yang dirancang untuk memodernisasi proses presensi guru, monitoring Kegiatan Belajar Mengajar (KBM), dan pelaporan kinerja di lingkungan sekolah.

## 🚀 Fitur Utama

### 📱 Absensi Guru Modern
- **Bukti Foto**: Wajib upload foto (selfie/suasana kelas) saat absen.
- **Geolocation**: Mencatat koordinat lokasi saat absen.
- **Status Kehadiran**: Hadir, Terlambat (hitung menit), Izin, Sakit.
- **Flashback Materi**: Menampilkan catatan materi pertemuan sebelumnya sebagai referensi.

### 🖥️ Dashboard Monitoring (Piket)
- **Real-time Monitoring**: Petugas piket dapat melihat status setiap kelas pada jam pelajaran yang sedang berlangsung (Hadir/Kosong/Izin).
- **Buku Piket Digital**: Mencatat kejadian penting atau izin siswa.
- **Buku Tamu**: Pencatatan tamu sekolah secara digital.
- **Auto-Refresh**: Data monitoring diperbarui otomatis setiap menit.

### 📊 Manajemen & Laporan
- **Jadwal Pelajaran**: Manajemen template jadwal, slot waktu, dan plotting guru.
- **Rekapan Kinerja**: Laporan otomatis kehadiran guru, total keterlambatan, dan persentase kehadiran.
- **Export PDF**: Cetak laporan kinerja bulanan dengan format resmi (Kop Surat Sekolah).

### 👥 Multi-Role User
- **Admin**: Akses penuh pengaturan sistem.
- **Guru**: Absensi, lihat jadwal, riwayat mengajar.
- **Piket**: Monitoring KBM, input izin manual.
- **Siswa**: Lihat jadwal pelajaran (View Only).

## 🛠️ Teknologi yang Digunakan

- **Backend**: Laravel 11
- **Frontend**: React.js (via Inertia.js)
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **Server**: Nginx, PHP-FPM
- **Containerization**: Docker & Docker Compose

## 📦 Instalasi & Penggunaan

### Prasyarat
- PHP >= 8.2
- Composer
- Node.js & NPM
- MySQL

### Cara Install (Local Development)

1. **Clone Repository**
   ```bash
   git clone https://github.com/Muzakie-ID/absensi-laravel.git
   cd repo-name
   ```

2. **Install Dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Sesuaikan konfigurasi database di file `.env`.*

4. **Migrasi Database**
   ```bash
   php artisan migrate --seed
   ```

5. **Jalankan Aplikasi**
   ```bash
   npm run dev
   # Di terminal terpisah:
   php artisan serve
   ```

### 🐳 Cara Deploy dengan Docker (VPS)

Aplikasi ini sudah dilengkapi konfigurasi Docker siap pakai (Production Ready).

1. **Setup Environment**
   Pastikan file `.env` sudah disesuaikan untuk production (APP_ENV=production, DB_HOST=mysql_db, dll).

2. **Build & Run Container**
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

3. **Setup Awal (Hanya sekali)**
   ```bash
   # Install dependencies & generate key
   docker compose exec laravel-inertia-app composer install --no-dev --optimize-autoloader
   docker compose exec laravel-inertia-app php artisan key:generate
   
   # Migrasi Database
   docker compose exec laravel-inertia-app php artisan migrate --force
   
   # Link Storage (PENTING untuk foto absensi)
   docker compose exec laravel-inertia-app php artisan storage:link
   
   # Fix Permission (Jika upload gagal)
   docker compose exec -u root laravel-inertia-app chmod -R 777 storage
   ```

4. **Setup Cronjob (Untuk Auto Alpha)**
   
   Agar sistem otomatis menandai "Alpha" bagi guru yang tidak absen hingga jam 23:59, tambahkan crontab di VPS:
   
   ```bash
   crontab -e
   ```
   
   Tambahkan baris berikut di paling bawah:
   ```bash
   * * * * * cd /path/ke/folder/absensi-laravel && docker compose exec -T laravel-inertia-app php artisan schedule:run >> /dev/null 2>&1
   ```
   *(Ganti `/path/ke/folder/absensi-laravel` dengan lokasi folder proyek Anda di VPS)*

## 📸 Screenshot

*(Tambahkan screenshot aplikasi di sini)*

## 📄 Lisensi

[MIT License](LICENSE)
