import Link from "next/link";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sedang Diperbaiki · Aksa Bali",
  description: "Aksa Bali sedang dalam perbaikan singkat. Mohon ditunggu sebentar."
};

export default function MaintenancePage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-x-hidden bg-lontar px-4 text-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.08),transparent_45%),radial-gradient(circle_at_70%_70%,hsl(var(--accent)/0.20),transparent_50%)]" />

      <main className="relative z-10 mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brick text-primary-foreground">
          <Wrench className="h-8 w-8" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-brick">
          Bentar ya
        </p>
        <h1 className="mt-3 font-display text-[clamp(32px,5vw,52px)] font-normal leading-tight tracking-[-0.02em]">
          Lagi <em className="italic text-brick">dirapikan dikit.</em>
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          Ada yang lagi dibenahi. Bentar lagi balik kok.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/15 bg-rice px-5 py-2.5 text-sm font-bold text-ink transition hover:border-brick hover:text-brick"
          >
            Coba lagi
          </Link>
          <a
            href="mailto:hi@aksabali.app"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brick px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-brick/90"
          >
            Ada masalah?
          </a>
        </div>
      </main>
    </div>
  );
}
