<?php

namespace App\Http\Controllers;

use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizAttemptController extends Controller
{
    /** `POST /quiz/attempts` — simpan hasil sesi kuis. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mode' => 'required|in:nyurat,kata,huruf,match,maca,acak',
            'category' => 'nullable|string|max:100',
            'correct_count' => 'required|integer|min:0',
            'total_count' => 'required|integer|min:1',
            'score' => 'required|integer|min:0|max:100',
            'passed' => 'required|boolean',
            'duration_seconds' => 'nullable|integer|min:0|max:7200',
            'answers' => 'nullable|array',
            'seed' => 'nullable|string|max:64',
        ]);

        $attempt = QuizAttempt::create([
            'user_id' => $request->user()->id,
            'mode' => $data['mode'],
            'category' => $data['category'] ?? 'semua',
            'correct_count' => $data['correct_count'],
            'total_count' => $data['total_count'],
            'score' => $data['score'],
            'passed' => $data['passed'],
            'duration_seconds' => $data['duration_seconds'] ?? 0,
            'answers' => $data['answers'] ?? null,
            'seed' => $data['seed'] ?? null,
        ]);

        return response()->json([
            'id' => $attempt->id,
            'created_at' => $attempt->created_at?->toIso8601String(),
        ], 201);
    }

    /** `GET /quiz/attempts` — list attempts (latest 50). */
    public function index(Request $request): JsonResponse
    {
        $query = QuizAttempt::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(50);

        if ($mode = $request->query('mode')) {
            $query->where('mode', $mode);
        }

        return response()->json([
            'data' => $query->get()->map(fn (QuizAttempt $a) => [
                'id' => $a->id,
                'mode' => $a->mode,
                'category' => $a->category,
                'correct_count' => $a->correct_count,
                'total_count' => $a->total_count,
                'score' => $a->score,
                'passed' => $a->passed,
                'duration_seconds' => $a->duration_seconds,
                'created_at' => $a->created_at?->toIso8601String(),
            ])->all(),
        ]);
    }
}
