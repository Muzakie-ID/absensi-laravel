<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\AllowedRegistration;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['role', 'schoolClass']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('identity_number', 'like', "%{$search}%");
            });
        }

        // Filter by Role (Tab)
        if ($request->filled('tab')) {
            if ($request->tab === 'teachers') {
                $query->whereHas('role', function($q) {
                    $q->whereIn('name', ['teacher', 'picket']); // Asumsi tiket juga guru
                });
            } elseif ($request->tab === 'students') {
                $query->whereHas('role', function($q) {
                    $q->where('name', 'student');
                });
            }
        }

        $users = $query->orderBy('name')->paginate(10)->withQueryString();

        $roles = Role::all();
        $classes = SchoolClass::whereHas('classStatus', function($q) {
            $q->where('code', 'active');
        })->get();
        
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'classes' => $classes,
            'filters' => $request->only(['search', 'tab'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:255|unique:users',
            'identity_number' => 'nullable|string|max:20|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'role_id' => 'required|exists:roles,id',
            'school_class_id' => 'nullable|exists:classes,id',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        User::create([
            'name' => $request->name,
            'username' => $request->username,
            'identity_number' => $request->identity_number,
            'email' => $request->email,
            'role_id' => $request->role_id,
            'school_class_id' => $request->school_class_id,
            'password' => Hash::make($request->password),
        ]);

        // Update status registrasi di master data jika ada
        if ($request->identity_number) {
            $allowed = AllowedRegistration::where('identity_number', $request->identity_number)->first();
            if ($allowed) {
                $allowed->update(['is_registered' => true]);
            }
        }

        return redirect()->back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:255|unique:users,username,' . $user->id,
            'identity_number' => 'nullable|string|max:20|unique:users,identity_number,' . $user->id,
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role_id' => 'required|exists:roles,id',
            'school_class_id' => 'nullable|exists:classes,id',
        ];

        if ($request->filled('password')) {
            $rules['password'] = ['confirmed', Rules\Password::defaults()];
        }

        $request->validate($rules);

        $userData = [
            'name' => $request->name,
            'username' => $request->username,
            'identity_number' => $request->identity_number,
            'email' => $request->email,
            'role_id' => $request->role_id,
            'school_class_id' => $request->school_class_id,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        // Cek jika identity_number berubah
        $oldIdentity = $user->identity_number;
        $newIdentity = $request->identity_number;

        $user->update($userData);

        if ($oldIdentity !== $newIdentity) {
            // Reset status NIP lama
            if ($oldIdentity) {
                AllowedRegistration::where('identity_number', $oldIdentity)->update(['is_registered' => false]);
            }
            // Set status NIP baru
            AllowedRegistration::where('identity_number', $newIdentity)->update(['is_registered' => true]);
        }

        return redirect()->back()->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }
        
        // Reset status registrasi di master data
        if ($user->identity_number) {
            AllowedRegistration::where('identity_number', $user->identity_number)->update(['is_registered' => false]);
        }
        
        $user->delete();
        return redirect()->back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
