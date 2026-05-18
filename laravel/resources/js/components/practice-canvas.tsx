import { useStrokeRecognizer, type StrokeResult, type UserStroke } from '@/hooks/use-stroke-recognizer';
import { Eye, Lightbulb, RotateCcw, SkipForward } from 'lucide-react';
import { useEffect, useState } from 'react';

const metricLabels: Array<[keyof StrokeMetricSubset, string]> = [
    ['shapeScore', 'Bentuk'],
    ['directionScore', 'Arah'],
    ['positionScore', 'Posisi'],
    ['lengthScore', 'Panjang'],
    ['smoothnessScore', 'Halus'],
];

type StrokeMetricSubset = {
    shapeScore: number;
    directionScore: number;
    positionScore: number;
    lengthScore: number;
    smoothnessScore: number;
};

function strokeClass(status: UserStroke['status']): string {
    if (status === 'wrong') return 'wrong-stroke-fade';
    if (status === 'hint') return 'hint-stroke animate-draw';
    if (status === 'correctAfterMiss') return 'correct-stroke opacity-75';
    return 'correct-stroke';
}

interface Props {
    aksaraId: string | null;
    glyph?: string;
    label?: string;
    referencePaths: string[];
    onNext?: () => void;
}

/**
 * SVG-based canvas dgn 5 metric scoring. Port dari Next.js PracticeCanvas.jsx.
 *
 * - viewBox 0 0 109 109 (match SVG referensi)
 * - 4 grid lines (panduan 3x3) + glyph background
 * - Layer paths: reference (current=yellow, done=dark) + userStrokes (correct/wrong/hint/correctAfterMiss)
 * - activeStroke ref → mutated tiap pointer move via setAttribute d
 * - Feedback panel (atas) + metric chips (samping) + tombol Ulangi/Petunjuk/Tampilkan urutan/Aksara berikutnya
 * - Auto-save POST /strokes/attempts saat onComplete (non-demo)
 * - 3-wrong → auto trigger hint setelah 500ms delay
 */
