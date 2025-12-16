<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AllowedRegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Contoh Data Guru
        \App\Models\AllowedRegistration::create([
            'identity_number' => '198501012010011001',
            'name' => 'Budi Santoso',
            'role_type' => 'teacher',
        ]);

        // Contoh Data Siswa
        \App\Models\AllowedRegistration::create([
            'identity_number' => '12345',
            'name' => 'Siti Aminah',
            'role_type' => 'student',
        ]);
    }
}
