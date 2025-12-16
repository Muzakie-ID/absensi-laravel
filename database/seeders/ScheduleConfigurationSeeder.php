<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ScheduleConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get Activity Types
        $kbm = \App\Models\ActivityType::where('name', 'KBM')->first()->id;
        $break = \App\Models\ActivityType::where('name', 'Istirahat')->first()->id;
        $ceremony = \App\Models\ActivityType::where('name', 'Upacara')->first()->id;

        // 1. Template Normal
        $normalTemplate = \App\Models\ScheduleTemplate::firstOrCreate(
            ['name' => 'Jadwal Normal'],
            ['is_active' => true]
        );

        // Senin Normal (Upacara)
        $this->createSlot($normalTemplate->id, 'senin', 1, $ceremony, '07:00', '07:45', 'fixed');
        $this->createSlot($normalTemplate->id, 'senin', 2, $kbm, '07:45', '08:30', 'kbm_1');
        $this->createSlot($normalTemplate->id, 'senin', 3, $kbm, '08:30', '09:15', 'kbm_2');
        $this->createSlot($normalTemplate->id, 'senin', 4, $break,    '09:15', '09:30', 'fixed'); // Istirahat 15 menit
        $this->createSlot($normalTemplate->id, 'senin', 5, $kbm, '09:30', '10:15', 'kbm_3');

        // Selasa Normal (Full Belajar)
        $this->createSlot($normalTemplate->id, 'selasa', 1, $kbm, '07:00', '07:45', 'kbm_1');
        $this->createSlot($normalTemplate->id, 'selasa', 2, $kbm, '07:45', '08:30', 'kbm_2');
        $this->createSlot($normalTemplate->id, 'selasa', 3, $kbm, '08:30', '09:15', 'kbm_3');
        $this->createSlot($normalTemplate->id, 'selasa', 4, $break,    '09:15', '09:30', 'fixed');
        $this->createSlot($normalTemplate->id, 'selasa', 5, $kbm, '09:30', '10:15', 'kbm_4');


        // 2. Template MBG (Makan Bergizi Gratis)
        $mbgTemplate = \App\Models\ScheduleTemplate::firstOrCreate(
            ['name' => 'Program MBG'],
            ['is_active' => false]
        );

        // Senin MBG (Istirahat 30 Menit)
        $this->createSlot($mbgTemplate->id, 'senin', 1, $ceremony, '07:00', '07:45', 'fixed');
        $this->createSlot($mbgTemplate->id, 'senin', 2, $kbm, '07:45', '08:30', 'kbm_1');
        $this->createSlot($mbgTemplate->id, 'senin', 3, $kbm, '08:30', '09:15', 'kbm_2');
        $this->createSlot($mbgTemplate->id, 'senin', 4, $break,    '09:15', '09:45', 'fixed'); // Istirahat 30 menit
        $this->createSlot($mbgTemplate->id, 'senin', 5, $kbm, '09:45', '10:30', 'kbm_3'); // Jam geser
    }

    private function createSlot($templateId, $day, $order, $activityTypeId, $start, $end, $mapping)
    {
        \App\Models\TimeSlot::firstOrCreate(
            [
                'schedule_template_id' => $templateId,
                'day' => $day,
                'period_order' => $order,
            ],
            [
                'activity_type_id' => $activityTypeId,
                'start_time' => $start,
                'end_time' => $end,
                'mapping_source' => $mapping,
            ]
        );
    }
}
