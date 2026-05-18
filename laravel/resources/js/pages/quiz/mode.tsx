import StudentLayout from '@/layouts/student-layout';
import { StrokeRecognition, type StrokePoint } from '@/lib/stroke-recognition';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Eraser, RotateCcw, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Aksara {
    id: string;
    name: string;
    char: string | null;
    latin: string;
    category: string;
    is_premium: boolean;
    svg_url: string | null;
}

interface Props {
    mode: string;
    catalog: Aksara[];
}

const modeMeta: Record<string, { title: string; description: string; eyebrow: string }> = {
    acak: { eyebrow: 'Mode Acak', title: 'Mode Acak.', description: '15 soal random dari semua kategori.' },
    nyurat: { eyebrow: 'Nyurat', title: 'Kuis Nyurat.', description: 'Tulis aksara, sistem skor stroke-nya.' },
    kata: { eyebrow: 'Kata', title: 'Tebak Kata.', description: 'Aksara ↔ Latin bolak-balik.' },
    huruf: { eyebrow: 'Huruf', title: 'Tebak Huruf.', description: 'Anacaraka, swara, angka.' },
    match: { eyebrow: 'Pencocokan', title: 'Pencocokan Kata.', description: 'Drag Latin ke kartu aksara.' },
    maca: { eyebrow: 'Maca', title: 'Membaca Aksara.', description: 'Lihat aksara, ketik bacaannya.' },
};

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ===== Multiple choice engine (acak/kata/huruf/maca) =====

interface MCQuestion {
    aksara: Aksara;
    direction: 'aksara-to-latin' | 'latin-to-aksara';
    options: string[];
    answer: string;
}

function buildMCQuestions(catalog: Aksara[], count: number, allowDirection: 'both' | 'aksara-to-latin' | 'latin-to-aksara'): MCQuestion[] {
    const pool = catalog.filter((a) => !a.is_premium && a.char);
    if (pool.length < 4) return [];

    const sample = shuffle(pool).slice(0, count);
    return sample.map((aksara) => {
        const dir: MCQuestion['direction'] =
            allowDirection === 'both' ? (Math.random() < 0.5 ? 'aksara-to-latin' : 'latin-to-aksara') : allowDirection;
        const wrongs = shuffle(pool.filter((a) => a.id !== aksara.id)).slice(0, 3);

        if (dir === 'aksara-to-latin') {
            const answer = aksara.latin;
            const options = shuffle([answer, ...wrongs.map((w) => w.latin)]);
            return { aksara, direction: dir, options, answer };
        }
        const answer = aksara.char ?? aksara.latin;
        const options = shuffle([answer, ...wrongs.map((w) => w.char ?? w.latin)]);
        return { aksara, direction: dir, options, answer };
    });
}

