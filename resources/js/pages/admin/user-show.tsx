import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Sparkles, UserCheck, UserRound, UserX, XCircle } from 'lucide-react';

interface UserDetail {
    id: number;
    name: string;
    display_name: string;
    email: string;
    role: string;
    tier: string;
    status: string;
    avatar_url: string | null;
    created_at: string | null;
}

interface StrokeAttempt {
    id: number;
    aksara_id: string;
    mode: string;
    score: number;
    passed: boolean;
    duration_seconds: number;
    created_at: string | null;
}

interface QuizAttempt {
    id: number;
    mode: string;
    category: string;
    correct_count: number;
    total_count: number;
    score: number;
    passed: boolean;
    duration_seconds: number;
    created_at: string | null;
}

interface Props {
    user: UserDetail;
    strokeAttempts: StrokeAttempt[];
    quizAttempts: QuizAttempt[];
    strokeStats: { total: number; avg_score: number; mastered: number };
    quizStats: { total: number; avg_score: number; passed: number };
}

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}

export default function UserShow({ user, strokeAttempts, quizAttempts, strokeStats, quizStats }: Props) {
    return (
        <AdminLayout>
            <Head title={`${user.name} — Admin`} />

            <Link
                href={route('admin.users')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke daftar pengguna
            </Link>

            <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full" />
                    ) : (
                        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                            <UserRound className="h-8 w-8" />
                        </div>
                    )}
                    <div>
                        <h1 className="font-display text-3xl font-semibold tracking-tight">{user.name}</h1>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Bergabung {fmtDate(user.created_at)}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-bold uppercase tracking-wider text-muted-foreground">{user.role}</span>
                    <span
                        className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider ${
                            user.tier === 'premium' || user.tier === 'lite' ? 'text-amber-600' : 'text-muted-foreground'
                        }`}
                    >
                        <Sparkles className="h-3 w-3" /> {user.tier}
                    </span>
                    <span
                        className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider ${
                            user.status === 'suspended' ? 'text-destructive' : 'text-emerald-600'
                        }`}
                    >
                        {user.status === 'suspended' ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        {user.status}
                    </span>
                </div>
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-3">
                {[
                    { label: 'Stroke attempts', value: strokeStats.total, sub: `avg ${strokeStats.avg_score}/100` },
                    { label: 'Aksara dikuasai', value: strokeStats.mastered, sub: 'lulus stroke ≥70' },
                    { label: 'Quiz attempts', value: quizStats.total, sub: `avg ${quizStats.avg_score}/100 · ${quizStats.passed} lulus` },
                ].map((s) => (
                    <div key={s.label} className="border-l-2 border-border pl-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                        <p className="mt-1 font-display text-4xl font-semibold tracking-tight">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.sub}</p>
                    </div>
                ))}
            </div>

            <section className="mt-10">
                <h2 className="font-display text-xl font-bold tracking-tight">
                    Riwayat stroke <span className="text-sm font-medium text-muted-foreground">· 50 terakhir</span>
                </h2>
                {strokeAttempts.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Belum ada stroke attempt.</p>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="py-2 pr-3">Tanggal</th>
                                    <th className="py-2 pr-3">Aksara</th>
                                    <th className="py-2 pr-3">Mode</th>
                                    <th className="py-2 pr-3">Skor</th>
                                    <th className="py-2 pr-3">Lulus</th>
                                    <th className="py-2">Durasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {strokeAttempts.map((s) => (
                                    <tr key={s.id}>
                                        <td className="py-2 pr-3 text-xs text-muted-foreground">{fmtDate(s.created_at)}</td>
                                        <td className="py-2 pr-3 font-mono text-xs">{s.aksara_id}</td>
                                        <td className="py-2 pr-3 text-xs">{s.mode}</td>
                                        <td className="py-2 pr-3 font-bold">{s.score}/100</td>
                                        <td className="py-2 pr-3">
                                            {s.passed ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </td>
                                        <td className="py-2 text-xs text-muted-foreground">{s.duration_seconds}s</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="mt-8">
                <h2 className="font-display text-xl font-bold tracking-tight">
                    Riwayat kuis <span className="text-sm font-medium text-muted-foreground">· 50 terakhir</span>
                </h2>
                {quizAttempts.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Belum ada quiz attempt.</p>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="py-2 pr-3">Tanggal</th>
                                    <th className="py-2 pr-3">Mode</th>
                                    <th className="py-2 pr-3">Benar</th>
                                    <th className="py-2 pr-3">Skor</th>
                                    <th className="py-2 pr-3">Lulus</th>
                                    <th className="py-2">Durasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {quizAttempts.map((q) => (
                                    <tr key={q.id}>
                                        <td className="py-2 pr-3 text-xs text-muted-foreground">{fmtDate(q.created_at)}</td>
                                        <td className="py-2 pr-3 text-xs">{q.mode}</td>
                                        <td className="py-2 pr-3 text-xs">
                                            {q.correct_count} / {q.total_count}
                                        </td>
                                        <td className="py-2 pr-3 font-bold">{q.score}/100</td>
                                        <td className="py-2 pr-3">
                                            {q.passed ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </td>
                                        <td className="py-2 text-xs text-muted-foreground">{q.duration_seconds}s</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
