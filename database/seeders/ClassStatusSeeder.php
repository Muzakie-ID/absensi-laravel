<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClassStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Aktif',
                'code' => 'active',
                'color' => 'green',
            ],
            [
                'name' => 'PKL',
                'code' => 'internship',
                'color' => 'yellow',
            ],
            [
                'name' => 'Libur',
                'code' => 'holiday',
                'color' => 'red',
            ],
        ];

        foreach ($statuses as $status) {
            \App\Models\ClassStatus::firstOrCreate(
                ['code' => $status['code']],
                $status
            );
        }
    }
}
