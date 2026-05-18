import { Head, Link } from '@inertiajs/react';
import { Crown, Home, Medal, RotateCcw, Trophy } from 'lucide-react';

interface Session {
    id: string;
    pin: string;
    title: string;
    status: string;
}

interface PodiumRow {
    id: number;
    display_name: string;
    score: number;
    correct_count: number;
}

interface Props {
    session: Session;
    leaderboard: PodiumRow[];
}

const placeMeta = [
    { icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10', ring: 'ring-amber-500/40', label: '1st' },
    { icon: Trophy, color: 'text-slate-400', bg: 'bg-slate-400/10', ring: 'ring-slate-400/40', label: '2nd' },
    { icon: Medal, color: 'text-orange-600', bg: 'bg-orange-600/10', ring: 'ring-orange-600/40', label: '3rd' },
] as const;

export default function GamePodium({ session, leaderboard }: Props) {
    const [first, second, third, ...rest] = leaderboard;

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <Head title={`Podium — ${session.title}`} />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_60%)]" />

            <main className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6">
                <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Podium</p>
                    <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                        {leaderboard.length > 0 ? 'Selamat!' : 'Game selesai.'}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">{session.title}</p>
                </div>

                {leaderboard.length === 0 ? (
                    <section className="mt-10 rounded-3xl border border-border bg-card p-10 text-center">
                        <p className="text-base font-bold text-foreground">Belum ada pemain.</p>
                        <p className="mt-2 text-sm text-muted-foreground">Sesi ini ga ada peserta tercatat.</p>
                    </section>
                ) : (
                    <>
                        {/* Top 3 hero */}
                        <section className="mt-10 grid gap-4 sm:grid-cols-3">
                            {[second, first, third].map((row, idx) => {
                                if (!row) return <div key={idx} className="hidden sm:block" />;
                                const placeIdx = idx === 1 ? 0 : idx === 0 ? 1 : 2;
                                const meta = placeMeta[placeIdx];
                                const Icon = meta.icon;
                                return (
                                    <div
                                        key={row.id}
                                        className={`flex flex-col items-center rounded-3xl border border-border bg-card p-6 text-center shadow-soft ring-2 ${meta.ring} ${
                                            idx === 1 ? 'sm:-mt-6' : ''
                                        }`}
                                    >
                                        <div className={`grid h-14 w-14 place-items-center rounded-full ${meta.bg}`}>
                                            <Icon className={`h-7 w-7 ${meta.color}`} />
                                        </div>
                                        <p className={`mt-3 text-xs font-black uppercase tracking-wider ${meta.color}`}>{meta.label}</p>
                                        <p className="mt-2 font-display text-2xl font-bold tracking-tight">{row.display_name}</p>
                                        <p className="mt-1 text-3xl font-bold text-primary">{row.score}</p>
                                        <p className="text-xs text-muted-foreground">{row.correct_count} benar</p>
                                    </div>
                                );
                            })}
                        </section>

                        {/* Sisanya */}
                        {rest.length > 0 && (
                            <section className="mt-10 rounded-3xl border border-border bg-card p-6">
                                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                    Peringkat selanjutnya
                                </p>
                                <ul className="mt-4 grid gap-2">
                                    {rest.map((row, i) => (
                                        <li
                                            key={row.id}
                                            className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-xs font-bold text-foreground">
                                                    {i + 4}
                                                </span>
                                                <span className="font-bold">{row.display_name}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{row.correct_count} benar</span>
                                                <span className="font-bold text-foreground">{row.score} pts</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </>
                )}

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href={route('game.lobby')}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Main lagi
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                    >
                        <Home className="h-4 w-4" />
                        Halaman utama
                    </Link>
                </div>
            </main>
        </div>
    );
}
