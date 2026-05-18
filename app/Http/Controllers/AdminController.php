<?php

namespace App\Http\Controllers;

use App\Models\Aksara;
use App\Models\AppSetting;
use App\Models\GameSession;
use App\Models\PaymentTransaction;
use App\Models\QuizAttempt;
use App\Models\StrokeAttempt;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin dashboard + user management + site mode toggle.
 * Aksara CMS dipindah ke AdminAksaraController.
 */
class AdminController extends Controller
{
    /** Dashboard utama: `/admin`. */
    public function dashboard(): Response
    {
        $stats = [
            'users' => User::count(),
            'premium' => User::whereIn('tier', ['lite', 'premium'])->count(),
            'suspended' => User::where('status', 'suspended')->count(),
            'aksara' => Aksara::count(),
            'aksara_premium' => Aksara::where('is_premium', true)->count(),
            'active_sessions' => GameSession::whereIn('status', ['lobby', 'live'])->count(),
            'total_sessions' => GameSession::count(),
            'pending_payments' => PaymentTransaction::where('status', 'pending')->count(),
            'success_payments' => PaymentTransaction::where('status', 'success')->count(),
        ];

        $recentUsers = User::query()
            ->orderByDesc('created_at')
            ->limit(8)
            ->get(['id', 'name', 'email', 'role', 'tier', 'status', 'created_at'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'tier' => $u->tier,
                'status' => $u->status,
                'created_at' => $u->created_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'siteMode' => AppSetting::siteMode(),
        ]);
    }

