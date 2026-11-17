<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Batasi akses route hanya untuk role tertentu.
 * Contoh: ->middleware('role:admin') atau ->middleware('role:admin,picket')
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !$user->hasRole(...$roles)) {
            abort(403, 'Akses ditolak. Halaman ini hanya untuk ' . implode('/', $roles) . '.');
        }

        return $next($request);
    }
}
