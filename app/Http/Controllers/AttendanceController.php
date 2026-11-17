<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\TimeSlot;
use App\Support\Day;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Validasi bersama untuk create & store.
     * Mengembalikan RedirectResponse jika absensi tidak boleh dilakukan, atau null jika boleh.
     */
    private function guardAttendance(Schedule $schedule, ?TimeSlot $timeSlot)
    {
        // Jadwal harus milik user yang sedang login
        if ($schedule->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses ke jadwal ini.');
        }

        // Jadwal harus untuk hari ini
        if ($schedule->day !== Day::today()) {
            return redirect()->route('dashboard')->with('error', 'Jadwal ini bukan untuk hari ini.');
        }

        // Belum pernah absen untuk jadwal ini hari ini
        $alreadyAttended = Attendance::where('schedule_id', $schedule->id)
            ->whereDate('created_at', today())
            ->exists();

        if ($alreadyAttended) {
            return redirect()->route('dashboard')->with('message', 'Anda sudah melakukan absensi untuk jam ini.');
        }

        // Jam absensi belum berakhir
        if ($timeSlot && now()->gt(Carbon::parse($timeSlot->end_time))) {
            return redirect()->route('dashboard')->with('error', 'Waktu absen untuk jadwal ini sudah berakhir.');
        }

        return null;
    }

    public function create(Schedule $schedule)
    {
        $timeSlot = TimeSlot::findActiveFor($schedule->day, $schedule->learning_sequence);

        if ($redirect = $this->guardAttendance($schedule, $timeSlot)) {
            return $redirect;
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
        $timeSlot = TimeSlot::findActiveFor($schedule->day, $schedule->learning_sequence);

        if ($redirect = $this->guardAttendance($schedule, $timeSlot)) {
            return $redirect;
        }

        $request->validate([
            'status' => 'required|in:present,permit,sick,late',
            'photo' => 'required|image|max:5120', // Max 5MB
            'lat' => 'nullable|numeric|between:-90,90',
            'long' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string',
        ]);

        $file = $request->file('photo');

        if (!$file->isValid()) {
            return back()->withErrors(['photo' => 'Upload gagal: ' . $file->getErrorMessage()]);
        }

        $path = $file->store('attendance_photos', 'public');

        if (!$path) {
            return back()->withErrors(['photo' => 'Gagal menyimpan file ke server. Cek izin folder storage.']);
        }

        $created = DB::transaction(function () use ($request, $schedule, $timeSlot, $path) {
            // Kunci baris jadwal agar double-submit bersamaan tidak membuat absensi ganda
            Schedule::whereKey($schedule->id)->lockForUpdate()->first();

            $exists = Attendance::where('schedule_id', $schedule->id)
                ->whereDate('created_at', today())
                ->exists();

            if ($exists) {
                return false;
            }

            Attendance::create([
                'schedule_id' => $schedule->id,
                'user_id' => auth()->id(),
                'status' => $request->status,
                'photo_proof' => $path,
                'location_lat' => $request->lat ?? '0',
                'location_long' => $request->long ?? '0',
                'notes' => $request->notes,
                'check_in_time' => now(),
                'subject_name' => $schedule->subject->name,
                'class_name' => $schedule->schoolClass->name,
                'schedule_start_time' => $timeSlot?->start_time,
                'schedule_end_time' => $timeSlot?->end_time,
            ]);

            return true;
        });

        if (!$created) {
            Storage::disk('public')->delete($path);
            return redirect()->route('dashboard')->with('message', 'Anda sudah melakukan absensi untuk jam ini.');
        }

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
