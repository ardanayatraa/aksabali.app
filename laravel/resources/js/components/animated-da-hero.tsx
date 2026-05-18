import { useEffect, useMemo, useState } from 'react';

const PATH_D_RE = /<path[^>]*\sd\s*=\s*"([^"]+)"/gi;
const VIEWBOX_RE = /viewBox\s*=\s*"([^"]+)"/i;
const STROKE_DURATION = 3.5; // detik per stroke — lebih lambat biar smooth, ga buru-buru
const STROKE_DELAY = 4.0; // jeda antar stroke — match dgn durasi + sedikit pause
const HOLD = 2.5; // tahan setelah selesai sebelum reset — beri nafas

interface Props {
    /** Path SVG referensi. Default: aksara Da. */
    svgUrl?: string;
}

/**
 * Hero stroke animation — load SVG referensi, parse path-nya, animate
 * setiap path satu-satu (stroke-dashoffset transition). Loop terus.
 * Port dari Next.js components/ui/AnimatedDaHero.
 */
export function AnimatedDaHero({ svgUrl = '/aksara/strokes/anacaraka/da-1B24.svg' }: Props) {
    const [raw, setRaw] = useState<string | null>(null);
    const [iteration, setIteration] = useState(0);

    useEffect(() => {
        let cancelled = false;
        fetch(svgUrl)
            .then((r) => r.text())
            .then((text) => {
                if (!cancelled) setRaw(text);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [svgUrl]);

    const parsed = useMemo(() => {
        if (!raw) return null;
        const vb = raw.match(VIEWBOX_RE);
        let width = 109;
        let height = 109;
        if (vb) {
            const parts = vb[1].trim().split(/[\s,]+/).map(Number);
            if (parts.length === 4) {
                width = parts[2];
                height = parts[3];
            }
        }
        const re = new RegExp(PATH_D_RE.source, PATH_D_RE.flags);
        const paths: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = re.exec(raw)) !== null) {
            paths.push(m[1].trim());
        }
        return { width, height, paths };
    }, [raw]);

    const cycleSeconds = useMemo(() => {
        if (!parsed) return 6;
        return parsed.paths.length * STROKE_DELAY + HOLD;
    }, [parsed]);

    useEffect(() => {
        const timer = setInterval(() => setIteration((n) => n + 1), cycleSeconds * 1000);
        return () => clearInterval(timer);
    }, [cycleSeconds]);

    if (!parsed) {
        return <div className="aspect-square w-full" />;
    }

    return (
        <svg
            key={iteration}
            viewBox={`0 0 ${parsed.width} ${parsed.height}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
        >
            {/* Layer 1: placeholder full SVG, hampir transparan */}
            <g aria-hidden>
                {parsed.paths.map((d, i) => (
                    <path
                        key={`bg-${i}`}
                        d={d}
                        stroke="hsl(var(--foreground))"
                        strokeOpacity={0.08}
                        strokeWidth={5.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                ))}
            </g>

            {/* Layer 2: animasi stroke aktif per-path, looping */}
            <g>
                {parsed.paths.map((d, i) => (
                    <path
                        key={`anim-${i}-${iteration}`}
                        d={d}
                        stroke="hsl(var(--primary))"
                        strokeWidth={6.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity={0.85}
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1}
                        style={{
                            // cubic-bezier custom — kurva smooth (slow start + ease out gentle)
                            animation: `aksa-draw ${STROKE_DURATION}s cubic-bezier(0.65, 0, 0.35, 1) ${i * STROKE_DELAY}s forwards`,
                        }}
                    />
                ))}
            </g>
        </svg>
    );
}
