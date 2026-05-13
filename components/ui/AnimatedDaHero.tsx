"use client";

import { useEffect, useMemo, useState } from "react";

const PATH_D_RE = /<path[^>]*\sd\s*=\s*"([^"]+)"/gi;
const VIEWBOX_RE = /viewBox\s*=\s*"([^"]+)"/i;
const STROKE_DURATION = 2.0; // detik per stroke
const STROKE_DELAY = 2.4; // jeda antar stroke
const HOLD = 1.4; // tahan setelah selesai sebelum reset

export function AnimatedDaHero() {
  const [raw, setRaw] = useState<string | null>(null);
  const [iteration, setIteration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/aksara/strokes/wresastra/da-1B24.svg")
      .then((r) => r.text())
      .then((text) => {
        if (!cancelled) setRaw(text);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
              animation: `aksa-draw ${STROKE_DURATION}s ease-out ${i * STROKE_DELAY}s forwards`
            }}
          />
        ))}
      </g>
    </svg>
  );
}
