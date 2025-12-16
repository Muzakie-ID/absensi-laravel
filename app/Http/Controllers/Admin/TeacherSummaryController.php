<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Attendance;
use App\Models\ScheduleTemplate;
use App\Models\TimeSlot;
use App\Models\Holiday;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherSummaryController extends Controller
{
    public function index()
    {
        // Get all users with role 'teacher' (role_id = 2)
        $teachers = User::where('role_id', 2)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/TeacherSummary/Index', [
            'teachers' => $teachers
        ]);
    }

    public function show(User $user, Request $request)
    {
        // Ensure the user is a teacher
        if ($user->role_id !== 2) {
            abort(404);
        }

        $data = $this->getSummaryData($user, $request);

        return Inertia::render('Admin/TeacherSummary/Show', $data);
    }

    public function export(User $user, Request $request)
    {
        // Ensure the user is a teacher
        if ($user->role_id !== 2) {
            abort(404);
        }

        $data = $this->getSummaryData($user, $request);

        return view('admin.teacher-summary.print', $data);
    }

    private function getSummaryData(User $user, Request $request)
    {
        $user->load(['role', 'schoolClass']);

        // Filter Periode
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth()->endOfDay();

        // Ambil Template Jadwal Aktif
        $activeTemplate = ScheduleTemplate::where('is_active', true)->first();
        
        // Ambil Time Slots untuk mapping jam
        $timeSlots = [];
        if ($activeTemplate) {
            $slots = TimeSlot::where('schedule_template_id', $activeTemplate->id)->get();
            foreach ($slots as $slot) {
                $timeSlots[$slot->day][$slot->period_order] = $slot;
            }
        }

        // Ambil Jadwal Guru
        $schedules = $user->schedules()
            ->with(['schoolClass.classStatus', 'subject'])
            ->orderBy('day')
            ->orderBy('learning_sequence')
            ->get()
            ->groupBy('day');

        // Ambil Hari Libur
        $holidays = Holiday::whereBetween('date', [$startDate, $endDate])->pluck('description', 'date')->toArray();

        // Ambil Absensi Real
        $attendances = Attendance::where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->keyBy(function ($item) {
                return $item->created_at->format('Y-m-d') . '-' . $item->schedule_id;
            });

        // Generate Jurnal Mengajar (Jadwal vs Realisasi)
        $journal = [];
        $stats = [
            'total_schedules' => 0,
            'present' => 0,
            'late' => 0,
            'permit' => 0, // Izin/Sakit digabung atau dipisah terserah
            'alpha' => 0,
            'total_late_minutes' => 0,
        ];

        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');
            $dayName = $this->getDayName($currentDate->dayOfWeek); // Helper function needed or manual map

            // Skip jika hari libur (opsional, tergantung kebijakan)
            // Jika ada di tabel holidays, kita tandai
            $isHoliday = isset($holidays[$dateStr]);
            $holidayDesc = $isHoliday ? $holidays[$dateStr] : null;

            if (isset($schedules[$dayName]) && !$isHoliday) {
                foreach ($schedules[$dayName] as $schedule) {
                    $stats['total_schedules']++;
                    
                    // Cari Time Slot
                    $timeSlot = $timeSlots[$dayName][$schedule->learning_sequence] ?? null;
                    $startTime = $timeSlot ? Carbon::parse($dateStr . ' ' . $timeSlot->start_time) : null;
                    $endTime = $timeSlot ? Carbon::parse($dateStr . ' ' . $timeSlot->end_time) : null;

                    // Cari Absensi
                    $attendanceKey = $dateStr . '-' . $schedule->id;
                    $attendance = $attendances[$attendanceKey] ?? null;

                    // Cek Status Kelas (Dynamic)
                    $classStatus = $schedule->schoolClass->classStatus;
                    $isClassActive = !$classStatus || $classStatus->code === 'active';

                    $status = 'alpha'; // Default internal status
                    $checkIn = null;
                    $checkOut = null;
                    $lateMinutes = 0;
                    
                    // Display Properties
                    $displayLabel = 'Alpha';
                    $displayColor = 'red';

                    if ($attendance) {
                        $status = $attendance->status;
                        $checkIn = $attendance->check_in_time ? Carbon::parse($attendance->check_in_time)->format('H:i') : null;
                        $checkOut = $attendance->check_out_time ? Carbon::parse($attendance->check_out_time)->format('H:i') : null;
                        
                        if ($status == 'present') {
                            $stats['present']++;
                            $displayLabel = 'Hadir';
                            $displayColor = 'green';
                        } elseif ($status == 'late') {
                            $stats['present']++;
                            $stats['late']++;
                            $displayLabel = 'Terlambat';
                            $displayColor = 'yellow';
                            
                            // Hitung keterlambatan jika ada start time
                            if ($startTime && $attendance->check_in_time) {
                                $actualCheckIn = Carbon::parse($attendance->check_in_time);
                                if ($actualCheckIn > $startTime) {
                                    $diff = $actualCheckIn->diffInMinutes($startTime);
                                    $lateMinutes = $diff;
                                    $stats['total_late_minutes'] += $diff;
                                }
                            }
                        } elseif ($status == 'permit') {
                            $stats['permit']++;
                            $displayLabel = 'Izin';
                            $displayColor = 'blue';
                        } elseif ($status == 'sick') {
                            $stats['permit']++;
                            $displayLabel = 'Sakit';
                            $displayColor = 'blue';
                        } else {
                            $stats['alpha']++;
                            $displayLabel = 'Alpha';
                            $displayColor = 'red';
                        }
                    } else {
                        if (!$isClassActive) {
                            $status = 'class_exempt';
                            $displayLabel = $classStatus->name;
                            $displayColor = $classStatus->color ?? 'gray';
                            $stats['total_schedules']--; // Tidak dihitung sebagai beban mengajar
                        } elseif ($currentDate->isFuture()) {
                            $status = 'future';
                            $displayLabel = 'Belum Mulai';
                            $displayColor = 'gray';
                            $stats['total_schedules']--; // Jangan hitung sebagai beban
                        } else {
                            $stats['alpha']++;
                            $displayLabel = 'Alpha';
                            $displayColor = 'red';
                        }
                    }

                    $journal[] = [
                        'date' => $dateStr,
                        'day' => ucfirst($dayName),
                        'class' => $schedule->schoolClass->name,
                        'subject' => $schedule->subject->name,
                        'schedule_time' => $timeSlot ? substr($timeSlot->start_time, 0, 5) . ' - ' . substr($timeSlot->end_time, 0, 5) : '-',
                        'check_in' => $checkIn,
                        'check_out' => $checkOut,
                        'status' => $status,
                        'late_minutes' => $lateMinutes,
                        'display' => [
                            'label' => $displayLabel,
                            'color' => $displayColor
                        ]
                    ];
                }
            }

            $currentDate->addDay();
        }

        // Hitung Persentase
        $stats['attendance_percentage'] = $stats['total_schedules'] > 0 
            ? round(($stats['present'] / $stats['total_schedules']) * 100, 1) 
            : 0;

        return [
            'user' => $user,
            'stats' => $stats,
            'journal' => $journal,
            'filters' => [
                'month' => $month,
                'year' => $year
            ]
        ];
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
