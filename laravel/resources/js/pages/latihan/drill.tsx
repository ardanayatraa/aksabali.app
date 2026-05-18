import StudentLayout from '@/layouts/student-layout';
import { StrokeRecognition, type StrokeEvaluation, type StrokePoint } from '@/lib/stroke-recognition';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Eraser, RotateCcw, Save, Volume2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Aksara {
    id: string;
    name: string;
    char: string | null;
    latin: string;
    category: string;
    is_premium: boolean;
    svg_url: string | null;
    image_url: string | null;
    target_stroke_count: number;
    notes: string | null;
}

interface Props {
    aksara: Aksara;
}

const CANVAS_VIEWBOX = 200; // koordinat dalam viewBox 200×200 — match dgn referensi SVG.

/**
 * Coba fetch SVG referensi → ambil semua <path d="..."> sebagai array stroke target.
 * Return [] kalau SVG ga ada / ga bisa diparse.
 */
async function loadReferenceStrokes(svgUrl: string | null): Promise<string[]> {
    if (!svgUrl) return [];
    try {
        const res = await fetch(svgUrl, { credentials: 'same-origin' });
        if (!res.ok) return [];
        const text = await res.text();
        const matches = text.match(/<path[^>]*\sd="([^"]+)"/g) ?? [];
        return matches.map((m) => {
            const dMatch = m.match(/d="([^"]+)"/);
            return dMatch ? dMatch[1] : '';
        }).filter(Boolean);
    } catch {
        return [];
    }
}

interface AttemptResult {
    strokeIndex: number;
    evaluation: StrokeEvaluation;
}

