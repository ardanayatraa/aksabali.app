import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
    svgUrl: string | null;
    glyph?: string | null;
    /** Sisi SVG container dalam px. Default 200. */
    size?: number;
    /** ms per stroke. Default 1800 (match latihan canvas). 3500 untuk pelan banget. */
    durationMs?: number;
    /** Auto play once setelah SVG ke-load. Default true. */
    autoPlay?: boolean;
}

const PAUSE_BETWEEN_MS = 280;

function extractPaths(svgText: string): string[] {
    const out: string[] = [];
    const re = /<path[^>]*\sd="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(svgText))) {
        if (m[1]) out.push(m[1]);
    }
    return out;
}

/**
 * Preview goresan aksara — peragakan stroke order pelan-pelan.
 *
 * Fetch SVG → parse path d="" → animate satu-satu pakai @keyframes draw-stroke.
 * Stroke aktif berwarna kuning saat lagi ditarik, kemudian fade ke gelap setelah selesai.
 * Dipakai di admin/aksara untuk verifikasi urutan goresan tanpa harus latihan.
 */
export function AksaraStrokePreview({ svgUrl, glyph, size = 200, durationMs = 1800, autoPlay = true }: Props) {
    const [paths, setPaths] = useState<string[]>([]);
    const [drawnCount, setDrawnCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const timersRef = useRef<number[]>([]);

    const clearTimers = useCallback(() => {
        timersRef.current.forEach((id) => window.clearTimeout(id));
        timersRef.current = [];
    }, []);

    const play = useCallback(() => {
        if (!paths.length) return;
        clearTimers();
        setDrawnCount(0);
        setIsPlaying(true);
        let delay = 80;
        paths.forEach((_, idx) => {
            timersRef.current.push(
                window.setTimeout(() => setDrawnCount(idx + 1), delay + durationMs),
            );
            delay += durationMs + PAUSE_BETWEEN_MS;
        });
        timersRef.current.push(window.setTimeout(() => setIsPlaying(false), delay));
    }, [paths, durationMs, clearTimers]);

    // Load SVG → parse paths
    useEffect(() => {
        let cancelled = false;
        clearTimers();
        setPaths([]);
        setDrawnCount(0);
        setIsPlaying(false);
        setLoadError(false);
        if (!svgUrl) return;
        fetch(svgUrl, { credentials: 'same-origin' })
            .then((res) => (res.ok ? res.text() : Promise.reject(new Error('not ok'))))
            .then((text) => {
                if (cancelled) return;
                const ds = extractPaths(text);
                if (!ds.length) {
                    setLoadError(true);
                    return;
                }
                setPaths(ds);
            })
            .catch(() => {
                if (!cancelled) setLoadError(true);
            });
        return () => {
            cancelled = true;
            clearTimers();
        };
    }, [svgUrl, clearTimers]);

    // Auto play sekali setelah paths siap
    useEffect(() => {
        if (!autoPlay || !paths.length) return;
        const t = window.setTimeout(() => play(), 200);
        return () => window.clearTimeout(t);
    }, [autoPlay, paths, play]);

    if (!svgUrl) {
        return (
            <div
                className="grid place-items-center rounded-2xl border border-dashed border-border bg-background text-xs text-muted-foreground"
                style={{ width: size, height: size }}
            >
                Belum ada SVG
            </div>
        );
    }

    if (loadError) {
        return (
            <div
                className="grid place-items-center rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 px-3 text-center text-xs text-destructive"
                style={{ width: size, height: size }}
            >
                SVG gagal dimuat
            </div>
        );
    }

    return (
        <div className="inline-flex flex-col gap-2" style={{ width: size }}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background">
                <svg viewBox="0 0 109 109" className="block aspect-square w-full">
                    <rect width="109" height="109" fill="hsl(var(--background))" />
                    <g className="screen-grid-svg opacity-60">
                        <line x1="36.33" y1="0" x2="36.33" y2="109" />
                        <line x1="72.66" y1="0" x2="72.66" y2="109" />
                        <line x1="0" y1="36.33" x2="109" y2="36.33" />
                        <line x1="0" y1="72.66" x2="109" y2="72.66" />
                    </g>
                    {glyph && (
                        <g pointerEvents="none">
                            <text x="54.5" y="72" textAnchor="middle" className="bali-text fill-foreground/[0.055] text-[4rem]">
                                {glyph}
                            </text>
                        </g>
                    )}
                    {paths.map((d, idx) => {
                        const drawn = idx < drawnCount;
                        const drawing = idx === drawnCount && isPlaying;
                        // Pakai foreground untuk drawn (theme-aware: dark di light mode, light di dark mode)
                        // dan amber (#d89a2b) untuk stroke yg lagi aktif ditarik.
                        const strokeColor = drawing ? '#d89a2b' : 'hsl(var(--foreground))';
                        return (
                            <path
                                key={`${d}-${idx}`}
                                d={d}
                                stroke={strokeColor}
                                strokeWidth={5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                opacity={drawn ? 0.85 : drawing ? 1 : 0.12}
                                className={drawing ? 'animate-draw' : ''}
                                pathLength={drawing ? 1 : undefined}
                                style={drawing ? { animationDuration: `${durationMs}ms` } : undefined}
                            />
                        );
                    })}
                </svg>
            </div>

            {paths.length > 0 && (
                <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">
                        {isPlaying
                            ? `Stroke ${Math.min(drawnCount + 1, paths.length)} / ${paths.length}`
                            : `${paths.length} stroke`}
                    </span>
                    <button
                        type="button"
                        onClick={play}
                        disabled={isPlaying}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-bold text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Putar lagi
                    </button>
                </div>
            )}
        </div>
    );
}