export function PracticeCanvas({ aksaraId, glyph = '', label = 'aksara', referencePaths, onNext }: Props) {
    const [saveStatus, setSaveStatus] = useState('');
    const {
        currentStrokeIdx,
        userStrokes,
        feedback,
        feedbackMessage,
        mistakes,
        lastMetric,
        averageScore,
        svgRef,
        activeStrokeRef,
        handlers,
        reset,
        triggerHint,
        triggerShow,
        isDemoing,
    } = useStrokeRecognizer({
        referencePaths,
        minScore: 64,
        onComplete: async (result: StrokeResult) => {
            if (result.isDemo) return;
            setSaveStatus('Menyimpan hasil stroke...');
            try {
                const tokenEl = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
                const csrf = tokenEl?.content ?? '';
                const response = await fetch('/strokes/attempts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        aksara_id: aksaraId,
                        mode: 'practice',
                        score: result.score,
                        passed: result.passed,
                        mistakes: result.mistakes,
                        duration_seconds: result.durationSeconds,
                        metrics: result.metrics,
                        raw_strokes: result.rawStrokes,
                        normalized_strokes: result.normalizedStrokes,
                    }),
                });
                if (!response.ok) {
                    setSaveStatus('Hasil belum tersimpan. Pastikan kamu masih login.');
                    return;
                }
                setSaveStatus('Hasil stroke tersimpan.');
            } catch {
                // Network error / offline — softer copy, no raw "Failed to fetch"
                setSaveStatus('Hasil belum tersimpan. Cek koneksi lalu coba lagi.');
            }
        },
    });

    const isFinished = currentStrokeIdx >= referencePaths.length;
    const activeStroke = Math.min(currentStrokeIdx + 1, referencePaths.length);

    useEffect(() => {
        if (feedback !== 'threeWrong') return;
        const timeout = setTimeout(() => triggerHint(), 500);
        return () => clearTimeout(timeout);
    }, [feedback, triggerHint]);

    if (!referencePaths.length) {
        return (
            <div className="rounded-[1.65rem] border border-primary/20 bg-card p-6 shadow-soft">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">Pola stroke belum tersedia</p>
                <p className="mt-2 leading-7 text-muted-foreground">
                    Pola stroke untuk aksara ini belum tersedia. Pilih aksara lain untuk mulai latihan.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-[1.65rem] border border-border bg-card p-4 shadow-soft">
            <div className="relative overflow-hidden rounded-[1.2rem] border border-border bg-background">
                <svg
                    ref={svgRef}
                    viewBox="0 0 109 109"
                    className="block aspect-square w-full touch-none select-none bg-background"
                    style={{ touchAction: 'none' }}
                    aria-label={`Canvas latihan menulis ${label || aksaraId || 'aksara'}`}
                    {...handlers}
                >
                    <rect width="109" height="109" fill="hsl(var(--background))" />
                    <g className="screen-grid-svg opacity-100">
                        <line x1="36.33" y1="0" x2="36.33" y2="109" />
                        <line x1="72.66" y1="0" x2="72.66" y2="109" />
                        <line x1="0" y1="36.33" x2="109" y2="36.33" />
                        <line x1="0" y1="72.66" x2="109" y2="72.66" />
                    </g>
                    <g pointerEvents="none">
                        <text x="54.5" y="72" textAnchor="middle" className="bali-text fill-foreground/[0.055] text-[4rem]">
                            {glyph}
                        </text>
                    </g>
                    <g pointerEvents="none">
                        {referencePaths.map((d, index) => {
                            // Kalau finished, jangan render referensi — userStrokes udah cover
                            // semua stroke; reference rendering bikin "numpuk" tumpuk di atas
                            // userStrokes. Selama latihan, hanya stroke aktif (yellow) +
                            // selama demo mode juga semua reference (sebagai panduan).
                            if (isFinished) return null;
                            const shouldShow = isDemoing || index === currentStrokeIdx;
                            return shouldShow ? (
                                <path
                                    key={`ref-${d}`}
                                    d={d}
                                    stroke={index === currentStrokeIdx ? '#d89a2b' : '#241917'}
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                    opacity={index === currentStrokeIdx ? 0.45 : 0.12}
                                />
                            ) : null;
                        })}
                    </g>
                    <g pointerEvents="none">
                        {userStrokes.map((stroke, index) => (
                            <path
                                key={`${stroke.d}-${index}`}
                                d={stroke.d}
                                className={strokeClass(stroke.status)}
                                pathLength="1"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        ))}
                    </g>
                    <path
                        ref={activeStrokeRef}
                        d=""
                        stroke="#15616d"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        pointerEvents="none"
                    />
                </svg>

                {feedbackMessage && (
                    <div className="absolute inset-x-3 top-3 rounded-2xl border border-border bg-card/90 px-4 py-3 text-sm font-bold text-foreground shadow-soft backdrop-blur">
                        {feedbackMessage}
                    </div>
                )}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-tertiary/15 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary">
                            Stroke {activeStroke} / {referencePaths.length}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
                            Recognition aktif
                        </span>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary">
                            Salah {mistakes}
                        </span>
                        <span className="rounded-full bg-foreground/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                            Skor {averageScore || 0}
                        </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-muted-foreground">
                        {isFinished
                            ? 'Semua stroke selesai. Skor akhir siap disimpan ke progres latihan.'
                            : 'Ikuti stroke kuning. Sistem menilai bentuk, arah, posisi, panjang, dan kehalusan.'}
                    </p>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center lg:grid-cols-1">
                    {metricLabels.map(([key, lbl]) => (
                        <div key={String(key)} className="rounded-2xl bg-background px-2 py-2">
                            <p className="text-sm font-black">{(lastMetric?.[key] as number | undefined) ?? 0}</p>
                            <p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-muted-foreground">{lbl}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Latihan menulis aksara</p>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={reset}
                        className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Ulangi
                    </button>
                    <button
                        type="button"
                        onClick={triggerHint}
                        disabled={isFinished || isDemoing}
                        className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        <Lightbulb className="h-4 w-4" />
                        Petunjuk
                    </button>
                    <button
                        type="button"
                        onClick={triggerShow}
                        disabled={isFinished || isDemoing}
                        className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        <Eye className="h-4 w-4" />
                        Tampilkan urutan
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        className="focus-ring inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                    >
                        <SkipForward className="h-4 w-4" />
                        Aksara berikutnya
                    </button>
                </div>
            </div>

            {saveStatus && (
                <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold text-muted-foreground">
                    {saveStatus}
                </div>
            )}
        </div>
    );
}
