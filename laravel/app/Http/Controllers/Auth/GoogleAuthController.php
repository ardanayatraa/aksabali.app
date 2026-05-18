<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    /**
     * Redirect ke Google OAuth consent screen.
     */
    public function redirect(Request $request): RedirectResponse
    {
        if ($next = $request->query('next')) {
            $request->session()->put('login_next', (string) $next);
        }

        return Socialite::driver('google')
            ->scopes(['openid', 'email', 'profile'])
            ->redirect();
    }

    /**
     * Handle callback dari Google, find/create user, login.
     */
    public function callback(Request $request): RedirectResponse
    {
        try {
            $google = Socialite::driver('google')->stateless()->user();
        } catch (Throwable $e) {
            return redirect()->route('login')->withErrors([
                'google' => 'Login Google gagal. Coba lagi atau hubungi tim.',
            ]);
        }

        $email = strtolower(trim($google->getEmail() ?? ''));
        if (! $email) {
            return redirect()->route('login')->withErrors([
                'google' => 'Akun Google tidak memberikan email. Tidak bisa login.',
            ]);
        }

        // Find by google_id atau email
        $user = User::query()
            ->where('google_id', $google->getId())
            ->orWhere('email', $email)
            ->first();

        if (! $user) {
            $user = User::create([
                'name' => $google->getName() ?? Str::before($email, '@'),
                'display_name' => $google->getName() ?? Str::before($email, '@'),
                'email' => $email,
                'email_verified_at' => now(),
                'password' => bcrypt(Str::random(40)),  // placeholder, no manual login
                'role' => 'siswa',
                'tier' => 'free',
                'status' => 'active',
                'google_id' => $google->getId(),
                'avatar_url' => $google->getAvatar(),
            ]);
        } else {
            // Update Google data + verified
            $user->forceFill([
                'google_id' => $google->getId(),
                'avatar_url' => $google->getAvatar() ?: $user->avatar_url,
                'email_verified_at' => $user->email_verified_at ?: now(),
            ])->save();

            // Block kalau suspended
            if ($user->isSuspended()) {
                return redirect()->route('login')->withErrors([
                    'google' => 'Akun ini di-suspend admin. Hubungi tim Aksa Bali.',
                ]);
            }
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        // Redirect ke 'next' kalau ada, atau ke home sesuai role
        $next = $request->session()->pull('login_next');
        if ($next && str_starts_with($next, '/')) {
            return redirect($next);
        }

        return redirect()->intended($this->homeForRole($user));
    }

    private function homeForRole(User $user): string
    {
        return match ($user->role) {
            'admin' => '/admin',
            'pengajar' => '/guru',
            default => '/dashboard',
        };
    }
}
