<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use App\Models\ScheduleTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $classes = SchoolClass::with('classStatus')
            ->orderBy('level')
            ->orderBy('name')
            ->get();
        return Inertia::render('Admin/Schedules/Index', [
            'classes' => $classes
        ]);
    }

    public function edit(SchoolClass $schoolClass)
    {
        // Load existing schedules
        $schedules = Schedule::where('class_id', $schoolClass->id)
            ->get()
            ->groupBy('day'); // Group by day, then key by sequence

        // Re-map to [day][sequence] = schedule
        $mappedSchedules = [];
        foreach ($schedules as $day => $daySchedules) {
            foreach ($daySchedules as $schedule) {
                $mappedSchedules[$day][$schedule->learning_sequence] = $schedule;
            }
        }

        // Load Master Data
        $subjects = Subject::orderBy('name')->get();
        $teachers = User::where('role_id', 2)->orderBy('name')->get();

        // Load Active Template for structure
        $activeTemplate = ScheduleTemplate::where('is_active', true)
            ->with(['timeSlots' => function ($query) {
                $query->orderBy('period_order');
            }])
            ->first();

        return Inertia::render('Admin/Schedules/Edit', [
            'schoolClass' => $schoolClass,
            'schedules' => $mappedSchedules,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'activeTemplate' => $activeTemplate
        ]);
    }

    public function update(Request $request, SchoolClass $schoolClass)
    {
        $request->validate([
            'schedules' => 'array',
            'schedules.*.day' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu,minggu',
            'schedules.*.learning_sequence' => 'required|integer',
            'schedules.*.subject_id' => 'nullable|exists:subjects,id',
            'schedules.*.user_id' => 'nullable|exists:users,id',
        ]);

        // Validasi tambahan: jika ada subject_id atau user_id, keduanya harus ada
        foreach ($request->schedules as $index => $data) {
            if ((!empty($data['subject_id']) || !empty($data['user_id'])) && 
                (empty($data['subject_id']) || empty($data['user_id']))) {
                return redirect()->back()->withErrors([
                    'schedules.' . $index . '.validation' => 'Mapel dan Guru harus diisi bersama-sama. Jika salah satu tidak ingin diisi, kosongkan keduanya.'
                ]);
            }
        }

        // Jadwal tidak pernah di-update/dihapus permanen jika sudah punya riwayat absensi:
        // - dikosongkan  -> soft delete (riwayat tetap utuh)
        // - guru/mapel diganti & sudah ada absensi -> soft delete jadwal lama, buat jadwal baru
        //   (supaya absensi lama tetap tercatat atas nama guru & mapel yang sebenarnya)
        DB::transaction(function () use ($request, $schoolClass) {
            foreach ($request->schedules as $data) {
                $existing = Schedule::where('class_id', $schoolClass->id)
                    ->where('day', $data['day'])
                    ->where('learning_sequence', $data['learning_sequence'])
                    ->get();

                // Jika subject_id DAN user_id kosong, maka hapus jadwal (soft delete)
                if (empty($data['subject_id']) && empty($data['user_id'])) {
                    $existing->each->delete();
                    continue;
                }

                $current = $existing->first();

                // Bersihkan duplikat lama jika ada
                $existing->slice(1)->each->delete();

                if (!$current) {
                    Schedule::create([
                        'class_id' => $schoolClass->id,
                        'day' => $data['day'],
                        'learning_sequence' => $data['learning_sequence'],
                        'subject_id' => $data['subject_id'],
                        'user_id' => $data['user_id'],
                    ]);
                    continue;
                }

                $changed = (int) $current->subject_id !== (int) $data['subject_id']
                    || (int) $current->user_id !== (int) $data['user_id'];

                if (!$changed) {
                    continue;
                }

                if ($current->attendances()->exists()) {
                    $current->delete();
                    Schedule::create([
                        'class_id' => $schoolClass->id,
                        'day' => $data['day'],
                        'learning_sequence' => $data['learning_sequence'],
                        'subject_id' => $data['subject_id'],
                        'user_id' => $data['user_id'],
                    ]);
                } else {
                    $current->update([
                        'subject_id' => $data['subject_id'],
                        'user_id' => $data['user_id'],
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Jadwal berhasil diperbarui.');
    }
}
