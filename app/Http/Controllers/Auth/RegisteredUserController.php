<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:'.User::class,
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'registration_identifier' => 'required|string',
        ]);

        $identifier = $request->registration_identifier;

        // Search in both columns
        $allowed = \App\Models\AllowedRegistration::where('identity_number', $identifier)
                    ->orWhere('registration_code', $identifier)
                    ->first();

        if (!$allowed) {
             return back()->withErrors(['registration_identifier' => 'Data tidak ditemukan di Master Data (NIS atau Kode Registrasi salah).']);
        }

        if ($allowed->is_registered) {
            return back()->withErrors(['registration_identifier' => 'Akun ini sudah terdaftar.']);
        }

        $roleId = $allowed->role_type === 'teacher' ? 2 : 4;

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $roleId,
            'identity_number' => $allowed->identity_number,
            'school_class_id' => $allowed->school_class_id,
        ]);

        $allowed->update(['is_registered' => true]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
