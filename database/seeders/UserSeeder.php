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

        // Create Admin
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@school.com'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password'),
                'role_id' => $adminRole->id,
            ]
        );

        // Create Picket
        \App\Models\User::firstOrCreate(
            ['email' => 'piket@school.com'],
            [
                'name' => 'Guru Piket',
                'password' => bcrypt('password'),
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
                    'password' => bcrypt('password'),
                    'role_id' => $teacherRole->id,
                ]
            );
        }
    }
}
