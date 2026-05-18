import { Head, router } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Hourglass, Trophy, XCircle } from 'lucide-react';
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

interface Me {
    id: number;
    display_name: string;
    score: number;
}

interface CurrentQuestion {
    id: number;
    question_index: number;
    prompt: string;
    glyph: string | null;
    options: string[] | null;
    time_limit_seconds: number;
    already_answered: boolean;
    was_correct: boolean | null;
}

interface Props {
    session: Session;
    me: Me;
    currentQuestion: CurrentQuestion | null;
}

export default function GameLive({ session: initialSession, me: initialMe, currentQuestion: initialQ }: Props) {
    const [session, setSession] = useState(initialSession);
    const [me, setMe] = useState(initialMe);
    const [currentQ, setCurrentQ] = useState(initialQ);
    const [picked, setPicked] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const poll = useCallback(async () => {
        try {
            const res = await fetch(route('game.poll', { session: session.id }), {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!res.ok) return;
            const data = await res.json();
            setSession(data.session);
            setMe(data.me);
            // Reset picked + feedback kalau pindah soal
            if (data.currentQuestion?.question_index !== currentQ?.question_index) {
                setPicked(null);
                setFeedback(null);
            }
            setCurrentQ(data.currentQuestion);
        } catch {
            // ignore
        }
    }, [session.id, currentQ?.question_index]);

    useEffect(() => {
        if (session.status === 'finished' || session.status === 'expired') {
            router.visit(route('game.podium', { session: session.id }));
            return;
        }
        const interval = setInterval(poll, 1500);
        return () => clearInterval(interval);
    }, [session.status, session.id, poll]);

    const handlePick = async (opt: string) => {
        if (picked || !currentQ) return;
        setPicked(opt);

        try {
            const tokenEl = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
            const csrf = tokenEl?.content ?? '';

            const res = await fetch(route('game.answer', { session: session.id }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    question_index: currentQ.question_index,
                    answer: opt,
                }),
            });
            if (!res.ok) {
                setPicked(null);
                return;
            }
            const data = await res.json();
            setFeedback(data.is_correct ? 'correct' : 'wrong');
            setMe(data.me);
        } catch {
            setPicked(null);
        }
    };

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <Head title={`${session.title} — Live`} />

            <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{me.display_name}</p>
                        <p className="font-display text-lg font-bold tracking-tight text-primary">{me.score} pts</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {session.status === 'lobby' ? 'Menunggu host' : 'Soal'}
                        </p>
                        <p className="font-mono text-lg font-bold">
                            {session.current_question_index + 1}/{session.question_count}
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
                {session.status === 'lobby' && (
                    <section className="rounded-3xl border border-border bg-card p-8 text-center">
                        <Hourglass className="mx-auto h-12 w-12 animate-pulse text-primary" />
                        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Sabar dulu.</h1>
                        <p className="mt-2 text-muted-foreground">Tunggu guru mulai game. Begitu mulai, soal pertama langsung muncul.</p>
                        <p className="mt-4 text-xs text-muted-foreground">
                            PIN: <span className="font-mono font-bold">{session.pin}</span>
                        </p>
                    </section>
                )}

                {session.status === 'live' && currentQ && (
                    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{currentQ.prompt}</p>
                        <div className="mt-4 flex items-center justify-center">
                            <div
                                className={`${
                                    /[ᬀ-᭿]/.test(currentQ.glyph ?? '') ? 'bali-text' : 'font-display'
                                } rounded-3xl bg-background px-10 py-6 text-7xl text-primary`}
                            >
                                {currentQ.glyph}
                            </div>
                        </div>

                        {currentQ.options && (
                            <div className="mt-8 grid gap-2 sm:grid-cols-2">
                                {currentQ.options.map((opt, i) => {
                                    const isPicked = opt === picked;
                                    let style = 'border-border bg-background hover:border-primary/40';
                                    if (picked) {
                                        if (isPicked && feedback === 'correct')
                                            style = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600';
                                        else if (isPicked && feedback === 'wrong')
                                            style = 'border-destructive/60 bg-destructive/10 text-destructive';
                                        else style = 'border-border bg-background opacity-60';
                                    }
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={!!picked || currentQ.already_answered}
                                            onClick={() => handlePick(opt)}
                                            className={`rounded-xl border px-4 py-3 text-left text-base font-medium transition ${style} ${
                                                /[ᬀ-᭿]/.test(opt) ? 'bali-text text-2xl' : ''
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {(picked || currentQ.already_answered) && (
                            <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold">
                                {(feedback === 'correct' || currentQ.was_correct) && (
                                    <span className="inline-flex items-center gap-1.5 text-emerald-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Benar! +100
                                    </span>
                                )}
                                {(feedback === 'wrong' || currentQ.was_correct === false) && (
                                    <span className="inline-flex items-center gap-1.5 text-destructive">
                                        <XCircle className="h-4 w-4" />
                                        Belum tepat. Tunggu soal berikut.
                                    </span>
                                )}
                            </div>
                        )}

                        <p className="mt-6 text-center text-xs text-muted-foreground">
                            Tunggu guru lanjut ke soal berikut. {currentQ.time_limit_seconds}s/soal.
                        </p>
                    </section>
                )}

                {(session.status === 'finished' || session.status === 'expired') && (
                    <section className="rounded-3xl border border-border bg-card p-8 text-center">
                        <Trophy className="mx-auto h-12 w-12 text-amber-500" />
                        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Game selesai.</h1>
                        <p className="mt-2 text-muted-foreground">Mengarahkan ke podium...</p>
                        <button
                            type="button"
                            onClick={() => router.visit(route('game.podium', { session: session.id }))}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                        >
                            Lihat podium
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </section>
                )}
            </main>
        </div>
    );
}
