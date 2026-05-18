<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

/**
 * Mobile auth — Android client exchange Google ID token for Sanctum bearer.
 * Endpoint:
 *   POST /api/mobile/v1/auth/google { id_token }
 *   GET  /api/mobile/v1/auth/me     (bearer)
 *   POST /api/mobile/v1/auth/logout (bearer)
 */
class AuthController extends Controller
{
    /** Exchange Google ID token → Sanctum personal access token. */
    public function googleExchange(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id_token' => 'required|string',
        ]);

        try {
            $userFromGoogle = Socialite::driver('google')->stateless()->userFromToken($data['id_token']);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => 'invalid_google_token',
            ], 401);
        }

        $email = strtolower(trim($userFromGoogle->getEmail() ?? ''));
        if (! $email) {
            return response()->json(['success' => false, 'error' => 'no_email'], 422);
        }

        $user = User::query()
            ->where('google_id', $userFromGoogle->getId())
            ->orWhere('email', $email)
            ->first();

        if (! $user) {
            $user = User::create([
                'name' => $userFromGoogle->getName() ?? Str::before($email, '@'),
                'display_name' => $userFromGoogle->getName() ?? Str::before($email, '@'),
                'email' => $email,
                'email_verified_at' => now(),
                'password' => bcrypt(Str::random(40)),
                'role' => 'siswa',
                'tier' => 'free',
                'status' => 'active',
                'google_id' => $userFromGoogle->getId(),
                'avatar_url' => $userFromGoogle->getAvatar(),
            ]);
        } else {
            $user->forceFill([
                'google_id' => $userFromGoogle->getId(),
                'avatar_url' => $userFromGoogle->getAvatar() ?: $user->avatar_url,
                'email_verified_at' => $user->email_verified_at ?: now(),
            ])->save();

            if ($user->isSuspended()) {
                return response()->json(['success' => false, 'error' => 'suspended'], 403);
            }
        }

        // Revoke old tokens dgn nama yg sama supaya tidak menumpuk.
        $user->tokens()->where('name', 'mobile-android')->delete();
        $token = $user->createToken('mobile-android', ['mobile:read', 'mobile:write']);

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token->plainTextToken,
                'user' => $this->serializeUser($user),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->serializeUser($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true]);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'display_name' => $user->display_name,
            'email' => $user->email,
            'role' => $user->role,
            'tier' => $user->tier,
            'status' => $user->status,
            'avatar_url' => $user->avatar_url,
            'is_premium' => $user->isPremium(),
        ];
    }
}
