<?php

namespace App\Http\Controllers;

use App\Models\GamePlayer;
use App\Models\GameSession;
use App\Services\GameService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

/**
 * Siswa: join lobby pakai PIN → tunggu host start → jawab soal live → lihat podium.
 */
class GamePlayController extends Controller
{
    public function __construct(private GameService $service) {}

    /** Form join: `/game/lobby` (atau `/game/lobby?pin=123456`). */
    public function lobby(Request $request): Response
    {
        $prefillPin = $request->query('pin');

        return Inertia::render('game/lobby', [
            'prefillPin' => $prefillPin && preg_match('/^\d{6}$/', (string) $prefillPin) ? $prefillPin : null,
        ]);
    }

    /** Submit join. */
    public function join(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'pin' => 'required|string|regex:/^\d{6}$/',
            'display_name' => 'required|string|max:40',
        ]);

        $session = $this->service->findSessionByPin($data['pin']);
        if (! $session) {
            return back()->withErrors(['pin' => 'PIN ga dikenal. Cek lagi atau minta PIN baru ke guru.']);
        }

        try {
            $player = $this->service->joinSession(
                $session,
                trim($data['display_name']),
                $request->user()?->id
            );
        } catch (RuntimeException $e) {
            return back()->withErrors(['pin' => $e->getMessage()]);
        }

        // Simpan player_id di session cookie supaya page live tau identitas pemain.
        $request->session()->put("game_player_{$session->id}", $player->id);

        return redirect()->route('game.live', ['session' => $session->id]);
    }

    /** Live screen: `/game/{session}/live`. */
    public function live(GameSession $session, Request $request): Response
    {
        $player = $this->resolvePlayer($session, $request);
        abort_unless($player, 403, 'Kamu belum gabung sesi ini.');

        return Inertia::render('game/live', [
            'session' => $this->serializeSession($session),
            'me' => $this->serializePlayer($player),
            'currentQuestion' => $this->loadCurrentQuestionForPlayer($session, $player),
        ]);
    }

    /** Polling endpoint (JSON) — dipakai pemain untuk live update soal + status. */
    public function poll(GameSession $session, Request $request): JsonResponse
    {
        $player = $this->resolvePlayer($session, $request);
        abort_unless($player, 403);

        return response()->json([
            'session' => $this->serializeSession($session),
            'me' => $this->serializePlayer($player->fresh()),
            'currentQuestion' => $this->loadCurrentQuestionForPlayer($session, $player),
        ]);
    }

    /** Submit jawaban. */
    public function answer(GameSession $session, Request $request): JsonResponse
    {
        $player = $this->resolvePlayer($session, $request);
        abort_unless($player, 403);

        $data = $request->validate([
            'question_index' => 'required|integer|min:0',
            'answer' => 'required|string|max:200',
        ]);

        try {
            $row = $this->service->submitAnswer($session, $player, (int) $data['question_index'], $data['answer']);
        } catch (RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json([
            'is_correct' => (bool) $row->is_correct,
            'me' => $this->serializePlayer($player->fresh()),
        ]);
    }

    /** Podium: `/game/{session}/podium`. */
    public function podium(GameSession $session, Request $request): Response
    {
        return Inertia::render('game/podium', [
            'session' => $this->serializeSession($session),
            'leaderboard' => $this->service->leaderboard($session),
        ]);
    }

    private function resolvePlayer(GameSession $session, Request $request): ?GamePlayer
    {
        // 1. Cookie session player id.
        $playerId = $request->session()->get("game_player_{$session->id}");
        if ($playerId) {
            $player = GamePlayer::where('id', $playerId)->where('session_id', $session->id)->first();
            if ($player) {
                return $player;
            }
        }

        // 2. Fallback: user terotentikasi yang sudah pernah join.
        if ($request->user()) {
            return GamePlayer::where('session_id', $session->id)
                ->where('user_id', $request->user()->id)
                ->first();
        }

        return null;
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

    private function serializePlayer(GamePlayer $player): array
    {
        return [
            'id' => $player->id,
            'display_name' => $player->display_name,
            'score' => (int) $player->score,
        ];
    }

    /**
     * Pemain ga lihat correct_answer — itu cuma dikirim setelah submit.
     */
    private function loadCurrentQuestionForPlayer(GameSession $session, GamePlayer $player): ?array
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

        $already = $q->answers()->where('player_id', $player->id)->first();

        return [
            'id' => $q->id,
            'question_index' => (int) $q->question_index,
            'prompt' => $q->prompt,
            'glyph' => $q->glyph,
            'options' => $q->options,
            'time_limit_seconds' => (int) $q->time_limit_seconds,
            'already_answered' => (bool) $already,
            'was_correct' => $already ? (bool) $already->is_correct : null,
        ];
    }
}
