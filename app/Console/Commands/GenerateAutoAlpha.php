<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\ScheduleTemplate;
use App\Models\TimeSlot;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateAutoAlpha extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:auto-alpha';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate status Alpha otomatis untuk guru yang tidak absen hari ini';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::now();
        $dayName = $this->getDayName($today->dayOfWeek);
        
        $this->info("Menjalankan Auto-Alpha untuk hari: " . ucfirst($dayName) . " (" . $today->format('Y-m-d') . ")");

        // 1. Ambil Template & TimeSlot Aktif (Untuk snapshot jam)
        $activeTemplate = ScheduleTemplate::where('is_active', true)->first();
        $timeSlots = [];
        if ($activeTemplate) {
            $slots = TimeSlot::where('schedule_template_id', $activeTemplate->id)
                ->where('day', $dayName)
                ->get();
            foreach ($slots as $slot) {
                $timeSlots[$slot->period_order] = $slot;
            }
        }

        // 2. Ambil Semua Jadwal Hari Ini
        $schedules = Schedule::with(['subject', 'schoolClass', 'user'])
            ->where('day', $dayName)
            ->get();

        $count = 0;

        foreach ($schedules as $schedule) {
            // Cek apakah Libur? (Opsional, sementara kita skip logika libur dulu atau implementasikan sederhana)
            // Jika ingin cek libur, harus load model Holiday. Tapi asumsi cronjob dimatikan saat libur atau dicek manual.
            
            // 3. Cek Apakah Sudah Absen
            $alreadyPresent = Attendance::where('schedule_id', $schedule->id)
                ->whereDate('created_at', $today)
                ->exists();

            if (!$alreadyPresent) {
                // Siapkan Snapshot Time
                $timeSlot = $timeSlots[$schedule->learning_sequence] ?? null;
                $startTime = $timeSlot ? $timeSlot->start_time : null;
                $endTime = $timeSlot ? $timeSlot->end_time : null;

                // 4. Insert Alpha
                Attendance::create([
                    'schedule_id' => $schedule->id,
                    'user_id' => $schedule->user_id,
                    'status' => 'alpha',
                    'notes' => 'Otomatis by System (Tidak Absen hingga 23:59)',
                    'check_in_time' => null, // Atau now() agar masuk sorting
                    'photo_proof' => null,
                    'location_lat' => '0',
                    'location_long' => '0',
                    // Snapshot Columns
                    'subject_name' => $schedule->subject->name,
                    'class_name' => $schedule->schoolClass->name,
                    'schedule_start_time' => $startTime,
                    'schedule_end_time' => $endTime,
                    'created_at' => $today->endOfDay(), // Set di akhir hari
                ]);

                $this->info("Alpha Created: {$schedule->user->name} - {$schedule->schoolClass->name}");
                $count++;
            }
        }

        $this->info("Selesai. Total Alpha digenerate: $count");
    }

    private function getDayName($dayOfWeek)
    {
        $days = [
            0 => 'minggu',
            1 => 'senin',
            2 => 'selasa',
            3 => 'rabu',
            4 => 'kamis',
            5 => 'jumat',
            6 => 'sabtu',
        ];
        return $days[$dayOfWeek];
    }
}
