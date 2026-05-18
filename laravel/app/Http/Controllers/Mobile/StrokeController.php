<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\StrokeAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StrokeController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'aksara_id' => 'required|string|exists:aksara,id',
            'mode' => 'required|in:practice,test,nyurat',
            'score' => 'required|integer|min:0|max:100',
            'passed' => 'required|boolean',
            'mistakes' => 'nullable|integer|min:0',
            'duration_seconds' => 'nullable|integer|min:0|max:3600',
            'metrics' => 'nullable|array',
            'raw_strokes' => 'nullable|array',
            'normalized_strokes' => 'nullable|array',
        ]);

        $attempt = StrokeAttempt::create([
            'user_id' => $request->user()->id,
            'aksara_id' => $data['aksara_id'],
            'mode' => $data['mode'],
            'score' => $data['score'],
            'passed' => $data['passed'],
            'mistakes' => $data['mistakes'] ?? 0,
            'duration_seconds' => $data['duration_seconds'] ?? 0,
            'metrics' => $data['metrics'] ?? null,
            'raw_strokes' => $data['raw_strokes'] ?? null,
            'normalized_strokes' => $data['normalized_strokes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $attempt->id,
                'created_at' => $attempt->created_at?->toIso8601String(),
            ],
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = StrokeAttempt::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(50);

        if ($aksaraId = $request->query('aksara_id')) {
            $query->where('aksara_id', $aksaraId);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()->map(fn (StrokeAttempt $a) => [
                'id' => $a->id,
                'aksara_id' => $a->aksara_id,
                'mode' => $a->mode,
                'score' => $a->score,
                'passed' => $a->passed,
                'mistakes' => $a->mistakes,
                'duration_seconds' => $a->duration_seconds,
                'metrics' => $a->metrics,
                'created_at' => $a->created_at?->toIso8601String(),
            ])->all(),
        ]);
    }
}
