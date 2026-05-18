<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeacher
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        if (! $user) {
            return redirect()->route('login', ['next' => $request->path()]);
        }
        if (! $user->isTeacher()) {
            abort(403, 'Hanya akun guru yang bisa akses halaman ini.');
        }
        return $next($request);
    }
}
