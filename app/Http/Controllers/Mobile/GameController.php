<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\GamePlayer;
use App\Models\GameSession;
use App\Services\GameService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * Mobile API untuk multiplayer game.
 * Host (guru) bikin sesi → siswa join PIN → poll soal → submit jawaban → podium.
 */
class GameController extends Controller
{
    public function __construct(private GameService $service) {}

    /** Host: bikin sesi (teacher only). */
    public function createSession(Request $request): JsonResponse
    {
        if (! $request->user()->isTeacher() && ! $request->user()->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'teacher_only'], 403);
        }

        $data = $request->validate([
            'title' => 'nullable|string|max:120',
            'mode' => 'nullable|string|in:acak,huruf,kata,nyurat,match,maca',
            'question_count' => 'nullable|integer|min:5|max:30',
            'seconds_per_question' => 'nullable|integer|min:10|max:60',
        ]);

        $session = $this->service->createSession($request->user()->id, $data);
        return response()->json([
            'success' => true,
            'data' => $this->serializeSession($session),
        ], 201);
    }

    /** Siswa: join via PIN. */
    public function join(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pin' => 'required|string|regex:/^\d{6}$/',
            'display_name' => 'required|string|max:40',
        ]);

        $session = $this->service->findSessionByPin($data['pin']);
        if (! $session) {
            return response()->json(['success' => false, 'error' => 'session_not_found'], 404);
        }

        try {
            $player = $this->service->joinSession($session, trim($data['display_name']), $request->user()->id);
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'session' => $this->serializeSession($session),
                'player' => $this->serializePlayer($player),
            ],
        ]);
    }

    /** Polling: state + soal aktif (untuk pemain). */
    public function poll(GameSession $session, Request $request): JsonResponse
    {
        $player = GamePlayer::where('session_id', $session->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $player) {
            return response()->json(['success' => false, 'error' => 'not_joined'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'session' => $this->serializeSession($session),
                'me' => $this->serializePlayer($player->fresh()),
                'currentQuestion' => $this->loadCurrentQuestion($session, $player),
            ],
        ]);
    }

    /** Host polling: state + leaderboard. */
    public function hostPoll(GameSession $session, Request $request): JsonResponse
    {
        if ($session->host_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'not_host'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'session' => $this->serializeSession($session),
                'players' => $this->service->leaderboard($session),
            ],
        ]);
    }

    /** Host: start game. */
    public function start(GameSession $session, Request $request): JsonResponse
    {
        if ($session->host_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'not_host'], 403);
        }
        try {
            $this->service->startSession($session);
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 422);
        }
        return response()->json(['success' => true, 'data' => $this->serializeSession($session->fresh())]);
    }

    /** Host: lanjut soal. */
    public function advance(GameSession $session, Request $request): JsonResponse
    {
        if ($session->host_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'not_host'], 403);
        }
        try {
            $this->service->advance($session);
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 422);
        }
        return response()->json(['success' => true, 'data' => $this->serializeSession($session->fresh())]);
    }

    /** Pemain: submit jawaban. */
    public function answer(GameSession $session, Request $request): JsonResponse
    {
        $player = GamePlayer::where('session_id', $session->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $player) {
            return response()->json(['success' => false, 'error' => 'not_joined'], 403);
        }

        $data = $request->validate([
            'question_index' => 'required|integer|min:0',
            'answer' => 'required|string|max:200',
        ]);

        try {
            $row = $this->service->submitAnswer($session, $player, (int) $data['question_index'], $data['answer']);
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'is_correct' => (bool) $row->is_correct,
                'me' => $this->serializePlayer($player->fresh()),
            ],
        ]);
    }

    public function podium(GameSession $session): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'session' => $this->serializeSession($session),
                'leaderboard' => $this->service->leaderboard($session),
            ],
        ]);
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

    private function loadCurrentQuestion(GameSession $session, GamePlayer $player): ?array
    {
        if ($session->status !== 'live') return null;

        $q = $session->questions()->where('question_index', $session->current_question_index)->first();
        if (! $q) return null;

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
