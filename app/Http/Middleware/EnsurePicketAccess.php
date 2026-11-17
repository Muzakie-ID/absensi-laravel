<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Akses fitur piket: admin, user dengan role 'picket',
 * atau guru yang terjadwal piket hari ini.
 */
class EnsurePicketAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !($user->hasRole('admin', 'picket') || $user->isPicketToday())) {
            abort(403, 'Akses ditolak. Anda tidak memiliki tugas piket hari ini.');
        }

        return $next($request);
    }
}
