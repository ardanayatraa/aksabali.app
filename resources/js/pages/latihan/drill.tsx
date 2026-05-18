import StudentLayout from '@/layouts/student-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Eraser, Volume2 } from 'lucide-react';
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

/**
 * Simple stroke canvas — minimal port. Stroke recognition full (svgPathSampler + strokeRecognition.js)
 * akan dipasang di iterasi berikutnya. Untuk sekarang user bisa gambar bebas + reset.
 */
function StrokeCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingRef = useRef(false);
    const [strokeCount, setStrokeCount] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#B91C1C';

        const getPoint = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
            return {
                x: point.clientX - rect.left,
                y: point.clientY - rect.top,
            };
        };

        const onStart = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            drawingRef.current = true;
            const { x, y } = getPoint(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        const onMove = (e: MouseEvent | TouchEvent) => {
            if (!drawingRef.current) return;
            e.preventDefault();
            const { x, y } = getPoint(e);
            ctx.lineTo(x, y);
            ctx.stroke();
        };

        const onEnd = () => {
            if (drawingRef.current) {
                drawingRef.current = false;
                setStrokeCount((n) => n + 1);
            }
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
    }, []);

    const handleReset = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setStrokeCount(0);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background">
                <canvas
                    ref={canvasRef}
                    className="h-full w-full touch-none cursor-crosshair"
                    style={{ background: 'transparent' }}
                />
            </div>
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{strokeCount} stroke</p>
                <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-destructive hover:text-destructive"
                >
                    <Eraser className="h-3.5 w-3.5" />
                    Reset
                </button>
            </div>
        </div>
    );
}

export default function LatihanDrill({ aksara }: Props) {
    const audioUrl = `/audio/${aksara.category}/${aksara.id}.mp3`;

    const playAudio = () => {
        const audio = new Audio(audioUrl);
        audio.play().catch(() => {
            // Diabaikan kalau file belum ada
        });
    };

    return (
        <StudentLayout>
            <Head title={`${aksara.name} — Latihan`} />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
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
                            <span className="text-xs text-muted-foreground">{aksara.target_stroke_count} stroke target</span>
                        </div>

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
                            <p className="text-xs text-muted-foreground">Stroke recognition full menyusul.</p>
                        </div>
                        <StrokeCanvas />
                        <p className="mt-4 text-xs text-muted-foreground">
                            Versi sekarang: kanvas bebas + reset. Penilaian stroke (arah, bentuk, panjang) akan dipasang di iterasi
                            berikutnya — sementara, ikuti pola dari kartu di kiri.
                        </p>
                    </section>
                </div>
            </div>
        </StudentLayout>
    );
}
