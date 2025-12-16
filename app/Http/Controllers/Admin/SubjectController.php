<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::orderBy('name')->get();
        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:subjects,code'
        ], [
            'code.unique' => 'Kode mata pelajaran ini sudah digunakan.',
            'code.required' => 'Kode mata pelajaran wajib diisi.',
            'name.required' => 'Nama mata pelajaran wajib diisi.',
        ]);

        Subject::create($request->all());

        return redirect()->back()->with('success', 'Mata Pelajaran berhasil ditambahkan.');
    }

    public function update(Request $request, Subject $subject)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:subjects,code,' . $subject->id
        ], [
            'code.unique' => 'Kode mata pelajaran ini sudah digunakan.',
            'code.required' => 'Kode mata pelajaran wajib diisi.',
            'name.required' => 'Nama mata pelajaran wajib diisi.',
        ]);

        $subject->update($request->all());

        return redirect()->back()->with('success', 'Mata Pelajaran berhasil diperbarui.');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();
        return redirect()->back()->with('success', 'Mata Pelajaran berhasil dihapus.');
    }
}
