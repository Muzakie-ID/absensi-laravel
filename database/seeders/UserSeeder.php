<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = \App\Models\Role::where('name', 'admin')->first();
        $teacherRole = \App\Models\Role::where('name', 'teacher')->first();
        $picketRole = \App\Models\Role::where('name', 'picket')->first();

        // Password default diambil dari SEED_DEFAULT_PASSWORD.
        // Di production, jika tidak diisi, dibuat password acak dan ditampilkan sekali di console.
        $plainPassword = env('SEED_DEFAULT_PASSWORD');
        if (empty($plainPassword)) {
            if (app()->environment('production')) {
                $plainPassword = \Illuminate\Support\Str::password(16, symbols: false);
                $this->command?->warn("SEED_DEFAULT_PASSWORD kosong. Password acak untuk akun seed: {$plainPassword}");
                $this->command?->warn('Simpan password ini lalu segera ganti setelah login.');
            } else {
                $plainPassword = 'password';
            }
        }
        $password = bcrypt($plainPassword);

        // Create Admin
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@school.com'],
            [
                'name' => 'Administrator',
                'password' => $password,
                'role_id' => $adminRole->id,
            ]
        );

        // Create Picket
        \App\Models\User::firstOrCreate(
            ['email' => 'piket@school.com'],
            [
                'name' => 'Guru Piket',
                'password' => $password,
                'role_id' => $picketRole->id,
            ]
        );

        // Create Teachers
        $teachers = ['Pak Budi', 'Bu Siti', 'Pak Joko', 'Bu Ani', 'Pak Dedi'];
        foreach ($teachers as $index => $name) {
            \App\Models\User::firstOrCreate(
                ['email' => 'guru' . ($index + 1) . '@school.com'],
                [
                    'name' => $name,
                    'password' => $password,
                    'role_id' => $teacherRole->id,
                ]
            );
        }
    }
}
