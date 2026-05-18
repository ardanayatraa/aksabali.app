import { AdminPageHeader } from '@/components/admin-page-header';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';

interface StrokeAttempt {
    id: number;
    display_name: string | null;
    email: string | null;
    aksara_id: string | null;
    aksara_name: string | null;
    mode: string;
    score: number;
    passed: boolean;
    created_at: string | null;
}

interface QuizAttempt {
    id: number;
    display_name: string | null;
    email: string | null;
    mode: string;
    correct_count: number;
    total_count: number;
    score: number;
    passed: boolean;
    created_at: string | null;
}

interface Props {
    strokeAttempts: StrokeAttempt[];
    quizAttempts: QuizAttempt[];
}

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export default function AdminActivity({ strokeAttempts, quizAttempts }: Props) {
    return (
        <AdminLayout>
            <Head title="Aktivitas — Admin" />

            <AdminPageHeader
                title="Aktivitas belajar"
                description="Riwayat latihan dan kuis. Gunakan ini untuk memantau apakah fitur belajar benar-benar dipakai siswa."
                eyebrow="Aktivitas"
                icon={Activity}
            />

            <div className="grid gap-8 lg:grid-cols-2">
                <section>
                    <h2 className="font-display text-xl font-bold tracking-tight">
                        Stroke attempts <span className="text-sm font-medium text-muted-foreground">· {strokeAttempts.length}</span>
                    </h2>
                    {strokeAttempts.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">Belum ada aktivitas stroke.</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-border">
                            {strokeAttempts.map((s) => (
                                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-bold">{s.display_name || s.email || 'Siswa'}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {s.aksara_name || s.aksara_id || 'Stroke'} · {s.mode}
                                        </p>
                                        <p className="text-xs text-muted-foreground/70">{fmtDate(s.created_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`font-bold ${s.passed ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                            {s.score}/100
                                        </span>
                                        {s.passed ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h2 className="font-display text-xl font-bold tracking-tight">
                        Quiz attempts <span className="text-sm font-medium text-muted-foreground">· {quizAttempts.length}</span>
                    </h2>
                    {quizAttempts.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">Belum ada aktivitas kuis.</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-border">
                            {quizAttempts.map((q) => (
                                <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-bold">{q.display_name || q.email || 'Siswa'}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {q.mode} · {q.correct_count}/{q.total_count}
                                        </p>
                                        <p className="text-xs text-muted-foreground/70">{fmtDate(q.created_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`font-bold ${q.passed ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                            {q.score}/100
                                        </span>
                                        {q.passed ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
