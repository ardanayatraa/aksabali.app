import StudentLayout from '@/layouts/student-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Copy, Play, Trophy, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Session {
    id: string;
    pin: string;
    title: string;
    status: 'lobby' | 'live' | 'finished' | 'expired';
    mode: string;
    question_count: number;
    seconds_per_question: number;
    current_question_index: number;
}

interface Player {
    id: number;
    display_name: string;
    score: number;
    correct_count: number;
    joined_at: string | null;
}

interface CurrentQuestion {
    id: number;
    question_index: number;
    prompt: string;
    glyph: string | null;
    options: string[] | null;
    correct_answer: string | null;
    time_limit_seconds: number;
}

interface Props {
    session: Session;
    players: Player[];
    currentQuestion: CurrentQuestion | null;
}

export default function HostConsole({ session: initialSession, players: initialPlayers, currentQuestion: initialQ }: Props) {
    const [session, setSession] = useState(initialSession);
    const [players, setPlayers] = useState(initialPlayers);
    const [currentQ, setCurrentQ] = useState(initialQ);
    const [copied, setCopied] = useState(false);

    const poll = useCallback(async () => {
        try {
            const res = await fetch(route('game.host.poll', { session: session.id }), {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!res.ok) return;
            const data = await res.json();
            setSession(data.session);
            setPlayers(data.players);
            setCurrentQ(data.currentQuestion);
        } catch {
            // diam aja kalau network glitch
        }
    }, [session.id]);

    useEffect(() => {
        if (session.status === 'finished' || session.status === 'expired') return;
        const interval = setInterval(poll, 2500);
        return () => clearInterval(interval);
    }, [session.status, poll]);

    const copyPin = () => {
        navigator.clipboard?.writeText(session.pin);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const handleStart = () => {
        router.post(route('game.host.start', { session: session.id }), {}, { preserveScroll: true });
    };

    const handleAdvance = () => {
        router.post(route('game.host.advance', { session: session.id }), {}, { preserveScroll: true });
    };

    return (
        <StudentLayout>
            <Head title={`${session.title} — Host`} />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{session.title}</p>
                    <div className="mt-3 flex flex-wrap items-baseline gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">PIN</p>
                            <p className="font-mono text-5xl font-bold tracking-widest text-primary">{session.pin}</p>
                        </div>
                        <button
                            type="button"
                            onClick={copyPin}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
                        >
                            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? 'Tersalin' : 'Salin PIN'}
                        </button>
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                session.status === 'lobby'
                                    ? 'bg-amber-500/10 text-amber-600'
                                    : session.status === 'live'
                                      ? 'bg-emerald-500/10 text-emerald-600'
                                      : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {session.status}
                        </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>{session.question_count} soal</span>
                        <span>·</span>
                        <span>{session.seconds_per_question}s/soal</span>
                        <span>·</span>
                        <span>Mode: {session.mode}</span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {session.status === 'lobby' && (
                            <button
                                type="button"
                                onClick={handleStart}
                                disabled={players.length === 0}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                            >
                                <Play className="h-4 w-4" />
                                Mulai sekarang
                            </button>
                        )}
                        {session.status === 'live' && (
                            <button
                                type="button"
                                onClick={handleAdvance}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                            >
                                {session.current_question_index + 1 >= session.question_count ? 'Selesaikan game' : 'Soal berikut'}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        )}
                        {session.status === 'finished' && (
                            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground">
                                <Trophy className="h-4 w-4 text-amber-500" />
                                Game selesai — lihat podium di halaman pemain
                            </span>
                        )}
                    </div>
                </section>

                {session.status === 'live' && currentQ && (
                    <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
                        <div className="flex items-baseline justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Soal {currentQ.question_index + 1} / {session.question_count}
                            </p>
                            <p className="text-xs text-muted-foreground">{currentQ.time_limit_seconds}s</p>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{currentQ.prompt}</p>
                        <div className="mt-4 flex items-center justify-center">
                            <div className="bali-text rounded-3xl bg-background px-10 py-6 text-7xl text-primary">{currentQ.glyph}</div>
                        </div>
                        {currentQ.options && (
                            <div className="mt-5 grid gap-2 sm:grid-cols-2">
                                {currentQ.options.map((opt, i) => (
                                    <div
                                        key={i}
                                        className={`rounded-xl border px-4 py-3 text-base font-medium ${
                                            opt === currentQ.correct_answer
                                                ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600'
                                                : 'border-border bg-background text-foreground'
                                        }`}
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <h2 className="font-display text-xl font-bold tracking-tight">Pemain ({players.length})</h2>
                    </div>
                    {players.length === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Belum ada yang join. Bagikan PIN ke siswa atau tampilkan di layar kelas.
                        </p>
                    ) : (
                        <ul className="mt-4 grid gap-2">
                            {players.map((p, i) => (
                                <li
                                    key={p.id}
                                    className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {i + 1}
                                        </span>
                                        <span className="font-bold">{p.display_name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>{p.correct_count} benar</span>
                                        <span className="font-bold text-foreground">{p.score} pts</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </StudentLayout>
    );
}
