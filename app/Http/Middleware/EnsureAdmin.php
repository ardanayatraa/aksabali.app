<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        if (! $user) {
            return redirect()->route('login', ['next' => $request->path()]);
        }
        if (! $user->isAdmin()) {
            abort(403, 'Hanya admin yang bisa akses halaman ini.');
        }
        return $next($request);
    }
}
