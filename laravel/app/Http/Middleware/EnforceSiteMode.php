<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforce site_mode global:
 * - 'live'           → tidak ada efek
 * - 'coming_soon'    → halaman publik (selain /login, /admin*, /up, webhook) di-redirect ke landing
 *                       countdown. Admin masih bisa akses semua.
 * - 'maintenance'    → semua halaman publik (selain /login, /admin*, /up) di-blok dgn page khusus.
 *                       Admin masih bisa akses.
 * - 'development'    → tidak ada efek (mode internal).
 */
class EnforceSiteMode
{
    /** Path yang selalu boleh dilewati, regardless mode. */
    private const ALWAYS_ALLOW = [
        'up',
        'api/health',
        'payment/midtrans-webhook',
        'login',
        'logout',
        'auth/google/redirect',
        'auth/google/callback',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $mode = AppSetting::siteMode();

        if ($mode === 'live' || $mode === 'development') {
            return $next($request);
        }

        $path = trim($request->path(), '/');

        // Always allow gate.
        foreach (self::ALWAYS_ALLOW as $allow) {
            if ($path === $allow || str_starts_with($path, $allow . '/')) {
                return $next($request);
            }
        }

        // Admin selalu boleh masuk.
        $user = Auth::user();
        if ($user && method_exists($user, 'isAdmin') && $user->isAdmin()) {
            return $next($request);
        }

        // Admin area gate (kalau belum login, biarkan login flow normal).
        if (str_starts_with($path, 'admin')) {
            return $next($request);
        }

        // Maintenance — block keras.
        if ($mode === 'maintenance') {
            return Inertia::render('site-mode/maintenance', [
                'mode' => $mode,
                'launchAt' => AppSetting::launchAt(),
            ])->toResponse($request)->setStatusCode(503);
        }

        // Coming Soon — render landing countdown.
        return Inertia::render('site-mode/coming-soon', [
            'mode' => $mode,
            'launchAt' => AppSetting::launchAt(),
        ])->toResponse($request);
    }
}
