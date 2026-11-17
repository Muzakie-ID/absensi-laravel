<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Schedule;
use App\Models\ScheduleTemplate;
use App\Models\TimeSlot;
use App\Support\Day;
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
        $dayName = Day::name($today);

        $this->info("Menjalankan Auto-Alpha untuk hari: " . ucfirst($dayName) . " (" . $today->format('Y-m-d') . ")");

        // 0. Hari libur -> tidak ada Alpha
        $holiday = Holiday::whereDate('date', $today->toDateString())->first();
        if ($holiday) {
            $this->info("Hari libur ({$holiday->description}). Auto-Alpha dilewati.");
            return self::SUCCESS;
        }

        // 1. Tanpa template aktif guru tidak bisa absen, jadi jangan beri Alpha
        $activeTemplate = ScheduleTemplate::where('is_active', true)->first();
        if (!$activeTemplate) {
            $this->warn('Tidak ada template jadwal aktif. Auto-Alpha dilewati.');
            return self::SUCCESS;
        }

        // Slot KBM hari ini, di-key berdasarkan urutan KBM (dari mapping_source)
        $timeSlots = [];
        $slots = TimeSlot::where('schedule_template_id', $activeTemplate->id)
            ->where('day', $dayName)
            ->get();
        foreach ($slots as $slot) {
            if ($sequence = TimeSlot::parseSequence($slot->mapping_source)) {
                $timeSlots[$sequence] = $slot;
            }
        }

        // 2. Ambil semua jadwal hari ini (jadwal yang di-soft-delete otomatis tidak ikut)
        $schedules = Schedule::with(['subject', 'schoolClass.classStatus', 'user'])
            ->where('day', $dayName)
            ->get();

        // Absensi yang sudah ada hari ini (1 query, bukan per jadwal)
        $attendedScheduleIds = Attendance::whereDate('created_at', $today->toDateString())
            ->whereIn('schedule_id', $schedules->pluck('id'))
            ->pluck('schedule_id')
            ->flip();

        $count = 0;
        $skipped = 0;

        foreach ($schedules as $schedule) {
            if (isset($attendedScheduleIds[$schedule->id])) {
                continue;
            }

            // 3. Kelas tidak aktif (PKL, nonaktif, dll) -> tidak ada KBM
            $classStatus = $schedule->schoolClass?->classStatus;
            if (!$classStatus || $classStatus->code !== 'active') {
                $skipped++;
                continue;
            }

            // 4. Urutan KBM ini tidak ada di template aktif hari ini
            //    (mis. template MBG punya jam lebih sedikit) -> guru tidak bisa absen
            $timeSlot = $timeSlots[$schedule->learning_sequence] ?? null;
            if (!$timeSlot) {
                $skipped++;
                continue;
            }

            // 5. Insert Alpha
            Attendance::create([
                'schedule_id' => $schedule->id,
                'user_id' => $schedule->user_id,
                'status' => 'alpha',
                'notes' => 'Otomatis by System (Tidak Absen hingga 23:59)',
                'check_in_time' => null,
                'photo_proof' => null,
                'location_lat' => '0',
                'location_long' => '0',
                // Snapshot Columns
                'subject_name' => $schedule->subject?->name,
                'class_name' => $schedule->schoolClass?->name,
                'schedule_start_time' => $timeSlot->start_time,
                'schedule_end_time' => $timeSlot->end_time,
            ]);

            $this->info("Alpha Created: {$schedule->user?->name} - {$schedule->schoolClass?->name}");
            $count++;
        }

        $this->info("Selesai. Total Alpha digenerate: $count (dilewati: $skipped)");

        return self::SUCCESS;
    }
}