    /** Daftar user dgn filter: `/admin/users`. */
    public function users(Request $request): Response
    {
        $query = User::query()->orderByDesc('created_at');

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($q = $request->query('q')) {
            $query->where(function ($w) use ($q) {
                $w->where('email', 'like', "%{$q}%")->orWhere('name', 'like', "%{$q}%");
            });
        }

        $users = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/users', [
            'users' => $users->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'tier' => $u->tier,
                'status' => $u->status,
                'created_at' => $u->created_at?->toIso8601String(),
            ]),
            'filters' => [
                'role' => $request->query('role'),
                'status' => $request->query('status'),
                'q' => $request->query('q'),
            ],
        ]);
    }

    /** Toggle status user (active ↔ suspended): `POST /admin/users/{user}/suspend`. */
    public function toggleSuspend(User $user, Request $request): RedirectResponse
    {
        // Admin tidak bisa suspend dirinya sendiri.
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'Ga bisa suspend akun sendiri.']);
        }

        $user->update([
            'status' => $user->status === 'suspended' ? 'active' : 'suspended',
        ]);

        return back()->with('success', "User {$user->email} status: {$user->status}");
    }

    /** Update role user: `POST /admin/users/{user}/role`. */
    public function updateRole(User $user, Request $request): RedirectResponse
    {
        $data = $request->validate([
            'role' => 'required|in:siswa,pengajar,admin',
        ]);

        $user->update(['role' => $data['role']]);

        return back()->with('success', "Role {$user->email} → {$data['role']}");
    }

    /** Update tier user (manual grant Premium): `POST /admin/users/{user}/tier`. */
    public function updateTier(User $user, Request $request): RedirectResponse
    {
        $data = $request->validate([
            'tier' => 'required|in:free,lite,premium',
        ]);

        $user->update(['tier' => $data['tier']]);

        return back()->with('success', "Tier {$user->email} → {$data['tier']}");
    }

    /** User detail + history attempts: `/admin/users/{user}`. */
    public function userShow(User $user): Response
    {
        $strokes = StrokeAttempt::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'aksara_id', 'mode', 'score', 'passed', 'duration_seconds', 'created_at'])
            ->map(fn (StrokeAttempt $s) => [
                'id' => $s->id,
                'aksara_id' => $s->aksara_id,
                'mode' => $s->mode,
                'score' => $s->score,
                'passed' => (bool) $s->passed,
                'duration_seconds' => $s->duration_seconds,
                'created_at' => $s->created_at?->toIso8601String(),
            ])
            ->all();

        $quizzes = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'mode', 'category', 'correct_count', 'total_count', 'score', 'passed', 'duration_seconds', 'created_at'])
            ->map(fn (QuizAttempt $q) => [
                'id' => $q->id,
                'mode' => $q->mode,
                'category' => $q->category,
                'correct_count' => $q->correct_count,
                'total_count' => $q->total_count,
                'score' => $q->score,
                'passed' => (bool) $q->passed,
                'duration_seconds' => $q->duration_seconds,
                'created_at' => $q->created_at?->toIso8601String(),
            ])
            ->all();

        $strokeStats = [
            'total' => StrokeAttempt::where('user_id', $user->id)->count(),
            'avg_score' => (int) round(StrokeAttempt::where('user_id', $user->id)->avg('score') ?? 0),
            'mastered' => StrokeAttempt::where('user_id', $user->id)->where('passed', true)->distinct('aksara_id')->count('aksara_id'),
        ];
        $quizStats = [
            'total' => QuizAttempt::where('user_id', $user->id)->count(),
            'avg_score' => (int) round(QuizAttempt::where('user_id', $user->id)->avg('score') ?? 0),
            'passed' => QuizAttempt::where('user_id', $user->id)->where('passed', true)->count(),
        ];

        return Inertia::render('admin/user-show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'display_name' => $user->display_name,
                'email' => $user->email,
                'role' => $user->role,
                'tier' => $user->tier,
                'status' => $user->status,
                'avatar_url' => $user->avatar_url,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
            'strokeAttempts' => $strokes,
            'quizAttempts' => $quizzes,
            'strokeStats' => $strokeStats,
            'quizStats' => $quizStats,
        ]);
    }

    /** Settings (site mode dll): `/admin/settings`. */
    public function settings(): Response
    {
        return Inertia::render('admin/settings', [
            'siteMode' => AppSetting::siteMode(),
            'launchAt' => AppSetting::launchAt(),
            'modes' => AppSetting::SITE_MODES,
        ]);
    }

    /** Update site mode: `POST /admin/settings/site-mode`. */
    public function updateSiteMode(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'site_mode' => 'required|in:' . implode(',', AppSetting::SITE_MODES),
            'launch_at' => 'nullable|date',
        ]);

        AppSetting::set('site_mode', $data['site_mode']);

        if (isset($data['launch_at'])) {
            AppSetting::set('launch_at', $data['launch_at']);
        }

        return back()->with('success', "Site mode → {$data['site_mode']}");
    }

    /** Aktivitas belajar: riwayat stroke + quiz attempts dari semua user. */
    public function activity(): Response
    {
        $strokes = StrokeAttempt::query()
            ->leftJoin('users', 'users.id', '=', 'stroke_attempts.user_id')
            ->leftJoin('aksara', 'aksara.id', '=', 'stroke_attempts.aksara_id')
            ->orderByDesc('stroke_attempts.created_at')
            ->limit(30)
            ->get([
                'stroke_attempts.id',
                'stroke_attempts.user_id',
                'stroke_attempts.aksara_id',
                'stroke_attempts.mode',
                'stroke_attempts.score',
                'stroke_attempts.passed',
                'stroke_attempts.created_at',
                'users.name as display_name',
                'users.email',
                'aksara.name as aksara_name',
            ])
            ->map(fn ($row) => [
                'id' => $row->id,
                'display_name' => $row->display_name,
                'email' => $row->email,
                'aksara_id' => $row->aksara_id,
                'aksara_name' => $row->aksara_name,
                'mode' => $row->mode,
                'score' => (int) $row->score,
                'passed' => (bool) $row->passed,
                'created_at' => $row->created_at?->toIso8601String(),
            ])
            ->all();

        $quizzes = QuizAttempt::query()
            ->leftJoin('users', 'users.id', '=', 'quiz_attempts.user_id')
            ->orderByDesc('quiz_attempts.created_at')
            ->limit(30)
            ->get([
                'quiz_attempts.id',
                'quiz_attempts.user_id',
                'quiz_attempts.mode',
                'quiz_attempts.correct_count',
                'quiz_attempts.total_count',
                'quiz_attempts.score',
                'quiz_attempts.passed',
                'quiz_attempts.created_at',
                'users.name as display_name',
                'users.email',
            ])
            ->map(fn ($row) => [
                'id' => $row->id,
                'display_name' => $row->display_name,
                'email' => $row->email,
                'mode' => $row->mode,
                'correct_count' => (int) $row->correct_count,
                'total_count' => (int) $row->total_count,
                'score' => (int) $row->score,
                'passed' => (bool) $row->passed,
                'created_at' => $row->created_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('admin/activity', [
            'strokeAttempts' => $strokes,
            'quizAttempts' => $quizzes,
        ]);
    }

    /** Daftar sesi game kelas: `/admin/game`. */
    public function gameSessions(): Response
    {
        $sessions = GameSession::query()
            ->leftJoin('users', 'users.id', '=', 'game_sessions.host_id')
            ->leftJoin('game_players', 'game_players.session_id', '=', 'game_sessions.id')
            ->selectRaw(
                'game_sessions.id, game_sessions.pin, game_sessions.title, game_sessions.status,
                 game_sessions.question_count, game_sessions.seconds_per_question,
                 game_sessions.current_question_index, game_sessions.created_at,
                 users.name as host_name,
                 COUNT(game_players.id) as player_count'
            )
            ->groupBy(
                'game_sessions.id', 'game_sessions.pin', 'game_sessions.title', 'game_sessions.status',
                'game_sessions.question_count', 'game_sessions.seconds_per_question',
                'game_sessions.current_question_index', 'game_sessions.created_at', 'users.name'
            )
            ->orderByDesc('game_sessions.created_at')
            ->limit(30)
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'pin' => $row->pin,
                'title' => $row->title,
                'status' => $row->status,
                'question_count' => (int) $row->question_count,
                'seconds_per_question' => (int) $row->seconds_per_question,
                'player_count' => (int) $row->player_count,
                'host_name' => $row->host_name,
                'created_at' => $row->created_at?->toIso8601String() ?? null,
            ])
            ->all();

        return Inertia::render('admin/game', [
            'sessions' => $sessions,
        ]);
    }

    /** Daftar transaksi pembayaran: `/admin/payments`. */
    public function payments(): Response
    {
        $transactions = PaymentTransaction::query()
            ->leftJoin('users', 'users.id', '=', 'payment_transactions.user_id')
            ->orderByDesc('payment_transactions.created_at')
            ->limit(30)
            ->get([
                'payment_transactions.id',
                'payment_transactions.midtrans_transaction_id as order_id',
                'payment_transactions.amount',
                'payment_transactions.currency',
                'payment_transactions.plan',
                'payment_transactions.status',
                'payment_transactions.payment_type',
                'payment_transactions.paid_at',
                'payment_transactions.created_at',
                'users.name as display_name',
                'users.email',
            ])
            ->map(fn ($row) => [
                'id' => $row->id,
                'order_id' => $row->order_id ?? (string) $row->id,
                'amount' => (int) $row->amount,
                'currency' => $row->currency,
                'plan' => $row->plan,
                'status' => $row->status,
                'payment_type' => $row->payment_type,
                'display_name' => $row->display_name,
                'email' => $row->email,
                'paid_at' => $row->paid_at?->toIso8601String(),
                'created_at' => $row->created_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('admin/payments', [
            'transactions' => $transactions,
        ]);
    }

    /** Bank kuis: aksara catalog grouped per kategori + daftar mode kuis. */
    public function quizBank(): Response
    {
        $modes = [
            ['id' => 'nyurat', 'name' => 'Kuis Nyurat', 'description' => 'Menulis aksara di kanvas stroke recognition.'],
            ['id' => 'kata', 'name' => 'Tebak Kata Bolak Balik', 'description' => 'Aksara ke Latin dan Latin ke aksara.'],
            ['id' => 'huruf', 'name' => 'Tebak Huruf Bolak Balik', 'description' => 'Anacaraka, swara, dan angka dua arah.'],
            ['id' => 'match', 'name' => 'Pencocokan Kata', 'description' => 'Drag kata Latin ke kartu aksara.'],
            ['id' => 'maca', 'name' => 'Membaca Aksara Bali', 'description' => 'Baca aksara lalu jawab bacaan Latin.'],
            ['id' => 'acak', 'name' => 'Mode Acak', 'description' => 'Soal acak dari semua bank kuis.'],
        ];

        $groups = Aksara::query()
            ->leftJoin('categories', 'categories.id', '=', 'aksara.category')
            ->orderBy('categories.order')
            ->orderBy('aksara.order')
            ->get([
                'aksara.id',
                'aksara.name',
                'aksara.char as glyph',
                'aksara.latin',
                'aksara.category',
                'categories.name as category_name',
            ])
            ->groupBy('category')
            ->map(fn ($items, $catId) => [
                'id' => $catId,
                'name' => $items->first()->category_name ?? $catId,
                'count' => $items->count(),
                'items' => $items->map(fn ($a) => [
                    'id' => $a->id,
                    'latin' => $a->latin,
                    'glyph' => $a->glyph,
                    'group' => $a->category_name ?? $a->category,
                ])->values()->all(),
            ])
            ->values()
            ->all();

        return Inertia::render('admin/quiz-bank', [
            'modes' => $modes,
            'groups' => $groups,
        ]);
    }
}
