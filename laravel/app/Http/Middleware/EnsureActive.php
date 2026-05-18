<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Block request kalau user.status === 'suspended'.
 * Logout otomatis supaya session ga keep stuck.
 */
class EnsureActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && method_exists($user, 'isSuspended') && $user->isSuspended()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'auth' => 'Akun ini di-suspend admin. Hubungi tim Aksa Bali.',
            ]);
        }

        return $next($request);
    }
}
