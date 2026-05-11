"use client";

import { useEffect, useState } from "react";
import { Eye, Lightbulb, RotateCcw, SkipForward } from "lucide-react";
import { useStrokeRecognizer } from "../hooks/useStrokeRecognizer";

const metricLabels = [
  ["shapeScore", "Bentuk"],
  ["directionScore", "Arah"],
  ["positionScore", "Posisi"],
  ["lengthScore", "Panjang"],
  ["smoothnessScore", "Halus"]
];

function strokeClass(status) {
  if (status === "wrong") return "wrong-stroke-fade";
  if (status === "hint") return "hint-stroke animate-draw";
  if (status === "correctAfterMiss") return "correct-stroke opacity-75";
  return "correct-stroke";
}

export function PracticeCanvas({ aksaraId, glyph = "", label = "aksara", referencePaths = [], strokeTemplates = [] }) {
  const [saveStatus, setSaveStatus] = useState("");
  const {
    currentStrokeIdx,
    userStrokes,
    feedback,
    feedbackMessage,
    mistakes,
    strokeMetrics,
    lastMetric,
    averageScore,
    svgRef,
    activeStrokeRef,
    handlers,
    reset,
    triggerHint,
    triggerShow,
    isDemoing
  } = useStrokeRecognizer({
    referencePaths,
    strokeTemplates,
    minScore: 64,
    onComplete: async (result) => {
      if (result.isDemo) return;
      setSaveStatus("Menyimpan hasil stroke...");
      try {
        const response = await fetch("/api/strokes/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aksaraId,
            mode: "practice",
            score: result.score,
            passed: result.passed,
            mistakes: result.mistakes,
            durationSeconds: result.durationSeconds,
            metrics: result.metrics,
            rawStrokes: result.rawStrokes,
            normalizedStrokes: result.normalizedStrokes
          })
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Gagal menyimpan hasil.");
        }
        setSaveStatus("Hasil stroke tersimpan.");
      } catch (error) {
        setSaveStatus(error instanceof Error ? error.message : "Hasil belum tersimpan.");
      }
    }
  });

  const isFinished = currentStrokeIdx >= referencePaths.length;
  const activeStroke = Math.min(currentStrokeIdx + 1, referencePaths.length);

  useEffect(() => {
    if (feedback !== "threeWrong") return;
    const timeout = setTimeout(() => triggerHint(), 500);
    return () => clearTimeout(timeout);
  }, [feedback, triggerHint]);

  if (!referencePaths.length) {
    return (
      <div className="rounded-[1.65rem] border border-brick/20 bg-rice p-6 shadow-line">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-brick">
          Pola stroke belum tersedia
        </p>
        <p className="mt-2 leading-7 text-ink/65">
          Pola stroke untuk aksara ini belum tersedia. Pilih aksara lain untuk mulai latihan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.65rem] border border-ink/10 bg-rice p-4 shadow-line">
      <div className="relative overflow-hidden rounded-[1.2rem] border border-ink/10 bg-white">
        <svg
          ref={svgRef}
          viewBox="0 0 109 109"
          className="block aspect-square w-full touch-none select-none bg-rice"
          style={{ touchAction: "none" }}
          aria-label={`Canvas latihan menulis ${label || aksaraId || "aksara"}`}
          {...handlers}
        >
          <rect width="109" height="109" fill="#fffaf0" />
          <g className="screen-grid-svg opacity-100">
            <line x1="36.33" y1="0" x2="36.33" y2="109" />
            <line x1="72.66" y1="0" x2="72.66" y2="109" />
            <line x1="0" y1="36.33" x2="109" y2="36.33" />
            <line x1="0" y1="72.66" x2="109" y2="72.66" />
          </g>
          <g pointerEvents="none">
            <text
              x="54.5"
              y="72"
              textAnchor="middle"
              className="bali-text fill-ink/[0.055] text-[4rem]"
            >
              {glyph}
            </text>
          </g>
          <g pointerEvents="none">
            {referencePaths.map((d, index) => {
              const shouldShow = isDemoing || isFinished || index === currentStrokeIdx;
              return shouldShow ? (
                <path
                  key={`ref-${d}`}
                  d={d}
                  stroke={index === currentStrokeIdx ? "#d89a2b" : "#241917"}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={index === currentStrokeIdx ? "0.45" : "0.12"}
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
          <div className="absolute left-3 right-3 top-3 rounded-2xl border border-ink/10 bg-rice/92 px-4 py-3 text-sm font-bold text-ink shadow-line backdrop-blur">
            {feedbackMessage}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-saffron/15 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-brick">
              Stroke {activeStroke} / {referencePaths.length}
            </span>
            <span className="rounded-full bg-[#4A7C59]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#2F5C3F]">
              Recognition aktif
            </span>
            <span className="rounded-full bg-brick/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-brick">
              Salah {mistakes}
            </span>
            <span className="rounded-full bg-ink/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
              Skor {averageScore || 0}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-ink/68">
            {isFinished
              ? "Semua stroke selesai. Skor akhir siap disimpan ke progres latihan."
              : "Ikuti stroke kuning. Sistem menilai bentuk, arah, posisi, panjang, dan kehalusan."}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center lg:grid-cols-1">
          {metricLabels.map(([key, label]) => (
            <div key={key} className="rounded-2xl bg-lontar px-2 py-2">
              <p className="text-sm font-black">{lastMetric?.[key] ?? 0}</p>
              <p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-ink/45">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
          Latihan menulis aksara
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-ink/12 px-4 py-2 text-sm font-bold"
          >
            <RotateCcw className="h-4 w-4" />
            Ulangi
          </button>
          <button
            type="button"
            onClick={triggerHint}
            disabled={isFinished || isDemoing}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-ink/12 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Lightbulb className="h-4 w-4" />
            Petunjuk
          </button>
          <button
            type="button"
            onClick={triggerShow}
            disabled={isFinished || isDemoing}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-ink/12 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Eye className="h-4 w-4" />
            Tampilkan urutan
          </button>
          <button
            type="button"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-brick px-4 py-2 text-sm font-bold text-rice"
          >
            <SkipForward className="h-4 w-4" />
            Aksara berikutnya
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="mt-4 rounded-2xl border border-ink/10 bg-lontar px-4 py-3 text-sm font-bold text-ink/65">
          {saveStatus}
        </div>
      )}
    </div>
  );
}
