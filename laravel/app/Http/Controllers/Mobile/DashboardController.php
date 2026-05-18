<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Aksara;
use App\Models\StrokeAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $weekAgo = now()->subDays(7);

        $totalAttempts = StrokeAttempt::where('user_id', $user->id)->count();
        $avgScore = (int) round(StrokeAttempt::where('user_id', $user->id)->avg('score') ?? 0);
        $masteredAksara = StrokeAttempt::query()
            ->where('user_id', $user->id)
            ->where('passed', true)
            ->distinct('aksara_id')
            ->count('aksara_id');
        $weeklyAttempts = StrokeAttempt::where('user_id', $user->id)->where('created_at', '>=', $weekAgo)->count();
        $weeklyXp = (int) StrokeAttempt::where('user_id', $user->id)->where('created_at', '>=', $weekAgo)->sum('score');

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
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'totalAttempts' => $totalAttempts,
                    'averageScore' => $avgScore,
                    'masteredAksara' => $masteredAksara,
                    'weeklyAttempts' => $weeklyAttempts,
                    'weeklyXp' => $weeklyXp,
                ],
                'nextAksara' => $nextAksara ? [
                    'id' => $nextAksara->id,
                    'name' => $nextAksara->name,
                    'char' => $nextAksara->char,
                    'latin' => $nextAksara->latin,
                    'category' => $nextAksara->category,
                ] : null,
                'profile' => [
                    'id' => $user->id,
                    'display_name' => $user->display_name,
                    'tier' => $user->tier,
                    'avatar_url' => $user->avatar_url,
                ],
            ],
        ]);
    }
}
