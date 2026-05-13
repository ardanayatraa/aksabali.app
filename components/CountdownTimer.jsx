"use client";

import { useEffect, useState } from "react";

function getRemaining(targetIso) {
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
    expired: false
  };
}

function Cell({ value, label }) {
  return (
    <div className="rounded-2xl border border-ink/[0.08] bg-rice px-2 py-5 text-center sm:px-4 sm:py-6">
      <p className="font-display text-3xl font-semibold tracking-tight tabular-nums text-brick sm:text-5xl">
        {value}
      </p>
      <p className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.2em] text-ink/45 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

// Pre-mount placeholder. Server + first client render keduanya pakai ini supaya
// nggak ada hydration mismatch (Date.now() beda antara server dan client).
const PLACEHOLDER_CELLS = [
  { value: "--", label: "Hari" },
  { value: "--", label: "Jam" },
  { value: "--", label: "Menit" },
  { value: "--", label: "Detik" }
];

export function CountdownTimer({ targetIso }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    // Initial tick di-defer via setTimeout(0) supaya bukan setState sinkron
    // di body effect (lint: react-hooks/set-state-in-effect).
    const tick = () => setTime(getRemaining(targetIso));
    const firstId = setTimeout(tick, 0);
    const intervalId = setInterval(tick, 1000);
    return () => {
      clearTimeout(firstId);
      clearInterval(intervalId);
    };
  }, [targetIso]);

  if (!time) {
    return (
      <div className="grid grid-cols-4 gap-3" suppressHydrationWarning>
        {PLACEHOLDER_CELLS.map((c) => (
          <Cell key={c.label} value={c.value} label={c.label} />
        ))}
      </div>
    );
  }

  if (time.expired) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl border border-brick/30 bg-brick/10 px-6 py-8 text-center">
          <p className="font-display text-3xl font-semibold text-brick sm:text-4xl">
            Sudah waktunya! ✨
          </p>
          <p className="mt-2 text-sm font-semibold text-ink/70">Sebentar lagi launching.</p>
        </div>
      </div>
    );
  }

  const cells = [
    { value: String(time.days).padStart(2, "0"), label: "Hari" },
    { value: String(time.hours).padStart(2, "0"), label: "Jam" },
    { value: String(time.minutes).padStart(2, "0"), label: "Menit" },
    { value: String(time.seconds).padStart(2, "0"), label: "Detik" }
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cells.map((cell) => (
        <Cell key={cell.label} value={cell.value} label={cell.label} />
      ))}
    </div>
  );
}
