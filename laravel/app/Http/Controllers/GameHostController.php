<?php

namespace App\Http\Controllers;

use App\Models\GameSession;
use App\Services\GameService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Host (guru) bikin sesi, monitor lobby, start game, advance soal.
 */
class GameHostController extends Controller
{
    public function __construct(private GameService $service) {}

    /** Form bikin sesi: `/game/host`. */
    public function create(Request $request): Response
    {
        $existing = GameSession::query()
            ->where('host_id', $request->user()->id)
            ->whereIn('status', ['lobby', 'live'])
            ->orderByDesc('created_at')
            ->first();

        return Inertia::render('game/host', [
            'existing' => $existing ? [
                'id' => $existing->id,
                'pin' => $existing->pin,
                'title' => $existing->title,
                'status' => $existing->status,
                'mode' => $existing->mode,
            ] : null,
        ]);
    }

    /** Submit form bikin sesi. */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:120',
            'mode' => 'nullable|string|in:acak,huruf,kata,nyurat,match,maca',
            'question_count' => 'nullable|integer|min:5|max:30',
            'seconds_per_question' => 'nullable|integer|min:10|max:60',
            'categories' => 'nullable|array',
        ]);

        $session = $this->service->createSession($request->user()->id, $data);

        return redirect()->route('game.host.console', ['session' => $session->id]);
    }

    /** Konsol host: monitor lobby + start + advance: `/game/host/{session}`. */
    public function console(GameSession $session, Request $request): Response
    {
        $this->authorizeHost($session, $request->user()->id);

        return Inertia::render('game/host-console', [
            'session' => $this->serializeSession($session),
            'players' => $this->service->leaderboard($session),
            'currentQuestion' => $this->loadCurrentQuestion($session),
        ]);
    }

    /** Polling endpoint (JSON) — dipakai host console untuk live update. */
    public function poll(GameSession $session, Request $request)
    {
        $this->authorizeHost($session, $request->user()->id);

        return response()->json([
            'session' => $this->serializeSession($session),
            'players' => $this->service->leaderboard($session),
            'currentQuestion' => $this->loadCurrentQuestion($session),
        ]);
    }

    /** Mulai game (lobby → live). */
    public function start(GameSession $session, Request $request): RedirectResponse
    {
        $this->authorizeHost($session, $request->user()->id);
        $this->service->startSession($session);

        return back();
    }

    /** Lanjut ke soal berikut atau selesai. */
    public function advance(GameSession $session, Request $request): RedirectResponse
    {
        $this->authorizeHost($session, $request->user()->id);
        $this->service->advance($session);

        return back();
    }

    private function authorizeHost(GameSession $session, int $userId): void
    {
        abort_unless($session->host_id === $userId, 403, 'Bukan host sesi ini.');
    }

    private function serializeSession(GameSession $session): array
    {
        return [
            'id' => $session->id,
            'pin' => $session->pin,
            'title' => $session->title,
            'status' => $session->status,
            'mode' => $session->mode,
            'question_count' => (int) $session->question_count,
            'seconds_per_question' => (int) $session->seconds_per_question,
            'current_question_index' => (int) $session->current_question_index,
        ];
    }

    private function loadCurrentQuestion(GameSession $session): ?array
    {
        if ($session->status !== 'live') {
            return null;
        }

        $q = $session->questions()
            ->where('question_index', $session->current_question_index)
            ->first();

        if (! $q) {
            return null;
        }

        return [
            'id' => $q->id,
            'question_index' => (int) $q->question_index,
            'prompt' => $q->prompt,
            'glyph' => $q->glyph,
            'options' => $q->options,
            'correct_answer' => $q->correct_answer,
            'time_limit_seconds' => (int) $q->time_limit_seconds,
        ];
    }
}
