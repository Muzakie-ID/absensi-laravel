<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ClassStatusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $statuses = ClassStatus::all();
        return Inertia::render('Admin/ClassStatuses/Index', [
            'statuses' => $statuses
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:50',
        ]);

        ClassStatus::create([
            'name' => $request->name,
            'code' => Str::slug($request->name),
            'color' => $request->color,
        ]);

        return redirect()->back()->with('success', 'Status kelas berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ClassStatus $classStatus)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:50',
        ]);

        $classStatus->update([
            'name' => $request->name,
            'code' => Str::slug($request->name),
            'color' => $request->color,
        ]);

        return redirect()->back()->with('success', 'Status kelas berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClassStatus $classStatus)
    {
        $classStatus->delete();
        return redirect()->back()->with('success', 'Status kelas berhasil dihapus.');
    }
}
