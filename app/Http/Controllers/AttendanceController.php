<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function create(Schedule $schedule)
    {
        // Validasi: Pastikan jadwal ini milik user yang sedang login
        if ($schedule->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses ke jadwal ini.');
        }

        // Validasi: Cek apakah sudah absen sebelumnya
        $existingAttendance = Attendance::where('schedule_id', $schedule->id)
            ->whereDate('created_at', now())
            ->first();

        if ($existingAttendance) {
            return redirect()->route('dashboard')->with('message', 'Anda sudah melakukan absensi untuk jam ini.');
        }

        // Fitur Flashback: Ambil materi terakhir dari kelas & mapel yang sama
        $lastAttendance = Attendance::where('user_id', auth()->id())
            ->whereHas('schedule', function ($query) use ($schedule) {
                $query->where('class_id', $schedule->class_id)
                      ->where('subject_id', $schedule->subject_id);
            })
            ->where('created_at', '<', now()->startOfDay()) // Hanya ambil yang sebelum hari ini
            ->latest()
            ->first();

        return Inertia::render('Attendance/Create', [
            'schedule' => $schedule->load(['schoolClass', 'subject']),
            'lastAttendance' => $lastAttendance,
        ]);
    }

    public function store(Request $request, Schedule $schedule)
    {
        $request->validate([
            'status' => 'required|in:present,permit,sick,late',
            'photo' => 'required|image|max:5120', // Max 5MB
            'lat' => 'nullable',
            'long' => 'nullable',
            'notes' => 'nullable|string',
        ]);

        $path = $request->file('photo')->store('attendance_photos', 'public');

        Attendance::create([
            'schedule_id' => $schedule->id,
            'user_id' => auth()->id(),
            'status' => $request->status,
            'photo_proof' => $path,
            'location_lat' => $request->lat ?? '0',
            'location_long' => $request->long ?? '0',
            'notes' => $request->notes,
            'check_in_time' => now(),
        ]);

        return redirect()->route('dashboard')->with('success', 'Absensi berhasil dicatat!');
    }

    public function history(Request $request)
    {
        $user = auth()->user();
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $query = Attendance::with(['schedule.schoolClass', 'schedule.subject'])
            ->where('user_id', $user->id)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);

        // Stats
        $stats = [
            'present' => (clone $query)->where('status', 'present')->count(),
            'late' => (clone $query)->where('status', 'late')->count(),
            'sick' => (clone $query)->where('status', 'sick')->count(),
            'permit' => (clone $query)->where('status', 'permit')->count(),
            'total' => (clone $query)->count(),
        ];

        $attendances = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Attendance/History', [
            'attendances' => $attendances,
            'stats' => $stats,
            'filters' => ['month' => (int)$month, 'year' => (int)$year]
        ]);
    }
}
