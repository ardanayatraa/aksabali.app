<?php

namespace App\Http\Controllers;

use App\Models\Aksara;
use App\Models\AppSetting;
use App\Models\GameSession;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin dashboard + user management + site mode toggle.
 * Aksara CMS dipindah ke AdminAksaraController.
 */
class AdminController extends Controller
{
    /** Dashboard utama: `/admin`. */
    public function dashboard(): Response
    {
        $stats = [
            'users' => User::count(),
            'premium' => User::whereIn('tier', ['lite', 'premium'])->count(),
            'suspended' => User::where('status', 'suspended')->count(),
            'aksara' => Aksara::count(),
            'aksara_premium' => Aksara::where('is_premium', true)->count(),
            'active_sessions' => GameSession::whereIn('status', ['lobby', 'live'])->count(),
            'total_sessions' => GameSession::count(),
            'pending_payments' => PaymentTransaction::where('status', 'pending')->count(),
            'success_payments' => PaymentTransaction::where('status', 'success')->count(),
        ];

        $recentUsers = User::query()
            ->orderByDesc('created_at')
            ->limit(8)
            ->get(['id', 'name', 'email', 'role', 'tier', 'status', 'created_at'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'tier' => $u->tier,
                'status' => $u->status,
                'created_at' => $u->created_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'siteMode' => AppSetting::siteMode(),
        ]);
    }

    /** Daftar user dgn filter: `/admin/users`. */
    public function users(Request $request): Response
    {
        $query = User::query()->orderByDesc('created_at');

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($q = $request->query('q')) {
            $query->where(function ($w) use ($q) {
                $w->where('email', 'like', "%{$q}%")->orWhere('name', 'like', "%{$q}%");
            });
        }

        $users = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/users', [
            'users' => $users->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'tier' => $u->tier,
                'status' => $u->status,
                'created_at' => $u->created_at?->toIso8601String(),
            ]),
            'filters' => [
                'role' => $request->query('role'),
                'status' => $request->query('status'),
                'q' => $request->query('q'),
            ],
        ]);
    }

    /** Toggle status user (active ↔ suspended): `POST /admin/users/{user}/suspend`. */
    public function toggleSuspend(User $user, Request $request): RedirectResponse
    {
        // Admin tidak bisa suspend dirinya sendiri.
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'Ga bisa suspend akun sendiri.']);
        }

        $user->update([
            'status' => $user->status === 'suspended' ? 'active' : 'suspended',
        ]);

        return back()->with('success', "User {$user->email} status: {$user->status}");
    }

    /** Update role user: `POST /admin/users/{user}/role`. */
    public function updateRole(User $user, Request $request): RedirectResponse
    {
        $data = $request->validate([
            'role' => 'required|in:siswa,pengajar,admin',
        ]);

        $user->update(['role' => $data['role']]);

        return back()->with('success', "Role {$user->email} → {$data['role']}");
    }

    /** Update tier user (manual grant Premium): `POST /admin/users/{user}/tier`. */
    public function updateTier(User $user, Request $request): RedirectResponse
    {
        $data = $request->validate([
            'tier' => 'required|in:free,lite,premium',
        ]);

        $user->update(['tier' => $data['tier']]);

        return back()->with('success', "Tier {$user->email} → {$data['tier']}");
    }

    /** Settings (site mode dll): `/admin/settings`. */
    public function settings(): Response
    {
        return Inertia::render('admin/settings', [
            'siteMode' => AppSetting::siteMode(),
            'launchAt' => AppSetting::launchAt(),
            'modes' => AppSetting::SITE_MODES,
        ]);
    }

    /** Update site mode: `POST /admin/settings/site-mode`. */
    public function updateSiteMode(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'site_mode' => 'required|in:' . implode(',', AppSetting::SITE_MODES),
            'launch_at' => 'nullable|date',
        ]);

        AppSetting::set('site_mode', $data['site_mode']);

        if (isset($data['launch_at'])) {
            AppSetting::set('launch_at', $data['launch_at']);
        }

        return back()->with('success', "Site mode → {$data['site_mode']}");
    }
}
