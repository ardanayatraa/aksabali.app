"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, RotateCcw } from "lucide-react";

export function PracticeDrill({ title, eyebrow, description, items = [], revealMode = "latin" }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const active = safeItems[index] || safeItems[0];

  function next() {
    setIndex((value) => (value + 1) % Math.max(1, safeItems.length));
    setRevealed(false);
  }

  function reset() {
    setIndex(0);
    setRevealed(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/latihan" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground/70 hover:text-brick">
        <ArrowLeft className="h-4 w-4" />
        Semua latihan
      </Link>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">{eyebrow}</p>
          <h1 className="mt-2 font-display text-5xl font-semibold leading-tight">{title}</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-rice/75 p-5 shadow-[0_12px_34px_hsl(var(--foreground)/0.06)]">
          <p className="text-2xl font-black">{safeItems.length}</p>
          <p className="text-sm font-bold text-muted-foreground/65">kartu latihan</p>
        </div>
      </section>

      {active && (
        <section className="mt-8 rounded-[28px] border border-ink/10 bg-rice/80 p-5 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)] backdrop-blur sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="grid min-h-[320px] place-items-center rounded-[24px] bg-lontar p-6 text-center screen-grid">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                  {active.group || eyebrow}
                </p>
                <p className="bali-text mt-5 text-[clamp(5rem,15vw,10rem)] leading-none text-brick">
                  {active.glyph}
                </p>
                <p className={`mt-5 text-3xl font-black text-ink ${revealed ? "" : "opacity-0"}`}>
                  {active.latin}
                </p>
              </div>
            </div>

            <aside className="space-y-3">
              <div className="rounded-2xl bg-lontar p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/55">Kartu</p>
                <p className="mt-1 text-2xl font-black">
                  {index + 1}/{safeItems.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRevealed((value) => !value)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brick px-4 text-sm font-black text-primary-foreground"
              >
                <Eye className="h-4 w-4" />
                {revealed ? "Sembunyikan bacaan" : revealMode === "glyph" ? "Lihat aksara" : "Lihat bacaan"}
              </button>
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-ink/10 bg-rice px-4 text-sm font-black text-muted-foreground"
              >
                Kartu berikutnya
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-ink/10 bg-rice px-4 text-sm font-black text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                Mulai ulang
              </button>
            </aside>
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {safeItems.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setIndex(itemIndex);
              setRevealed(false);
            }}
            className={`rounded-[22px] border p-4 text-left transition hover:-translate-y-0.5 ${
              itemIndex === index
                ? "border-brick bg-brick text-primary-foreground"
                : "border-ink/10 bg-rice/80 text-ink hover:border-brick/35"
            }`}
          >
            <span className="bali-text block text-5xl leading-none">{item.glyph}</span>
            <span className="mt-3 block text-lg font-black">{item.latin}</span>
            <span className={`mt-1 block text-xs font-bold ${itemIndex === index ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
              {item.group}
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}
