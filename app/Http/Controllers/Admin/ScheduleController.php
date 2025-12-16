<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use App\Models\ScheduleTemplate;
use Illuminate\Http\Request;
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

        // We will process the updates. 
        // If subject_id or user_id is null, we delete the schedule.
        // Otherwise we update or create.

        foreach ($request->schedules as $data) {
            // Jika subject_id DAN user_id kosong, maka hapus jadwal
            if (empty($data['subject_id']) && empty($data['user_id'])) {
                Schedule::where('class_id', $schoolClass->id)
                    ->where('day', $data['day'])
                    ->where('learning_sequence', $data['learning_sequence'])
                    ->delete();
            } else {
                // Jika salah satu ada, update atau create
                Schedule::updateOrCreate(
                    [
                        'class_id' => $schoolClass->id,
                        'day' => $data['day'],
                        'learning_sequence' => $data['learning_sequence']
                    ],
                    [
                        'subject_id' => $data['subject_id'] ?: null,
                        'user_id' => $data['user_id'] ?: null
                    ]
                );
            }
        }

        return redirect()->back()->with('success', 'Jadwal berhasil diperbarui.');
    }
}
