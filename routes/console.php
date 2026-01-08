<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jalankan Auto Alpha antara jam 23:00 sampai 23:59 (Cek tiap 10 menit untuk memastikan)
Schedule::command('attendance:auto-alpha')
    ->everyTenMinutes()
    ->between('23:00', '23:59');

