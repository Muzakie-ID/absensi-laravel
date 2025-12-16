<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClassScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teacher1 = \App\Models\User::where('email', 'guru1@school.com')->first(); // Pak Budi
        $teacher2 = \App\Models\User::where('email', 'guru2@school.com')->first(); // Bu Siti

        $class1 = \App\Models\SchoolClass::where('name', 'X-RPL-1')->first();
        
        $math = \App\Models\Subject::where('code', 'MTK')->first();
        $indo = \App\Models\Subject::where('code', 'BIND')->first();

        // Jadwal X-RPL-1 Hari Senin
        // Urutan KBM 1: Matematika (Pak Budi)
        \App\Models\Schedule::firstOrCreate([
            'user_id' => $teacher1->id,
            'subject_id' => $math->id,
            'class_id' => $class1->id,
            'day' => 'senin',
            'learning_sequence' => 1,
        ]);

        // Urutan KBM 2: Matematika (Pak Budi)
        \App\Models\Schedule::firstOrCreate([
            'user_id' => $teacher1->id,
            'subject_id' => $math->id,
            'class_id' => $class1->id,
            'day' => 'senin',
            'learning_sequence' => 2,
        ]);

        // Urutan KBM 3: B. Indo (Bu Siti)
        \App\Models\Schedule::firstOrCreate([
            'user_id' => $teacher2->id,
            'subject_id' => $indo->id,
            'class_id' => $class1->id,
            'day' => 'senin',
            'learning_sequence' => 3,
        ]);

        // Jadwal X-RPL-1 Hari Selasa
        // Urutan KBM 1: B. Indo (Bu Siti)
        \App\Models\Schedule::create([
            'user_id' => $teacher2->id,
            'subject_id' => $indo->id,
            'class_id' => $class1->id,
            'day' => 'selasa',
            'learning_sequence' => 1,
        ]);

        // Urutan KBM 2: Matematika (Pak Budi) - Tambahan biar muncul di Dashboard
        \App\Models\Schedule::create([
            'user_id' => $teacher1->id,
            'subject_id' => $math->id,
            'class_id' => $class1->id,
            'day' => 'selasa',
            'learning_sequence' => 2,
        ]);
    }
}
