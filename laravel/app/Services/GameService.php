<?php

namespace App\Services;

use App\Models\Aksara;
use App\Models\GameAnswer;
use App\Models\GamePlayer;
use App\Models\GameQuestion;
use App\Models\GameSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Domain logic untuk sesi game kelas — host bikin sesi, generate soal, scoring.
 * Tidak ada SQL inline di controller — semua lewat sini.
 */
class GameService
{
    /** Default 15 soal × 20 detik. */
    public const DEFAULT_QUESTION_COUNT = 15;
    public const DEFAULT_SECONDS = 20;

    /**
     * Bikin sesi baru. PIN unik 6-digit (sampai 5x retry).
     *
     * @param  array{title?:string,mode?:string,question_count?:int,seconds_per_question?:int,categories?:array}  $payload
     */
    public function createSession(int $hostId, array $payload = []): GameSession
    {
        // Lazy cleanup sebelum bikin baru.
        GameSession::expireStaleLobby();

        $pin = $this->generateUniquePin();

        $session = GameSession::create([
            'id' => (string) Str::ulid(),
            'pin' => $pin,
            'host_id' => $hostId,
            'title' => $payload['title'] ?? 'Game Aksa Bali',
            'mode' => $payload['mode'] ?? 'acak',
            'status' => 'lobby',
            'question_count' => $payload['question_count'] ?? self::DEFAULT_QUESTION_COUNT,
            'seconds_per_question' => $payload['seconds_per_question'] ?? self::DEFAULT_SECONDS,
            'current_question_index' => 0,
            'categories' => $payload['categories'] ?? null,
        ]);

        $this->generateQuestions($session);

        return $session->fresh(['questions', 'players']);
    }

    /**
     * Cari sesi by PIN untuk join.
     */
    public function findSessionByPin(string $pin): ?GameSession
    {
        return GameSession::query()
            ->where('pin', $pin)
            ->whereIn('status', ['lobby', 'live'])
            ->first();
    }

    /**
     * Daftarkan pemain (user terotentikasi atau guest).
     * Kalau user_id sudah ada di sesi → update display_name, ga duplicate.
     */
    public function joinSession(GameSession $session, string $displayName, ?int $userId = null): GamePlayer
    {
        if ($session->status === 'finished' || $session->status === 'expired') {
            throw new RuntimeException('Sesi sudah selesai. Minta PIN baru ke guru.');
        }

        // Cek existing player by user_id (kalau ada).
        if ($userId) {
            $existing = GamePlayer::where('session_id', $session->id)
                ->where('user_id', $userId)
                ->first();
            if ($existing) {
                $existing->update(['display_name' => $displayName]);
                return $existing;
            }
        }

        return GamePlayer::create([
            'session_id' => $session->id,
            'user_id' => $userId,
            'display_name' => $displayName,
            'score' => 0,
            'joined_at' => now(),
        ]);
    }

    /**
     * Host mulai game — pindah dari lobby ke live + reset cursor ke soal pertama.
     */
    public function startSession(GameSession $session): GameSession
    {
        if ($session->status !== 'lobby') {
            throw new RuntimeException('Sesi sudah jalan atau sudah selesai.');
        }

        $session->update([
            'status' => 'live',
            'current_question_index' => 0,
        ]);

        return $session->fresh();
    }

    /**
     * Pindah ke soal berikut, atau selesai kalau sudah habis.
     */
    public function advance(GameSession $session): GameSession
    {
        if ($session->status !== 'live') {
            throw new RuntimeException('Sesi tidak sedang live.');
        }

        $next = $session->current_question_index + 1;
        if ($next >= $session->question_count) {
            $session->update(['status' => 'finished']);
        } else {
            $session->update(['current_question_index' => $next]);
        }

        return $session->fresh();
    }

