<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AllowedRegistration;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClassPromotionController extends Controller
{
    public function index(Request $request)
    {
        $classes = SchoolClass::whereHas('classStatus', function($q) {
            $q->where('code', 'active');
        })
        ->withCount(['students' => function ($query) {
            $query->where('role_type', 'student');
        }])
        ->orderBy('level')
        ->orderBy('name')
        ->get();

        $levels = SchoolClass::select('level')->whereNotNull('level')->distinct()->orderBy('level')->pluck('level');

        $students = [];
        if ($request->has('from_class_id')) {
            $students = AllowedRegistration::where('role_type', 'student')
                ->where('school_class_id', $request->from_class_id)
                ->orderBy('name')
                ->get();
        }

        return Inertia::render('Admin/ClassPromotions/Index', [
            'classes' => $classes,
            'levels' => $levels,
            'students' => $students,
            'filters' => $request->only(['from_class_id'])
        ]);
    }

    public function store(Request $request)
    {
        // ... existing store logic ...
        $request->validate([
            'from_class_id' => 'required|exists:classes,id',
            'to_class_id' => 'required|exists:classes,id|different:from_class_id',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:allowed_registrations,id',
        ]);

        DB::transaction(function () use ($request) {
            $this->moveStudents($request->student_ids, $request->to_class_id);
        });

        return redirect()->route('admin.class-promotions.index', ['from_class_id' => $request->from_class_id])
            ->with('success', 'Siswa berhasil dipindahkan ke kelas baru.');
    }

    public function storeLevel(Request $request)
    {
        $request->validate([
            'mappings' => 'required|array',
            'mappings.*.from_class_id' => 'required|exists:classes,id',
            // to_class_id can be 'alumni' or a valid class id
            'mappings.*.to_class_id' => 'required', 
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->mappings as $mapping) {
                // Get all students in from_class_id
                $studentIds = AllowedRegistration::where('role_type', 'student')
                    ->where('school_class_id', $mapping['from_class_id'])
                    ->pluck('id');
                
                if ($studentIds->isNotEmpty()) {
                    $toClassId = $mapping['to_class_id'] === 'alumni' ? null : $mapping['to_class_id'];
                    $this->moveStudents($studentIds, $toClassId);
                }
            }
        });

        return redirect()->route('admin.class-promotions.index')
            ->with('success', 'Kenaikan tingkat berhasil diproses.');
    }

    private function moveStudents($studentIds, $toClassId)
    {
        // 1. Update AllowedRegistration (Whitelist)
        AllowedRegistration::whereIn('id', $studentIds)
            ->update(['school_class_id' => $toClassId]);

        // 2. Update Users (Active Users)
        $identityNumbers = AllowedRegistration::whereIn('id', $studentIds)
            ->pluck('identity_number');

        User::whereIn('identity_number', $identityNumbers)
            ->update(['school_class_id' => $toClassId]);
    }
}
