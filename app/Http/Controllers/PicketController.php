<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PicketController extends Controller
{
    public function storeLog(Request $request)
    {
        $request->validate([
            'type' => 'required|in:late,permission_leave,incident',
            'student_name' => 'nullable|required_if:type,late,permission_leave|string|max:255',
            'class_id' => 'nullable|required_if:type,late,permission_leave|exists:classes,id',
            'reason' => 'required|string',
            'points' => 'nullable|integer|min:0',
            'time' => 'nullable|date_format:H:i',
        ]);

        \App\Models\PicketLog::create([
            'type' => $request->type,
            'student_name' => $request->student_name,
            'class_id' => $request->class_id,
            'reason' => $request->reason,
            'points' => $request->points ?? 0,
            'time' => $request->time ?? now()->format('H:i'),
            'reporter_id' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Catatan piket berhasil disimpan.');
    }

    public function storeGuest(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'institution' => 'nullable|string|max:255',
            'meet_who' => 'required|string|max:255',
            'purpose' => 'required|string',
        ]);

        \App\Models\GuestBook::create([
            'name' => $request->name,
            'institution' => $request->institution,
            'meet_who' => $request->meet_who,
            'purpose' => $request->purpose,
            'check_in_time' => now(),
        ]);

        return redirect()->back()->with('success', 'Tamu berhasil dicatat.');
    }

    public function checkoutGuest(\App\Models\GuestBook $guestBook)
    {
        $guestBook->update([
            'check_out_time' => now(),
        ]);

        return redirect()->back()->with('success', 'Tamu berhasil checkout.');
    }

    public function searchSchedule(Request $request)
    {
        $query = $request->input('query');
        
        if (!$query) {
            return response()->json([]);
        }

        $activeTemplate = \App\Models\ScheduleTemplate::where('is_active', true)->first();
        if (!$activeTemplate) {
             return response()->json([]);
        }

        // Fallback manual mapping if locale not set
        $days = [1 => 'senin', 2 => 'selasa', 3 => 'rabu', 4 => 'kamis', 5 => 'jumat', 6 => 'sabtu', 7 => 'minggu'];
        $today = $days[\Carbon\Carbon::now()->dayOfWeekIso] ?? 'minggu';

        // Get TimeSlots for today
        $timeSlots = \App\Models\TimeSlot::where('schedule_template_id', $activeTemplate->id)
            ->where('day', $today)
            ->get()
            ->keyBy('period_order');

        $results = [];

        // Cari Guru
        $teachers = \App\Models\User::where('role_id', 2) // Guru
            ->where('name', 'like', "%{$query}%")
            ->get();

        foreach ($teachers as $teacher) {
            // Cari jadwal guru ini yang sedang berlangsung atau akan datang hari ini
            $schedules = \App\Models\Schedule::with(['schoolClass', 'subject'])
                ->where('user_id', $teacher->id)
                ->where('day', $today)
                ->get();

            foreach ($schedules as $sch) {
                $timeSlot = $timeSlots[$sch->learning_sequence] ?? null;
                if ($timeSlot) {
                    $results[] = [
                        'type' => 'teacher',
                        'title' => $teacher->name,
                        'subtitle' => "Mengajar {$sch->subject->name} di {$sch->schoolClass->name}",
                        'time' => \Carbon\Carbon::parse($timeSlot->start_time)->format('H:i') . " - " . \Carbon\Carbon::parse($timeSlot->end_time)->format('H:i'),
                        'status' => 'Hari Ini'
                    ];
                }
            }
        }

        // Cari Kelas
        $classes = \App\Models\SchoolClass::where('name', 'like', "%{$query}%")->get();
        foreach ($classes as $class) {
             $schedules = \App\Models\Schedule::with(['user', 'subject'])
                ->where('class_id', $class->id)
                ->where('day', $today)
                ->get();
            
            foreach ($schedules as $sch) {
                $timeSlot = $timeSlots[$sch->learning_sequence] ?? null;
                if ($timeSlot) {
                    $results[] = [
                        'type' => 'class',
                        'title' => $class->name,
                        'subtitle' => "Pelajaran {$sch->subject->name} ({$sch->user->name})",
                        'time' => \Carbon\Carbon::parse($timeSlot->start_time)->format('H:i') . " - " . \Carbon\Carbon::parse($timeSlot->end_time)->format('H:i'),
                        'status' => 'Hari Ini'
                    ];
                }
            }
        }

        return response()->json($results);
    }
}