    /**
     * Pemain submit jawaban. Idempotent — submit kedua diabaikan.
     */
    public function submitAnswer(GameSession $session, GamePlayer $player, int $questionIndex, string $answer): GameAnswer
    {
        $question = GameQuestion::query()
            ->where('session_id', $session->id)
            ->where('question_index', $questionIndex)
            ->firstOrFail();

        // Idempotent guard.
        $existing = GameAnswer::where('question_id', $question->id)
            ->where('player_id', $player->id)
            ->first();
        if ($existing) {
            return $existing;
        }

        $isCorrect = $this->checkAnswer($question, $answer);

        $row = GameAnswer::create([
            'session_id' => $session->id,
            'question_id' => $question->id,
            'user_id' => $player->user_id,
            'player_id' => $player->id,
            'answer' => $answer,
            'is_correct' => $isCorrect,
            'answered_at' => now(),
        ]);

        if ($isCorrect) {
            $player->increment('score', 100);
        }

        return $row;
    }

    /**
     * Leaderboard rapih dengan score + jumlah benar.
     */
    public function leaderboard(GameSession $session): array
    {
        return GamePlayer::query()
            ->where('session_id', $session->id)
            ->withCount(['answers as correct_count' => fn ($q) => $q->where('is_correct', true)])
            ->orderByDesc('score')
            ->orderBy('joined_at')
            ->get()
            ->map(fn (GamePlayer $p) => [
                'id' => $p->id,
                'display_name' => $p->display_name,
                'score' => (int) $p->score,
                'correct_count' => (int) ($p->correct_count ?? 0),
                'joined_at' => $p->joined_at?->toIso8601String(),
            ])
            ->all();
    }

    /**
     * Generate `question_count` soal dari catalog aksara — disimpan ke tabel game_questions.
     */
    private function generateQuestions(GameSession $session): void
    {
        $pool = Aksara::query()
            ->where('is_premium', false)
            ->whereNotNull('char')
            ->orderBy('id')
            ->get()
            ->all();

        if (count($pool) < 4) {
            // Belum cukup catalog — skip generate, soal kosong (host bakal lihat warning).
            return;
        }

        $rows = [];
        for ($i = 0; $i < $session->question_count; $i++) {
            $picked = $pool[array_rand($pool)];
            $wrongs = array_values(array_filter($pool, fn ($a) => $a->id !== $picked->id));
            shuffle($wrongs);
            $wrongs = array_slice($wrongs, 0, 3);

            $direction = random_int(0, 1) === 0 ? 'aksara-to-latin' : 'latin-to-aksara';

            if ($direction === 'aksara-to-latin') {
                $prompt = 'Bacanya?';
                $glyph = $picked->char;
                $correct = $picked->latin;
                $options = collect([$correct, ...array_map(fn ($a) => $a->latin, $wrongs)])
                    ->shuffle()
                    ->values()
                    ->all();
            } else {
                $prompt = 'Aksara untuk Latin ini?';
                $glyph = $picked->latin;
                $correct = $picked->char;
                $options = collect([$correct, ...array_map(fn ($a) => $a->char, $wrongs)])
                    ->shuffle()
                    ->values()
                    ->all();
            }

            $rows[] = [
                'session_id' => $session->id,
                'question_index' => $i,
                'prompt' => $prompt,
                'glyph' => $glyph,
                'options' => json_encode($options),
                'correct_answer' => $correct,
                'time_limit_seconds' => $session->seconds_per_question,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (! empty($rows)) {
            DB::table('game_questions')->insert($rows);
        }
    }

    private function generateUniquePin(): string
    {
        for ($i = 0; $i < 5; $i++) {
            $pin = (string) random_int(100000, 999999);
            if (! GameSession::where('pin', $pin)->exists()) {
                return $pin;
            }
        }
        // Sangat tidak mungkin, tapi safety net.
        throw new RuntimeException('Gagal generate PIN unik. Coba lagi.');
    }

    private function checkAnswer(GameQuestion $question, string $answer): bool
    {
        return mb_strtolower(trim($answer)) === mb_strtolower(trim((string) $question->correct_answer));
    }
}