function MultipleChoiceEngine({ mode, catalog }: { mode: string; catalog: Aksara[] }) {
    const [seed, setSeed] = useState(0);
    const questions = useMemo(() => {
        const count = mode === 'acak' ? 15 : 10;
        const dir: 'both' | 'aksara-to-latin' | 'latin-to-aksara' =
            mode === 'maca' ? 'aksara-to-latin' : 'both';
        return buildMCQuestions(catalog, count, dir);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catalog, mode, seed]);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [picked, setPicked] = useState<string | null>(null);
    const [correct, setCorrect] = useState(0);
    const [done, setDone] = useState(false);
    const [saved, setSaved] = useState(false);
    const startTimeRef = useRef(Date.now());
    const answersRef = useRef<{ q: string; picked: string; correct: string; isCorrect: boolean }[]>([]);

    const reset = () => {
        setSeed((s) => s + 1);
        setCurrentIdx(0);
        setPicked(null);
        setCorrect(0);
        setDone(false);
        setSaved(false);
        startTimeRef.current = Date.now();
        answersRef.current = [];
    };

    const handlePick = (opt: string) => {
        if (picked) return;
        setPicked(opt);
        const q = questions[currentIdx];
        const isCorrect = opt === q?.answer;
        if (isCorrect) setCorrect((c) => c + 1);
        answersRef.current.push({
            q: q.direction === 'aksara-to-latin' ? (q.aksara.char ?? '') : q.aksara.latin,
            picked: opt,
            correct: q.answer,
            isCorrect,
        });
    };

    const handleNext = () => {
        if (currentIdx + 1 >= questions.length) {
            setDone(true);
        } else {
            setCurrentIdx((i) => i + 1);
            setPicked(null);
        }
    };

    // Auto-save attempt saat done (one-shot).
    useEffect(() => {
        if (!done || saved || questions.length === 0) return;
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const score = Math.round((correct / questions.length) * 100);
        const passed = score >= 70;
        const tokenEl = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        const csrf = tokenEl?.content ?? '';
        fetch('/quiz/attempts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                Accept: 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                mode,
                category: 'semua',
                correct_count: correct,
                total_count: questions.length,
                score,
                passed,
                duration_seconds: duration,
                answers: answersRef.current,
            }),
        })
            .then(() => setSaved(true))
            .catch(() => {
                /* diam, retry on reset */
            });
    }, [done, saved, correct, questions.length, mode]);

    if (questions.length === 0) {
        return (
            <section className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <p className="text-base font-bold text-foreground">Belum cukup materi.</p>
                <p className="mt-2 text-sm text-muted-foreground">Catalog perlu minimal 4 aksara non-premium.</p>
            </section>
        );
    }

    if (done) {
        return (
            <section className="mt-8 rounded-3xl border border-border bg-card p-8 text-center">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Selesai</p>
                <h2 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight">
                    {correct} / {questions.length}
                </h2>
                <p className="mt-3 text-muted-foreground">
                    {correct === questions.length
                        ? 'Sempurna! Lanjut tantang mode lain.'
                        : correct >= questions.length / 2
                          ? 'Lumayan! Bisa diulang lagi buat naikin skor.'
                          : 'Yuk diulang — biar nempel.'}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                    {saved ? '✓ Hasil tersimpan ke riwayat' : 'Menyimpan...'}
                </p>
                <button
                    type="button"
                    onClick={reset}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                    <RotateCcw className="h-4 w-4" />
                    Ulang
                </button>
            </section>
        );
    }

    const q = questions[currentIdx];

    return (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>
                    Soal {currentIdx + 1} / {questions.length}
                </span>
                <span>Benar: {correct}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
            </div>

            <div className="mt-8 flex flex-col items-center">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {q.direction === 'aksara-to-latin' ? 'Aksara ini bacanya?' : 'Aksara untuk Latin ini?'}
                </p>
                <div
                    className={`mt-4 ${
                        q.direction === 'aksara-to-latin' ? 'bali-text' : 'font-display'
                    } rounded-3xl bg-background px-10 py-6 text-7xl text-primary`}
                >
                    {q.direction === 'aksara-to-latin' ? q.aksara.char : q.aksara.latin}
                </div>
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt) => {
                    const isAnswer = opt === q.answer;
                    const isPicked = opt === picked;
                    let style = 'border-border bg-background hover:border-primary/40';
                    if (picked) {
                        if (isAnswer) style = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600';
                        else if (isPicked) style = 'border-destructive/60 bg-destructive/10 text-destructive';
                        else style = 'border-border bg-background opacity-60';
                    }
                    return (
                        <button
                            key={opt}
                            type="button"
                            disabled={!!picked}
                            onClick={() => handlePick(opt)}
                            className={`rounded-xl border px-4 py-3 text-left text-base font-medium transition ${style} ${
                                q.direction === 'latin-to-aksara' ? 'bali-text text-2xl' : ''
                            }`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>

            {picked && (
                <button
                    type="button"
                    onClick={handleNext}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                    {currentIdx + 1 >= questions.length ? 'Lihat hasil' : 'Lanjut'}
                    <ArrowRight className="h-4 w-4" />
                </button>
            )}
        </section>
    );
}

// ===== Match engine (drag & drop) =====

function MatchEngine({ catalog }: { catalog: Aksara[] }) {
    const [seed, setSeed] = useState(0);
    const round = useMemo(() => {
        const pool = catalog.filter((a) => !a.is_premium && a.char);
        if (pool.length < 4) return null;
        const items = shuffle(pool).slice(0, 4);
        const labels = shuffle(items.map((a) => a.latin));
        return { items, labels };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catalog, seed]);

    // Map aksara.id → label that user dropped on it (null kalau belum).
    const [drops, setDrops] = useState<Record<string, string | null>>({});
    const [dragLabel, setDragLabel] = useState<string | null>(null);

    useEffect(() => {
        if (!round) return;
        setDrops(Object.fromEntries(round.items.map((a) => [a.id, null])));
    }, [round]);

    if (!round) {
        return (
            <section className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <p className="text-base font-bold text-foreground">Belum cukup materi.</p>
                <p className="mt-2 text-sm text-muted-foreground">Mode pencocokan butuh minimal 4 aksara non-premium.</p>
            </section>
        );
    }

    const handleDragStart = (label: string) => setDragLabel(label);
    const handleDrop = (aksaraId: string) => {
        if (!dragLabel) return;
        setDrops((prev) => {
            // Kalau label sudah ada di card lain, lepas dari sana.
            const next = { ...prev };
            for (const id of Object.keys(next)) {
                if (next[id] === dragLabel) next[id] = null;
            }
            next[aksaraId] = dragLabel;
            return next;
        });
        setDragLabel(null);
    };

    const filled = Object.values(drops).filter(Boolean).length;
    const allCorrect = round.items.every((a) => drops[a.id] === a.latin);
    const allFilled = filled === round.items.length;

    const reset = () => {
        setSeed((s) => s + 1);
    };

    const usedLabels = new Set(Object.values(drops).filter(Boolean) as string[]);

    return (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Drag tiap nama Latin ke kartu aksara yang cocok.
            </p>

            {/* Drop zones — 4 kartu aksara */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {round.items.map((a) => {
                    const dropped = drops[a.id];
                    const correct = dropped === a.latin;
                    const wrong = allFilled && dropped !== null && dropped !== a.latin;
                    return (
                        <div
                            key={a.id}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(a.id)}
                            className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-4 transition ${
                                wrong
                                    ? 'border-destructive bg-destructive/5'
                                    : dropped && correct
                                      ? 'border-emerald-500/60 bg-emerald-500/5'
                                      : dropped
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border bg-background'
                            }`}
                        >
                            <div className="bali-text text-5xl text-primary">{a.char}</div>
                            <div className="min-h-9 w-full">
                                {dropped ? (
                                    <span
                                        className={`inline-flex w-full items-center justify-center rounded-lg px-3 py-1.5 text-sm font-bold ${
                                            allFilled && correct
                                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                                : allFilled && !correct
                                                  ? 'bg-destructive/15 text-destructive'
                                                  : 'bg-primary/15 text-primary'
                                        }`}
                                    >
                                        {dropped}
                                    </span>
                                ) : (
                                    <span className="block text-center text-xs text-muted-foreground">drop disini</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Draggable Latin chips */}
            <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pilihan Latin</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {round.labels.map((label) => {
                        const used = usedLabels.has(label);
                        return (
                            <div
                                key={label}
                                draggable={!allFilled}
                                onDragStart={() => handleDragStart(label)}
                                className={`cursor-grab rounded-xl border bg-background px-4 py-2 text-sm font-bold transition active:cursor-grabbing ${
                                    used ? 'border-border opacity-30' : 'border-primary/40 text-primary hover:border-primary'
                                }`}
                            >
                                {label}
                            </div>
                        );
                    })}
                </div>
            </div>

            {allFilled && (
                <div className="mt-6 rounded-xl border border-border bg-background p-4 text-center">
                    {allCorrect ? (
                        <p className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Semua cocok! Lanjut babak baru?
                        </p>
                    ) : (
                        <p className="inline-flex items-center gap-2 text-sm font-bold text-destructive">
                            <XCircle className="h-4 w-4" />
                            Ada yang belum tepat — coba lagi.
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={reset}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Babak baru
                    </button>
                </div>
            )}
        </section>
    );
}

// ===== Nyurat engine (stroke recognition) =====

async function loadReferenceStrokes(svgUrl: string | null): Promise<string[]> {
    if (!svgUrl) return [];
    try {
        const res = await fetch(svgUrl, { credentials: 'same-origin' });
        if (!res.ok) return [];
        const text = await res.text();
        const matches = text.match(/<path[^>]*\sd="([^"]+)"/g) ?? [];
        return matches
            .map((m) => {
                const dMatch = m.match(/d="([^"]+)"/);
                return dMatch ? dMatch[1] : '';
            })
            .filter(Boolean);
    } catch {
        return [];
    }
}

function NyuratEngine({ catalog }: { catalog: Aksara[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef(false);
    const strokeRef = useRef<StrokePoint[]>([]);
    const startTimeRef = useRef(Date.now());

    // Pool aksara dgn SVG referensi.
    const pool = useMemo(() => catalog.filter((a) => !a.is_premium && a.svg_url && a.char), [catalog]);
    const [round, setRound] = useState(0);
    const [refStrokes, setRefStrokes] = useState<string[]>([]);
    const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
    const [scores, setScores] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [feedbackOk, setFeedbackOk] = useState<boolean>(false);

    const target = pool[round % Math.max(1, pool.length)];

    useEffect(() => {
        if (!target) return;
        loadReferenceStrokes(target.svg_url).then((s) => {
            setRefStrokes(s);
            setCurrentStrokeIdx(0);
            setScores([]);
            setFeedback(null);
        });
    }, [target?.id, target]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        const size = Math.min(rect.width, 480);
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Background: stroke selesai + stroke aktif highlight.
        ctx.save();
        ctx.scale(size / 200, size / 200);
        ctx.strokeStyle = 'rgba(120, 120, 120, 0.35)';
        ctx.lineWidth = 1.8;
        refStrokes.slice(0, currentStrokeIdx).forEach((d) => ctx.stroke(new Path2D(d)));
        if (currentStrokeIdx < refStrokes.length) {
            ctx.strokeStyle = 'rgba(185, 28, 28, 0.18)';
            ctx.lineWidth = 8;
            ctx.stroke(new Path2D(refStrokes[currentStrokeIdx]));
        }
        ctx.restore();

        ctx.lineWidth = 6;
        ctx.strokeStyle = '#B91C1C';

        const getPoint = (e: MouseEvent | TouchEvent): StrokePoint => {
            const r = canvas.getBoundingClientRect();
            const p = 'touches' in e ? e.touches[0] : (e as MouseEvent);
            return {
                x: ((p.clientX - r.left) / size) * 200,
                y: ((p.clientY - r.top) / size) * 200,
                t: Date.now() - startTimeRef.current,
            };
        };

        const onStart = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            drawingRef.current = true;
            strokeRef.current = [];
            const pt = getPoint(e);
            strokeRef.current.push(pt);
            ctx.beginPath();
            ctx.moveTo((pt.x / 200) * size, (pt.y / 200) * size);
        };
        const onMove = (e: MouseEvent | TouchEvent) => {
            if (!drawingRef.current) return;
            e.preventDefault();
            const pt = getPoint(e);
            strokeRef.current.push(pt);
            ctx.lineTo((pt.x / 200) * size, (pt.y / 200) * size);
            ctx.stroke();
        };
        const onEnd = () => {
            if (!drawingRef.current) return;
            drawingRef.current = false;
            const pts = strokeRef.current;
            if (pts.length < 3) return;

            const refD = refStrokes[currentStrokeIdx];
            if (refD) {
                const evaluation = StrokeRecognition.evaluate(pts, refD);
                setScores((s) => [...s, evaluation.metric.score]);
                setFeedback(`Skor ${evaluation.metric.score} — ${evaluation.metric.feedbackMessage}`);
                setFeedbackOk(evaluation.metric.score >= 70);
            }
            strokeRef.current = [];
        };

        canvas.addEventListener('mousedown', onStart);
        canvas.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);
        canvas.addEventListener('touchstart', onStart, { passive: false });
        canvas.addEventListener('touchmove', onMove, { passive: false });
        canvas.addEventListener('touchend', onEnd);

        return () => {
            canvas.removeEventListener('mousedown', onStart);
            canvas.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onEnd);
            canvas.removeEventListener('touchstart', onStart);
            canvas.removeEventListener('touchmove', onMove);
            canvas.removeEventListener('touchend', onEnd);
        };
    }, [refStrokes, currentStrokeIdx]);

    const handleNext = () => {
        if (currentStrokeIdx + 1 >= refStrokes.length) {
            // Soal selesai — pindah aksara berikut.
            setRound((r) => r + 1);
        } else {
            setCurrentStrokeIdx((i) => i + 1);
            setFeedback(null);
        }
    };

    const reset = () => {
        setCurrentStrokeIdx(0);
        setScores([]);
        setFeedback(null);
    };

    if (pool.length === 0) {
        return (
            <section className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <p className="text-base font-bold text-foreground">Belum ada aksara dgn SVG referensi.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Mode nyurat butuh aksara dengan svg_url. Admin perlu upload SVG ke catalog.
                </p>
            </section>
        );
    }

    const avgScore = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : 0;

    return (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-3xl border border-border bg-card p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tulis aksara berikut</p>
                <div className="mt-4 flex flex-col items-center">
                    <div className="bali-text rounded-3xl bg-background px-8 py-6 text-7xl text-primary">{target.char}</div>
                    <p className="mt-3 font-display text-2xl font-bold tracking-tight">{target.name}</p>
                    <p className="text-sm text-muted-foreground">Latin: {target.latin}</p>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                    Stroke {Math.min(currentStrokeIdx + 1, refStrokes.length || 1)} / {refStrokes.length || '?'}
                </p>
                {scores.length > 0 && (
                    <div className="mt-3 rounded-xl border border-border bg-background p-3 text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skor rata-rata</p>
                        <p className="mt-1 font-display text-3xl font-bold tracking-tight text-primary">{avgScore}/100</p>
                    </div>
                )}
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
                <div ref={containerRef} className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background">
                    <canvas ref={canvasRef} className="h-full w-full touch-none cursor-crosshair" />
                </div>

                {feedback && (
                    <div
                        className={`mt-3 rounded-xl border p-3 text-sm font-bold ${
                            feedbackOk
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
                                : 'border-amber-500/40 bg-amber-500/10 text-amber-600'
                        }`}
                    >
                        {feedback}
                    </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-destructive hover:text-destructive"
                    >
                        <Eraser className="h-3.5 w-3.5" />
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                    >
                        {currentStrokeIdx + 1 >= refStrokes.length ? 'Aksara berikut' : 'Stroke berikut'}
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </section>
    );
}

// ===== Main page =====

export default function QuizMode({ mode, catalog }: Props) {
    const meta = modeMeta[mode] ?? { eyebrow: mode, title: mode, description: '' };

    return (
        <StudentLayout>
            <Head title={`${meta.title} — Kuis`} />

            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                    href={route('quiz.index')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke kuis
                </Link>

                <section className="mt-6">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{meta.eyebrow}</p>
                    <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{meta.title}</h1>
                    <p className="mt-2 text-base leading-7 text-muted-foreground">{meta.description}</p>
                </section>

                {mode === 'match' && <MatchEngine catalog={catalog} />}
                {mode === 'nyurat' && <NyuratEngine catalog={catalog} />}
                {mode !== 'match' && mode !== 'nyurat' && <MultipleChoiceEngine mode={mode} catalog={catalog} />}
            </div>
        </StudentLayout>
    );
}
