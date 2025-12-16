<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Activity Types
        $activityTypes = [
            ['name' => 'KBM', 'description' => 'Kegiatan Belajar Mengajar'],
            ['name' => 'Istirahat', 'description' => 'Waktu Istirahat'],
            ['name' => 'Upacara', 'description' => 'Upacara Bendera'],
            ['name' => 'Literasi', 'description' => 'Kegiatan Literasi'],
            ['name' => 'Lainnya', 'description' => 'Kegiatan Lainnya'],
        ];

        foreach ($activityTypes as $type) {
            \App\Models\ActivityType::firstOrCreate(
                ['name' => $type['name']],
                $type
            );
        }

        // Get Status IDs
        $activeStatus = \App\Models\ClassStatus::where('code', 'active')->first()->id;
        $internshipStatus = \App\Models\ClassStatus::where('code', 'internship')->first()->id;

        // Create Classes
        $classes = [
            ['name' => 'X-RPL-1', 'level' => 10, 'class_status_id' => $activeStatus],
            ['name' => 'X-RPL-2', 'level' => 10, 'class_status_id' => $activeStatus],
            ['name' => 'XI-TKJ-1', 'level' => 11, 'class_status_id' => $activeStatus],
            ['name' => 'XII-RPL-1', 'level' => 12, 'class_status_id' => $internshipStatus], // Sedang PKL
        ];

        foreach ($classes as $class) {
            \App\Models\SchoolClass::firstOrCreate(
                ['name' => $class['name']],
                $class
            );
        }

        // Create Subjects
        $subjects = [
            ['name' => 'Matematika', 'code' => 'MTK'],
            ['name' => 'Bahasa Indonesia', 'code' => 'BIND'],
            ['name' => 'Bahasa Inggris', 'code' => 'BING'],
            ['name' => 'Pemrograman Web', 'code' => 'WEB'],
            ['name' => 'Basis Data', 'code' => 'BD'],
            ['name' => 'Pendidikan Agama', 'code' => 'PAI'],
        ];

        foreach ($subjects as $subject) {
            \App\Models\Subject::firstOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }
    }
}
