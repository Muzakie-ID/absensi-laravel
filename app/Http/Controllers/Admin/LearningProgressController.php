<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LearningProgressController extends Controller
{
    public function index(Request $request)
    {
        $classes = SchoolClass::orderBy('name')->get();
        
        $subjectsQuery = Subject::query();
        
        if ($request->filled('school_class_id')) {
            $subjectsQuery->whereHas('schedules', function($q) use ($request) {
                $q->where('class_id', $request->school_class_id);
            });
        }

        $subjects = $subjectsQuery->orderBy('name')->get();

        $progress = null;

        if ($request->has(['school_class_id', 'subject_id'])) {
            $progress = Attendance::with(['user', 'schedule'])
                ->whereHas('schedule', function ($query) use ($request) {
                    $query->where('class_id', $request->school_class_id)
                          ->where('subject_id', $request->subject_id);
                })
                ->whereNotNull('notes') // Hanya yang ada catatan materinya
                ->latest() // Urutkan dari yang terbaru (untuk timeline atas) atau oldes (bawah)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'date' => $item->created_at->translatedFormat('l, d F Y'),
                        'time' => $item->created_at->format('H:i'),
                        'teacher_name' => $item->user->name,
                        'notes' => $item->notes,
                        'photo_proof' => ($item->photo_proof && $item->photo_proof !== 'manual_override') 
                            ? asset('storage/' . $item->photo_proof) 
                            : null,
                        'status' => $item->status,
                        'is_substitute' => false, // Nanti bisa dikembangkan jika ada fitur guru pengganti
                    ];
                });
        }

        return Inertia::render('Admin/LearningProgress/Index', [
            'classes' => $classes,
            'subjects' => $subjects,
            'progress' => $progress,
            'filters' => $request->only(['school_class_id', 'subject_id']),
        ]);
    }
}
