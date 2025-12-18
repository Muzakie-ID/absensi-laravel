<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\ScheduleTemplate;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\TimeSlot;
use App\Models\User;
use App\Models\Holiday;
use App\Models\PicketLog;
use App\Models\GuestBook;
use App\Models\Announcement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->load('role');

        if ($user->role->name === 'admin') {
            return $this->adminDashboard();
        }

        // if ($user->role->name === 'picket') {
        //     return $this->monitoring();
        // }

        if ($user->role->name === 'student') {
            return $this->studentDashboard();
        }
        
        // 1. Tentukan Hari Ini (Senin, Selasa, dst)
        // Carbon::now()->locale('id')->dayName mengembalikan 'Senin', 'Selasa' jika locale diset ID
        // Untuk aman, kita mapping manual dari dayOfWeekIso (1=Senin, 7=Minggu)
        $days = [
            1 => 'senin', 2 => 'selasa', 3 => 'rabu', 4 => 'kamis', 
            5 => 'jumat', 6 => 'sabtu', 7 => 'minggu'
        ];
        $today = $days[Carbon::now()->dayOfWeekIso] ?? 'minggu';

                // Cek Hari Libur
        $holiday = Holiday::whereDate('date', Carbon::today())->first();
        if ($holiday) {
            $today = Carbon::today();
            $announcements = Announcement::where('is_active', true)
                ->where(function($query) use ($today) {
                    $query->whereNull('start_date')
                          ->orWhere('start_date', '<=', $today);
                })
                ->where(function($query) use ($today) {
                    $query->whereNull('end_date')
                          ->orWhere('end_date', '>=', $today);
                })
                ->latest()
                ->take(5)
                ->get();

            return Inertia::render('DashboardStudent', [
                'today' => ucfirst($today),
                'date' => Carbon::now()->translatedFormat('d F Y'),
                'schedule' => [],
                'holiday' => $holiday
            ]);
        }

        // 2. Ambil Template Jadwal yang Aktif
        $activeTemplate = ScheduleTemplate::where('is_active', true)->first();

        if (!$activeTemplate) {
            return Inertia::render('Dashboard', [
                'schedule' => [],
                'message' => 'Tidak ada template jadwal yang aktif.'
            ]);
        }

        // 3. Ambil Slot Waktu untuk Hari Ini berdasarkan Template Aktif
        $timeSlots = TimeSlot::with('activityType')
            ->where('schedule_template_id', $activeTemplate->id)
            ->where('day', $today)
            ->orderBy('period_order')
            ->get();

        // 4. Ambil Jadwal Mengajar Guru Hari Ini
        // Kita ambil semua jadwal guru hari ini, diurutkan berdasarkan sequence
        $teacherSchedules = Schedule::with(['schoolClass', 'subject'])
            ->where('user_id', $user->id)
            ->where('day', $today)
            ->get()
            ->keyBy('learning_sequence'); // Key array pakai sequence (1, 2, 3) biar gampang akses

        // 4.5 Ambil Data Absensi Hari Ini untuk User Ini
        $attendedScheduleIds = Attendance::where('user_id', $user->id)
            ->whereDate('created_at', Carbon::today())
            ->pluck('schedule_id')
            ->toArray();

        // 5. Gabungkan Slot Waktu dengan Jadwal Guru (Mapping Logic)
        $finalSchedule = $timeSlots->map(function ($slot) use ($teacherSchedules, $attendedScheduleIds) {
            $data = [
                'id' => $slot->id,
                'period_order' => $slot->period_order,
                'start_time' => Carbon::parse($slot->start_time)->format('H:i'),
                'end_time' => Carbon::parse($slot->end_time)->format('H:i'),
                'type' => $slot->type,
                'title' => '',
                'subtitle' => '',
                'status' => 'upcoming', // upcoming, ongoing, finished
                'can_attend' => false,
                'has_attended' => false,
            ];

            // Cek Status Waktu (Apakah jam ini sedang berlangsung?)
            $now = Carbon::now();
            $start = Carbon::parse($slot->start_time);
            $end = Carbon::parse($slot->end_time);

            if ($now->between($start, $end)) {
                $data['status'] = 'ongoing';
            } elseif ($now->gt($end)) {
                $data['status'] = 'finished';
            }

            // Logika Mapping Konten
            if ($slot->mapping_source === 'fixed' || $slot->type !== 'learning') {
                // Slot Tetap (Upacara, Istirahat)
                if ($slot->type === 'ceremony') $data['title'] = 'Upacara Bendera';
                elseif ($slot->type === 'break') $data['title'] = 'Istirahat';
                elseif ($slot->type === 'literacy') $data['title'] = 'Literasi';
                else $data['title'] = 'Kegiatan Lain';
                
                $data['subtitle'] = 'Seluruh Sekolah';

            } elseif ($slot->mapping_source) {
                // Slot KBM (Ambil dari Jadwal Guru)
                // Handle 'kbm_1' or just '1'
                $sequence = (int) str_replace('kbm_', '', $slot->mapping_source);
                
                if (isset($teacherSchedules[$sequence])) {
                    $schedule = $teacherSchedules[$sequence];
                    
                    // Cek Status Kelas (PKL atau Aktif)
                    if ($schedule->schoolClass->classStatus && $schedule->schoolClass->classStatus->code === 'active') {
                        $data['title'] = $schedule->schoolClass->name;
                        $data['subtitle'] = $schedule->subject->name;
                        $data['schedule_id'] = $schedule->id; // ID untuk absen

                        // Cek apakah sudah absen
                        if (in_array($schedule->id, $attendedScheduleIds)) {
                            $data['can_attend'] = false;
                            $data['has_attended'] = true;
                        } else {
                            $data['can_attend'] = true; // Tombol absen muncul
                            $data['has_attended'] = false;
                        }
                    } else {
                        $data['title'] = $schedule->schoolClass->name;
                        $data['subtitle'] = 'Kelas Sedang ' . ($schedule->schoolClass->classStatus ? strtoupper($schedule->schoolClass->classStatus->name) : 'TIDAK AKTIF');
                        $data['can_attend'] = false;
                        $data['is_disabled'] = true;
                    }
                } else {
                    // Guru tidak ada jadwal di urutan ini (Jam Kosong)
                    $data['title'] = 'Kosong';
                    $data['subtitle'] = 'Tidak ada jadwal mengajar';
                    $data['can_attend'] = false;
                }
            }

            return $data;
        });

        return Inertia::render('Dashboard', [
            'today' => ucfirst($today),
            'date' => Carbon::now()->translatedFormat('d F Y'),
            'schedule' => $finalSchedule
        ]);
    }

    public function monitoring(Request $request)
    {
        $days = [1 => 'senin', 2 => 'selasa', 3 => 'rabu', 4 => 'kamis', 5 => 'jumat', 6 => 'sabtu', 7 => 'minggu'];
        $today = $days[Carbon::now()->dayOfWeekIso] ?? 'minggu';
        $now = Carbon::now();

        // Cek Hari Libur
        $holiday = Holiday::whereDate('date', Carbon::today())->first();
        if ($holiday) {
            return Inertia::render('DashboardPicket', [
                'today' => ucfirst($today),
                'date' => $now->translatedFormat('d F Y'),
                'message' => 'Hari Libur: ' . $holiday->description,
                'holiday' => $holiday
            ]);
        }

        $activeTemplate = ScheduleTemplate::where('is_active', true)->first();
        
        if (!$activeTemplate) {
            return Inertia::render('DashboardPicket', ['message' => 'Tidak ada template jadwal aktif.']);
        }

        // Ambil semua slot hari ini untuk dropdown navigasi
        $allSlots = TimeSlot::with('activityType')
            ->where('schedule_template_id', $activeTemplate->id)
            ->where('day', $today)
            ->orderBy('period_order')
            ->get();

        // Tentukan Slot Waktu yang ditampilkan (Request > Current > Null)
        $currentSlot = null;

        if ($request->has('slot_id')) {
            $currentSlot = $allSlots->firstWhere('id', $request->slot_id);
        } else {
            // Cari yang sedang berlangsung
            $currentSlot = $allSlots->filter(function ($slot) use ($now) {
                return $now->format('H:i:s') >= $slot->start_time && $now->format('H:i:s') <= $slot->end_time;
            })->first();
        }

        $monitoringData = [];
        $slotInfo = null;

        if ($currentSlot) {
            $slotInfo = [
                'period_order' => $currentSlot->period_order,
                'start_time' => Carbon::parse($currentSlot->start_time)->format('H:i'),
                'end_time' => Carbon::parse($currentSlot->end_time)->format('H:i'),
                'type' => $currentSlot->type,
                'name' => $currentSlot->type === 'learning' ? 'Jam Ke-' . $currentSlot->period_order : strtoupper($currentSlot->type)
            ];

            if ($currentSlot->mapping_source && $currentSlot->type === 'learning') {
                $sequence = (int) str_replace('kbm_', '', $currentSlot->mapping_source);
                
                // Ambil semua kelas aktif
                $classes = SchoolClass::whereHas('classStatus', function($q) {
                    $q->where('code', 'active');
                })->get();
                
                foreach ($classes as $class) {
                    $schedule = Schedule::with(['user', 'subject'])
                        ->where('class_id', $class->id)
                        ->where('day', $today)
                        ->where('learning_sequence', $sequence)
                        ->first();

                    if ($schedule) {
                        // Cek Absensi
                        $attendance = Attendance::where('schedule_id', $schedule->id)
                            ->whereDate('created_at', Carbon::today())
                            ->first();
                        
                        $status = 'missing'; // Default: Belum Hadir
                        if ($attendance) {
                            $status = $attendance->status; // present, permit, sick, late
                        }

                        $monitoringData[] = [
                            'schedule_id' => $schedule->id,
                            'class_name' => $class->name,
                            'subject_name' => $schedule->subject->name,
                            'teacher_name' => $schedule->user->name,
                            'status' => $status,
                            'check_in_time' => $attendance ? $attendance->check_in_time->format('H:i') : '-',
                            'photo' => $attendance ? asset('storage/' . $attendance->photo_proof) : null,
                            'notes' => $attendance ? $attendance->notes : null,
                            'location_lat' => $attendance ? $attendance->location_lat : null,
                            'location_long' => $attendance ? $attendance->location_long : null,
                        ];
                    } else {
                        // Jam Kosong
                        $monitoringData[] = [
                            'class_name' => $class->name,
                            'subject_name' => '-',
                            'teacher_name' => '-',
                            'status' => 'empty',
                            'check_in_time' => '-',
                            'photo' => null,
                            'notes' => null,
                            'location_lat' => null,
                            'location_long' => null,
                        ];
                    }
                }
            }
        }

        // --- Tambahan Data untuk Dashboard Piket ---

        // 1. Statistik Ringkas (Hari Ini)
        $todayAttendances = Attendance::whereDate('created_at', Carbon::today())->get();
        
        // Guru Hadir: Unik user_id yang statusnya present/late hari ini
        $presentCount = $todayAttendances->whereIn('status', ['present', 'late'])->pluck('user_id')->unique()->count();
        
        // Guru Izin/Sakit: Unik user_id yang statusnya sick/permit hari ini
        $absentCount = $todayAttendances->whereIn('status', ['sick', 'permit'])->pluck('user_id')->unique()->count();

        // Kelas Kosong (Saat Ini): Hitung dari $monitoringData yang statusnya 'missing', 'alpha', atau 'empty'
        $emptyClassesCount = collect($monitoringData)->whereIn('status', ['missing', 'alpha', 'empty'])->count();

        $stats = [
            'present' => $presentCount,
            'absent' => $absentCount,
            'empty_classes' => $emptyClassesCount
        ];

        // 2. Daftar Guru Izin/Sakit (Rekap)
        $absentRecap = Attendance::with(['user', 'schedule.schoolClass', 'schedule.subject'])
            ->whereDate('created_at', Carbon::today())
            ->whereIn('status', ['sick', 'permit'])
            ->latest()
            ->get()
            ->map(function($att) {
                return [
                    'teacher_name' => $att->user->name,
                    'status' => $att->status,
                    'class_name' => $att->schedule ? $att->schedule->schoolClass->name : '-',
                    'subject_name' => $att->schedule ? $att->schedule->subject->name : '-',
                    'notes' => $att->notes,
                    'time' => $att->check_in_time ? $att->check_in_time->format('H:i') : '-',
                ];
            });

        // 3. Buku Piket (Log Harian)
        $picketLogs = PicketLog::with('schoolClass')
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->get();

        // 4. Buku Tamu
        $guestBooks = GuestBook::whereDate('created_at', Carbon::today())
            ->latest()
            ->get();
            
        // 5. Data Kelas untuk Dropdown
        $allClasses = SchoolClass::whereHas('classStatus', function($q) {
            $q->where('code', 'active');
        })->get(['id', 'name']);

        return Inertia::render('DashboardPicket', [
            'today' => ucfirst($today),
            'date' => $now->translatedFormat('d F Y'),
            'slotInfo' => $slotInfo,
            'monitoringData' => $monitoringData,
            'stats' => $stats,
            'absentRecap' => $absentRecap,
            'picketLogs' => $picketLogs,
            'guestBooks' => $guestBooks,
            'allClasses' => $allClasses,
            'allSlots' => $allSlots,
            'currentSlotId' => $currentSlot ? $currentSlot->id : null,
        ]);
    }

    public function updateAttendance(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'status' => 'required|in:present,late,sick,permit,missing,alpha',
            'notes' => 'nullable|string|max:255',
        ]);

        $schedule = Schedule::findOrFail($request->schedule_id);
        
        $attendance = Attendance::where('schedule_id', $schedule->id)
            ->whereDate('created_at', Carbon::today())
            ->first();

        if ($request->status === 'missing') {
            if ($attendance) {
                $attendance->delete();
            }
            return redirect()->back()->with('success', 'Status kehadiran berhasil direset (Belum Hadir).');
        }

        if ($attendance) {
            $attendance->update([
                'status' => $request->status,
                'notes' => $request->notes ?? $attendance->notes,
            ]);
        } else {
            Attendance::create([
                'schedule_id' => $schedule->id,
                'user_id' => $schedule->user_id,
                'status' => $request->status,
                'check_in_time' => Carbon::now(),
                'photo_proof' => 'manual_override', // Placeholder
                'notes' => $request->notes ?? 'Diupdate manual oleh Admin/Piket',
                'location_lat' => '0',
                'location_long' => '0',
            ]);
        }

        return redirect()->back()->with('success', 'Status kehadiran berhasil diperbarui.');
    }

    private function adminDashboard()
    {
        // 1. Statistik Utama
        $stats = [
            'teachers' => User::where('role_id', 2)->count(),
            'students' => 0, // Jika nanti ada data siswa
            'classes' => SchoolClass::whereHas('classStatus', function($q) {
                $q->where('code', 'active');
            })->count(),
            'subjects' => Subject::count(),
        ];

        // 2. Template Aktif
        $activeTemplate = ScheduleTemplate::where('is_active', true)->first();

        // 3. Ringkasan Kehadiran Hari Ini
        $today = Carbon::today();
        $attendanceStats = [
            'present' => Attendance::whereDate('created_at', $today)->where('status', 'present')->count(),
            'late' => Attendance::whereDate('created_at', $today)->where('status', 'late')->count(),
            'sick' => Attendance::whereDate('created_at', $today)->where('status', 'sick')->count(),
            'permit' => Attendance::whereDate('created_at', $today)->where('status', 'permit')->count(),
        ];

        // 4. Guru yang Izin/Sakit Hari Ini (Terbaru 5)
        $absentTeachers = Attendance::with(['schedule.user', 'schedule.schoolClass'])
            ->whereDate('created_at', $today)
            ->whereIn('status', ['sick', 'permit'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($attendance) {
                return [
                    'teacher_name' => $attendance->schedule->user->name,
                    'class_name' => $attendance->schedule->schoolClass->name,
                    'status' => $attendance->status,
                    'time' => $attendance->created_at->format('H:i'),
                    'notes' => $attendance->notes
                ];
            });

        // 5. Top 5 Guru Sering Izin (Bulan Ini)
        $topPermissionTeachers = Attendance::whereIn('status', ['permit', 'sick'])
            ->whereMonth('created_at', Carbon::now()->month)
            ->select('user_id', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
            ->with('user')
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->user->name,
                    'total' => $item->total
                ];
            });

        // 6. Top 5 Kelas Sering Jam Kosong (Bulan Ini) - Guru Izin/Sakit/Alpha
        $topEmptyClasses = Attendance::whereIn('status', ['permit', 'sick', 'alpha'])
            ->whereMonth('attendances.created_at', Carbon::now()->month)
            ->join('schedules', 'attendances.schedule_id', '=', 'schedules.id')
            ->join('classes', 'schedules.class_id', '=', 'classes.id')
            ->select('classes.name', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
            ->groupBy('classes.name')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'activeTemplate' => $activeTemplate,
            'attendanceStats' => $attendanceStats,
            'absentTeachers' => $absentTeachers,
            'topPermissionTeachers' => $topPermissionTeachers,
            'topEmptyClasses' => $topEmptyClasses,
            'date' => Carbon::now()->translatedFormat('l, d F Y')
        ]);
    }

    private function studentDashboard()
    {
        $user = auth()->user();
        
        if (!$user->school_class_id) {
            return Inertia::render('DashboardStudent', [
                'error' => 'Anda belum terdaftar di kelas manapun. Hubungi admin.'
            ]);
        }

        $days = [
            1 => 'senin', 2 => 'selasa', 3 => 'rabu', 4 => 'kamis', 
            5 => 'jumat', 6 => 'sabtu', 7 => 'minggu'
        ];
        $todayName = $days[Carbon::now()->dayOfWeekIso] ?? 'minggu';

        // Cek Hari Libur
        $holiday = Holiday::whereDate('date', Carbon::today())->first();

        // Get Active Template
        $activeTemplate = ScheduleTemplate::where('is_active', true)->first();
        if (!$activeTemplate) {
             return Inertia::render('DashboardStudent', [
                'error' => 'Tidak ada jadwal aktif.'
            ]);
        }

        // Get Schedules
        $schedules = Schedule::with(['user', 'subject'])
            ->where('class_id', $user->school_class_id)
            ->get()
            ->groupBy('day');

        // Get TimeSlots
        $allTimeSlots = TimeSlot::with('activityType')
            ->where('schedule_template_id', $activeTemplate->id)
            ->orderBy('period_order')
            ->get()
            ->groupBy('day');
            
        $weeklySchedule = [];
        $dayOrder = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']; 
        
        foreach ($dayOrder as $day) {
            $slots = $allTimeSlots[$day] ?? collect([]);
            $daySchedules = $schedules[$day] ?? collect([]);
            
            $dayData = $slots->map(function($slot) use ($daySchedules, $todayName, $day) {
                $scheduleItem = null;
                $teacherStatus = null;
                
                if ($slot->type === 'learning') {
                    $scheduleItem = $daySchedules->firstWhere('learning_sequence', $slot->period_order);
                    
                    if ($day === $todayName && $scheduleItem) {
                        $attendance = Attendance::where('schedule_id', $scheduleItem->id)
                            ->whereDate('created_at', Carbon::today())
                            ->first();
                            
                        if ($attendance) {
                            $teacherStatus = $attendance->status; 
                        } else {
                            $teacherStatus = 'waiting';
                        }
                    }
                }
                
                return [
                    'time' => Carbon::parse($slot->start_time)->format('H:i') . ' - ' . Carbon::parse($slot->end_time)->format('H:i'),
                    'type' => $slot->type,
                    'subject' => $scheduleItem ? $scheduleItem->subject->name : ($slot->activityType ? $slot->activityType->name : '-'),
                    'teacher' => $scheduleItem ? $scheduleItem->user->name : '-',
                    'teacher_status' => $teacherStatus,
                    'is_current' => $day === $todayName && Carbon::now()->between(Carbon::parse($slot->start_time), Carbon::parse($slot->end_time))
                ];
            });
            
            $weeklySchedule[$day] = $dayData;
        }

        // Get Active Announcements
        $today = Carbon::today();
        $announcements = Announcement::where('is_active', true)
            ->where(function($query) use ($today) {
                $query->whereNull('start_date')
                      ->orWhere('start_date', '<=', $today);
            })
            ->where(function($query) use ($today) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', $today);
            })
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('DashboardStudent', [
            'schedule' => $weeklySchedule,
            'today' => ucfirst($todayName),
            'date' => Carbon::now()->translatedFormat('d F Y'),
            'className' => $user->schoolClass->name,
            'announcements' => $announcements,
            'holiday' => $holiday
        ]);
    }
}
