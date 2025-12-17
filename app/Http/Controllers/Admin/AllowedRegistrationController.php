<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AllowedRegistration;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AllowedRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->input('type', 'teacher'); // Default teacher
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        
        $query = AllowedRegistration::where('role_type', $type)
            ->with('schoolClass');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('identity_number', 'like', "%{$search}%")
                  ->orWhere('registration_code', 'like', "%{$search}%");
            });
        }

        $registrations = $query->orderByRaw('CAST(identity_number AS UNSIGNED) ASC')
            ->paginate($perPage)
            ->withQueryString();

        $classes = SchoolClass::whereHas('classStatus', function($q) {
            $q->where('code', 'active');
        })->get();

        return Inertia::render('Admin/AllowedRegistrations/Index', [
            'registrations' => $registrations,
            'type' => $type,
            'classes' => $classes,
            'filters' => $request->only(['search', 'type', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'identity_number' => 'required|string|unique:allowed_registrations,identity_number',
            'name' => 'required|string|max:255',
            'role_type' => 'required|in:teacher,student',
            'school_class_id' => 'nullable|exists:classes,id',
        ]);

        AllowedRegistration::create($request->all());

        return redirect()->back()->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, AllowedRegistration $allowedRegistration)
    {
        $request->validate([
            'identity_number' => 'required|string|unique:allowed_registrations,identity_number,' . $allowedRegistration->id,
            'name' => 'required|string|max:255',
            'role_type' => 'required|in:teacher,student',
            'school_class_id' => 'nullable|exists:classes,id',
        ]);

        $allowedRegistration->update($request->all());

        return redirect()->back()->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(AllowedRegistration $allowedRegistration)
    {
        $allowedRegistration->delete();
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }

    public function check(Request $request)
    {
        $request->validate([
            'identity_number' => 'required|string',
        ]);

        $registration = AllowedRegistration::where('identity_number', $request->identity_number)
            ->orWhere('registration_code', $request->identity_number)
            ->first();

        if ($registration) {
            return response()->json([
                'found' => true,
                'name' => $registration->name,
                'role_type' => $registration->role_type,
                'school_class_id' => $registration->school_class_id,
                'identity_number' => $registration->identity_number, // Return the real identity number if found by code
            ]);
        }

        return response()->json([
            'found' => false,
            'message' => 'Data tidak ditemukan di whitelist (Cek NIP/NIS atau Kode Registrasi).',
        ]);
    }

    public function export(Request $request)
    {
        $type = $request->input('type', 'teacher');
        
        $registrations = AllowedRegistration::where('role_type', $type)
            ->with('schoolClass')
            ->orderBy('name')
            ->get();

        return view('admin.allowed-registrations.print', [
            'registrations' => $registrations,
            'type' => $type,
        ]);
    }
}
