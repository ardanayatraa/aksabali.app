"use client";

import Link from "next/link";
import { BookOpenText, Gamepad2, Move, PenLine, Repeat2, Type } from "lucide-react";
import { anacaraka, angka, gabunganVokal, kataAksara, quizBank, swara } from "../lib/quiz-data";
import { quizModes } from "./QuizStudio";

const quizIcons = {
  nyurat: PenLine,
  kata: Repeat2,
  huruf: Type,
  match: Move,
  maca: BookOpenText,
  kahoot: Gamepad2
};

export function QuizIndex() {
  const stats = [
    ["Anacaraka", anacaraka.length],
    ["AIUEO", swara.length],
    ["Angka", angka.length],
    ["Gabungan", gabunganVokal.length],
    ["Kata", kataAksara.length],
    ["Bank soal", quizBank.length]
  ];

  return (
    <div className="mx-auto w-full max-w-[1180px] overflow-hidden px-4 py-8 sm:px-6 lg:py-10">
      <section className="grid min-w-0 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brick">Pilih kuis</p>
          <h1 className="mt-3 max-w-[342px] break-words font-display text-[clamp(38px,9vw,64px)] font-semibold leading-[0.95] tracking-[-0.025em] sm:max-w-none">
            Semua kuis.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Pilih tile untuk masuk ke halaman mode kuis. Setiap mode punya route dan tampilan sendiri.
          </p>
        </div>
        <div className="grid w-full max-w-[342px] grid-cols-2 gap-3 rounded-[28px] border border-ink/10 bg-rice/75 p-4 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)] backdrop-blur sm:max-w-none sm:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-lontar p-4">
              <p className="text-2xl font-black text-brick">{value}</p>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/60">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid max-w-[342px] gap-3 sm:max-w-none sm:grid-cols-2 xl:grid-cols-3">
        {quizModes.map((mode) => {
          const Icon = quizIcons[mode.id] || BookOpenText;
          return (
            <Link
              key={mode.id}
              href={`/quiz/${mode.id}`}
              className="group min-h-56 rounded-[24px] border border-ink/10 bg-rice/80 p-5 text-left text-ink shadow-[0_14px_34px_hsl(var(--foreground)/0.05)] transition hover:-translate-y-0.5 hover:border-brick/35"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full bg-lontar px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-brick">
                  {mode.badge}
                </span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brick/10 text-brick transition group-hover:bg-brick group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <span className="mt-7 block text-2xl font-black">{mode.title}</span>
              <span className="mt-3 block text-sm leading-6 text-muted-foreground">{mode.description}</span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
