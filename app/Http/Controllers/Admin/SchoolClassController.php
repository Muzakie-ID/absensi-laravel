<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\ClassStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolClassController extends Controller
{
    public function index()
    {
        $classes = SchoolClass::with('classStatus')
            ->withCount(['students' => function ($query) {
                $query->where('role_type', 'student');
            }])
            ->orderBy('level')
            ->orderBy('name')
            ->get();
        $statuses = ClassStatus::all();
        return Inertia::render('Admin/Classes/Index', [
            'classes' => $classes,
            'statuses' => $statuses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:classes,name',
            'level' => 'required|integer|min:1',
            'class_status_id' => 'required|exists:class_statuses,id'
        ]);

        SchoolClass::create($request->all());

        return redirect()->back()->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function update(Request $request, SchoolClass $schoolClass)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:classes,name,' . $schoolClass->id,
            'level' => 'required|integer|min:1',
            'class_status_id' => 'required|exists:class_statuses,id'
        ]);

        $schoolClass->update($request->all());

        return redirect()->back()->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroy(SchoolClass $schoolClass)
    {
        $schoolClass->delete();
        return redirect()->back()->with('success', 'Kelas berhasil dihapus.');
    }
}
