<?php

namespace App\Http\Controllers;

use App\Models\Aksara;
use App\Models\StrokeAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** Dashboard siswa: `/dashboard`. */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Stats agregat.
        $now = now();
        $weekAgo = $now->copy()->subDays(7);

        $totalAttempts = StrokeAttempt::where('user_id', $user->id)->count();
        $avgScore = (int) round(StrokeAttempt::where('user_id', $user->id)->avg('score') ?? 0);
        $masteredAksara = StrokeAttempt::query()
            ->where('user_id', $user->id)
            ->where('passed', true)
            ->distinct('aksara_id')
            ->count('aksara_id');
        $weeklyAttempts = StrokeAttempt::where('user_id', $user->id)->where('created_at', '>=', $weekAgo)->count();

        // XP harian dari attempt minggu ini.
        $weeklyXp = StrokeAttempt::query()
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $weekAgo)
            ->sum('score');

        // Lanjut belajar — aksara pertama yang belum mastered, atau aksara pertama catalog.
        $masteredIds = StrokeAttempt::query()
            ->where('user_id', $user->id)
            ->where('passed', true)
            ->pluck('aksara_id')
            ->unique()
            ->all();

        $nextAksara = Aksara::query()
            ->where('is_premium', false)
            ->whereNotIn('id', $masteredIds)
            ->orderBy('order')
            ->orderBy('id')
            ->first()
            ?? Aksara::query()->orderBy('order')->first();

        return Inertia::render('dashboard', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'display_name' => $user->display_name ?: $user->name,
                'email' => $user->email,
                'tier' => $user->tier ?? 'free',
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
            ],
            'stats' => [
                'totalAttempts' => $totalAttempts,
                'averageScore' => $avgScore,
                'masteredAksara' => $masteredAksara,
                'weeklyAttempts' => $weeklyAttempts,
                'weeklyXp' => (int) $weeklyXp,
            ],
            'nextAksara' => $nextAksara ? [
                'id' => $nextAksara->id,
                'name' => $nextAksara->name,
                'char' => $nextAksara->char,
                'latin' => $nextAksara->latin,
                'category' => $nextAksara->category,
            ] : null,
        ]);
    }
}