export default function LatihanDrill({ aksara }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef(false);
    const currentStrokeRef = useRef<StrokePoint[]>([]);
    const startTimeRef = useRef<number>(Date.now());

    const [referenceStrokes, setReferenceStrokes] = useState<string[]>([]);
    const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
    const [attempts, setAttempts] = useState<AttemptResult[]>([]);
    const [feedback, setFeedback] = useState<StrokeEvaluation | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Load referensi SVG saat mount.
    useEffect(() => {
        startTimeRef.current = Date.now();
        loadReferenceStrokes(aksara.svg_url).then(setReferenceStrokes);
    }, [aksara.svg_url]);

    // Setup canvas + listeners.
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        const size = Math.min(rect.width, 600);
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#B91C1C';

        // Draw referensi sebagai background (tipis).
        drawReference(ctx, size);
        // Draw stroke yang sudah dibuat user.
        drawUserStrokes(ctx, size);

        const getPoint = (e: MouseEvent | TouchEvent): StrokePoint => {
            const r = canvas.getBoundingClientRect();
            const p = 'touches' in e ? e.touches[0] : (e as MouseEvent);
            const localX = p.clientX - r.left;
            const localY = p.clientY - r.top;
            // Convert ke viewBox 0–200.
            return {
                x: (localX / size) * CANVAS_VIEWBOX,
                y: (localY / size) * CANVAS_VIEWBOX,
                t: Date.now() - startTimeRef.current,
            };
        };

        const onStart = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            drawingRef.current = true;
            currentStrokeRef.current = [];
            const point = getPoint(e);
            currentStrokeRef.current.push(point);
            const px = (point.x / CANVAS_VIEWBOX) * size;
            const py = (point.y / CANVAS_VIEWBOX) * size;
            ctx.beginPath();
            ctx.moveTo(px, py);
        };

        const onMove = (e: MouseEvent | TouchEvent) => {
            if (!drawingRef.current) return;
            e.preventDefault();
            const point = getPoint(e);
            currentStrokeRef.current.push(point);
            const px = (point.x / CANVAS_VIEWBOX) * size;
            const py = (point.y / CANVAS_VIEWBOX) * size;
            ctx.lineTo(px, py);
            ctx.stroke();
        };

        const onEnd = () => {
            if (!drawingRef.current) return;
            drawingRef.current = false;
            const strokePoints = currentStrokeRef.current;
            if (strokePoints.length < 3) {
                currentStrokeRef.current = [];
                return;
            }

            // Evaluate.
            const refD = referenceStrokes[currentStrokeIdx];
            if (refD) {
                const evaluation = StrokeRecognition.evaluate(strokePoints, refD);
                setFeedback(evaluation);
                setAttempts((prev) => [...prev, { strokeIndex: currentStrokeIdx, evaluation }]);
            } else {
                setFeedback(null);
            }
            currentStrokeRef.current = [];
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [referenceStrokes, currentStrokeIdx, attempts.length]);

    function drawReference(ctx: CanvasRenderingContext2D, size: number) {
        ctx.save();
        ctx.scale(size / CANVAS_VIEWBOX, size / CANVAS_VIEWBOX);

        // Stroke yang sudah selesai — abu-abu solid.
        ctx.strokeStyle = 'rgba(120, 120, 120, 0.35)';
        ctx.lineWidth = 1.8;
        referenceStrokes.slice(0, currentStrokeIdx).forEach((d) => {
            const path = new Path2D(d);
            ctx.stroke(path);
        });

        // Stroke aktif — outline merah samar sbg panduan.
        if (currentStrokeIdx < referenceStrokes.length) {
            ctx.strokeStyle = 'rgba(185, 28, 28, 0.18)';
            ctx.lineWidth = 8;
            const path = new Path2D(referenceStrokes[currentStrokeIdx]);
            ctx.stroke(path);
        }

        ctx.restore();
    }

    function drawUserStrokes(ctx: CanvasRenderingContext2D, size: number) {
        ctx.save();
        ctx.scale(size / CANVAS_VIEWBOX, size / CANVAS_VIEWBOX);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        attempts.forEach((a) => {
            const points = a.evaluation.normalizedPoints;
            if (points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        });
        ctx.restore();
    }

    const handleNextStroke = () => {
        setCurrentStrokeIdx((i) => Math.min(i + 1, referenceStrokes.length));
        setFeedback(null);
    };

    const handleReset = () => {
        setCurrentStrokeIdx(0);
        setAttempts([]);
        setFeedback(null);
        setSaved(false);
        startTimeRef.current = Date.now();
    };

    const handleSave = async () => {
        if (saving || attempts.length === 0) return;
        setSaving(true);
        try {
            const avgScore = Math.round(attempts.reduce((s, a) => s + a.evaluation.metric.score, 0) / attempts.length);
            const passed = avgScore >= 70;
            const mistakes = attempts.filter((a) => a.evaluation.metric.score < 70).length;
            const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

            const tokenEl = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
            const csrf = tokenEl?.content ?? '';

            const res = await fetch(route('strokes.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    aksara_id: aksara.id,
                    mode: 'practice',
                    score: avgScore,
                    passed,
                    mistakes,
                    duration_seconds: duration,
                    metrics: attempts.map((a) => a.evaluation.metric),
                    raw_strokes: null,
                    normalized_strokes: attempts.map((a) => a.evaluation.normalizedPoints),
                }),
            });

            if (res.ok) setSaved(true);
        } catch {
            // diam, biarkan user retry
        } finally {
            setSaving(false);
        }
    };

    const playAudio = () => {
        const audioUrl = `/audio/${aksara.category}/${aksara.id}.mp3`;
        const audio = new Audio(audioUrl);
        audio.play().catch(() => {});
    };

    const avgScore = attempts.length
        ? Math.round(attempts.reduce((s, a) => s + a.evaluation.metric.score, 0) / attempts.length)
        : 0;
    const totalStrokes = referenceStrokes.length || aksara.target_stroke_count;
    const allDone = referenceStrokes.length > 0 && currentStrokeIdx >= referenceStrokes.length;

    return (
        <StudentLayout>
            <Head title={`${aksara.name} — Latihan`} />

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                    href={route('latihan.index')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke latihan
                </Link>

                <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                    {/* Info card */}
                    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{aksara.category}</p>
                        <h1 className="mt-2 font-display text-5xl font-semibold leading-none tracking-tight">{aksara.name}</h1>
                        <p className="mt-2 text-base text-muted-foreground">Latin: {aksara.latin}</p>

                        <div className="mt-8 flex items-center justify-center">
                            <div className="bali-text rounded-3xl bg-background px-8 py-6 text-[140px] leading-none text-primary">
                                {aksara.char ?? aksara.latin}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={playAudio}
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                            >
                                <Volume2 className="h-4 w-4" />
                                Putar audio
                            </button>
                            <span className="text-xs text-muted-foreground">
                                Stroke {Math.min(currentStrokeIdx + 1, totalStrokes)} / {totalStrokes}
                            </span>
                        </div>

                        {attempts.length > 0 && (
                            <div className="mt-6 rounded-xl border border-border bg-background p-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skor rata-rata</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="font-display text-4xl font-bold tracking-tight text-primary">{avgScore}</span>
                                    <span className="text-sm text-muted-foreground">/ 100</span>
                                </div>
                                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={`h-full transition-all ${avgScore >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        style={{ width: `${avgScore}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {aksara.notes && (
                            <p className="mt-6 rounded-xl border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
                                {aksara.notes}
                            </p>
                        )}
                    </section>

                    {/* Canvas */}
                    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                        <div className="mb-4 flex items-baseline justify-between">
                            <h2 className="font-display text-xl font-bold tracking-tight">Tulis di kanvas</h2>
                            <p className="text-xs text-muted-foreground">
                                {referenceStrokes.length > 0 ? `${referenceStrokes.length} stroke target` : 'No reference SVG'}
                            </p>
                        </div>

                        <div ref={containerRef} className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background">
                            <canvas ref={canvasRef} className="h-full w-full touch-none cursor-crosshair" />
                        </div>

                        {feedback && (
                            <div
                                className={`mt-4 rounded-xl border p-3 ${
                                    feedback.metric.score >= 70
                                        ? 'border-emerald-500/40 bg-emerald-500/10'
                                        : 'border-amber-500/40 bg-amber-500/10'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {feedback.metric.score >= 70 ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-amber-600" />
                                    )}
                                    <p className={`text-sm font-bold ${feedback.metric.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        Skor {feedback.metric.score} · {feedback.metric.feedbackMessage}
                                    </p>
                                </div>
                                <div className="mt-2 grid grid-cols-5 gap-1 text-[10px] text-muted-foreground">
                                    <span>Bentuk {feedback.metric.shapeScore}</span>
                                    <span>Arah {feedback.metric.directionScore}</span>
                                    <span>Posisi {feedback.metric.positionScore}</span>
                                    <span>Panjang {feedback.metric.lengthScore}</span>
                                    <span>Halus {feedback.metric.smoothnessScore}</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-destructive hover:text-destructive"
                                >
                                    <Eraser className="h-3.5 w-3.5" />
                                    Reset
                                </button>
                                {referenceStrokes.length > 0 && currentStrokeIdx < referenceStrokes.length && (
                                    <button
                                        type="button"
                                        onClick={handleNextStroke}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Stroke berikut
                                    </button>
                                )}
                            </div>

                            {attempts.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving || saved}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                    {saved ? 'Tersimpan' : saving ? 'Menyimpan...' : 'Simpan hasil'}
                                </button>
                            )}
                        </div>

                        {referenceStrokes.length === 0 && (
                            <p className="mt-4 text-xs text-muted-foreground">
                                SVG referensi belum di-upload untuk aksara ini. Stroke recognition tidak aktif — mode kanvas bebas.
                            </p>
                        )}

                        {allDone && (
                            <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center">
                                <p className="text-sm font-bold text-emerald-600">Semua stroke selesai!</p>
                                <p className="mt-1 text-xs text-muted-foreground">Skor akhir {avgScore}/100. Jangan lupa simpan.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </StudentLayout>
    );
}
