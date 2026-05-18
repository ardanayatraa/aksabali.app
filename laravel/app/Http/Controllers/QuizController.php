<?php

namespace App\Http\Controllers;

use App\Models\Aksara;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    private const MODES = ['acak', 'nyurat', 'kata', 'huruf', 'match', 'maca'];

    /** Hub kuis: `/quiz`. */
    public function index(): Response
    {
        $stats = [
            'totalMateri' => Aksara::count(),
            'totalSoal' => Aksara::where('is_premium', false)->count() * 2, // rough estimate dari soal Latin↔Aksara
        ];

        return Inertia::render('quiz/index', [
            'stats' => $stats,
        ]);
    }

    /** Per-mode kuis: `/quiz/{mode}`. */
    public function mode(string $mode): Response
    {
        abort_unless(in_array($mode, self::MODES, true), 404);

        $catalog = Aksara::query()
            ->orderBy('order')
            ->orderBy('id')
            ->get()
            ->map(fn (Aksara $a) => [
                'id' => $a->id,
                'name' => $a->name,
                'char' => $a->char,
                'latin' => $a->latin,
                'category' => $a->category,
                'is_premium' => (bool) $a->is_premium,
                'svg_url' => $a->svg_url,
            ])
            ->all();

        return Inertia::render('quiz/mode', [
            'mode' => $mode,
            'catalog' => $catalog,
        ]);
    }
}
