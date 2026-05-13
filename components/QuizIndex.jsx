"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, Gamepad2, Move, PenLine, Repeat2, Shuffle, Sparkles, Type } from "lucide-react";
import { anacaraka, angka, gabunganVokal, kataAksara, quizBank, swara } from "../lib/quiz-data";
import { quizModes } from "./QuizStudio";

const quizIcons = {
  nyurat: PenLine,
  kata: Repeat2,
  huruf: Type,
  match: Move,
  maca: BookOpenText,
  acak: Shuffle
};

export function QuizIndex() {
  const totalSoal = quizBank.length;
  const totalMateri = anacaraka.length + swara.length + angka.length + gabunganVokal.length + kataAksara.length;
  const otherModes = quizModes.filter((mode) => mode.id !== "acak");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero flat */}
      <section>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brick">Kuis</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Asah pemahaman.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Tebak aksara, padankan kata, sampai mode lawan kelas. Pilih satu untuk mulai.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-ink/70">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1">
            <BookOpenText className="h-3.5 w-3.5 text-brick" />
            {totalMateri} materi
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1">
            <Move className="h-3.5 w-3.5 text-brick" />
            {totalSoal} soal di bank
          </span>
        </div>
      </section>

      {/* Quiz Global hero CTA */}
      <section className="mt-8">
        <Link
          href="/quiz/acak"
          className="group relative block overflow-hidden rounded-2xl border border-brick/30 bg-brick/5 p-7 transition hover:border-brick/50 hover:bg-brick/[0.08]"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brick/15 blur-2xl" />
          <div className="relative flex flex-wrap items-center gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brick text-primary-foreground">
              <Shuffle className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 text-[0.68rem] font-black uppercase tracking-[0.18em] text-brick">
                <Sparkles className="h-3 w-3" />
                Quiz Global
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                Soal acak dari semua kategori.
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                15 soal random — anacaraka, swara, angka, gabungan vokal, dan kata aksara
                dicampur jadi satu. Bagus buat tes pemahaman menyeluruh.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brick px-5 py-2.5 text-sm font-bold text-primary-foreground transition group-hover:translate-x-0.5">
              Mulai
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </section>

      {/* Mode tiles — sisa mode spesifik */}
      <section className="mt-6">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-ink/45">
          Atau pilih mode spesifik
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {otherModes.map((mode) => {
            const Icon = quizIcons[mode.id] || BookOpenText;
            return (
              <Link
                key={mode.id}
                href={`/quiz/${mode.id}`}
                className="group rounded-2xl border border-ink/[0.08] bg-rice p-5 text-left text-ink transition hover:border-brick/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brick/10 text-brick transition group-hover:bg-brick group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-ink/[0.04] px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-widest text-ink/55">
                    {mode.badge}
                  </span>
                </div>
                <p className="mt-5 text-lg font-extrabold tracking-tight">{mode.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{mode.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
