"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Gamepad2,
  Mail,
  PenLine,
  Sparkles
} from "lucide-react";
import {
  motion,
  type MotionValue,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue
} from "framer-motion";
import { Footer } from "@/components/ui/footer";
import { cn } from "@/lib/utils";

const highlights = [
  { icon: BookOpenText, label: "Materi aksara" },
  { icon: PenLine, label: "Latihan nulis" },
  { icon: Gamepad2, label: "Game kelas" }
];

const footerMainLinks = [
  { href: "/latihan", label: "Latihan" },
  { href: "/game/lobby", label: "Game kelas" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/login", label: "Masuk" }
];

const footerLegalLinks = [
  { href: "/privacy", label: "Privasi" },
  { href: "/terms", label: "Ketentuan" }
];

const footerSocialLinks = [
  {
    icon: <Mail className="h-5 w-5" />,
    href: "mailto:hi@aksabali.app",
    label: "Email"
  }
];

export const Component = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - left);
    mouseY.set(event.clientY - top);
  };

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.45) % 40);
    gridOffsetY.set((gridOffsetY.get() + 0.45) % 40);
  });

  const maskImage = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative min-h-screen w-full overflow-x-hidden bg-background text-foreground"
      )}
    >
      <div className="absolute inset-0 z-0 opacity-[0.06]">
        <GridPattern id="grid-pattern-base" offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>
      <motion.div
        className="absolute inset-0 z-0 opacity-45"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern id="grid-pattern-active" offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(115deg,hsl(var(--background))_0%,transparent_42%,hsl(var(--primary)/0.14)_70%,hsl(var(--secondary)/0.45)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-44 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/68 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="bali-text grid h-11 w-11 place-items-center rounded-full bg-primary text-2xl text-primary-foreground shadow-line">
                ᬅ
              </span>
              <span className="leading-tight">
                <span className="block font-display text-xl font-semibold text-foreground">
                  Aksa Bali
                </span>
                <span className="block text-xs font-black uppercase tracking-[0.26em] text-primary">
                  Bali
                </span>
              </span>
            </Link>
            <nav className="hidden items-center gap-7 text-sm font-bold text-muted-foreground md:flex">
              <Link href="/latihan" className="transition hover:text-foreground">
                Latihan
              </Link>
              <Link href="/game/lobby" className="transition hover:text-foreground">
                Game
              </Link>
              <Link href="/login" className="transition hover:text-foreground">
                Masuk
              </Link>
            </nav>
          </div>
        </header>

        <section className="mx-auto grid w-full min-w-0 max-w-7xl flex-1 grid-cols-1 items-center gap-12 overflow-hidden px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="w-full min-w-0 max-w-[22rem] sm:max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-primary shadow-line backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Belajar aksara Bali
            </div>
            <h1 className="mt-7 max-w-[12ch] break-words font-display text-4xl font-semibold leading-[0.98] tracking-normal text-foreground sm:max-w-5xl sm:text-7xl sm:leading-[0.92] lg:text-8xl">
              Nulis aksara Bali jadi lebih gampang dilatih.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Latihan goresan, hafalan aksara, dan game kelas dalam satu tempat. Progresmu tersimpan, jadi bisa lanjut kapan saja.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/latihan"
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90 active:scale-[0.98]"
              >
                Mulai latihan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/game/lobby"
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-secondary px-8 py-3 font-semibold text-secondary-foreground transition hover:bg-secondary/80 active:scale-[0.98]"
              >
                Coba game kelas
              </Link>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-lg border border-border bg-background/68 p-4 shadow-line backdrop-blur">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full min-w-0 max-w-[22rem] sm:max-w-xl lg:ml-auto">
            <div className="absolute -inset-2 rounded-3xl border border-border/70 bg-background/28 backdrop-blur-sm sm:-inset-4" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background/84 p-5 shadow-soft backdrop-blur">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Latihan hari ini
                  </p>
                  <p className="mt-1 text-3xl font-black text-foreground">14 menit</p>
                </div>
                <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-black text-primary">
                  +25 XP
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-border bg-secondary/46 p-6 text-center">
                <p className="text-sm font-bold text-muted-foreground">
                  Aksara yang sedang dilatih
                </p>
                <p className="bali-text my-5 text-8xl leading-none text-primary">ᬓ</p>
                <p className="text-2xl font-black text-foreground">Wianjana “Ka”</p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  Fokus: arah goresan dan proporsi bentuk
                </p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {["ᬓ", "ᬕ", "ᬗ"].map((glyph, index) => (
                  <div key={glyph} className="rounded-lg border border-border bg-background/72 p-4 text-center">
                    <p className="bali-text text-4xl text-foreground">{glyph}</p>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                      Level {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer
          logo={
            <span className="bali-text grid h-10 w-10 place-items-center rounded-full bg-primary text-xl text-primary-foreground shadow-line">
              ᬅ
            </span>
          }
          brandName="Aksa Bali"
          socialLinks={footerSocialLinks}
          mainLinks={footerMainLinks}
          legalLinks={footerLegalLinks}
          copyright={{
            text: "© 2026 Aksa Bali",
            license: "Belajar, latihan, dan main bareng kelas."
          }}
        />
      </div>
    </main>
  );
};

type GridPatternProps = {
  id: string;
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
};

const GridPattern = ({ id, offsetX, offsetY }: GridPatternProps) => {
  return (
    <svg className="h-full w-full" aria-hidden="true">
      <defs>
        <motion.pattern
          id={id}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};
