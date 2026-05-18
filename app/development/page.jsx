import Link from "next/link";
import { ArrowRight, KeyRound, Settings2, ShieldCheck, TerminalSquare } from "lucide-react";
import { CP, glyph } from "../../lib/aksara-codepoints";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Development Mode · Aksa Bali",
  description:
    "Aksa Bali sedang di mode development — internal staging buat tim. Login dulu kalau punya akses."
};

const checklist = [
  "Feature flag aktif — fitur eksperimen bisa kelihatan",
  "Database staging — data sample, jangan input data penting",
  "API + UI bisa berubah tanpa notice",
  "Khusus tim internal & QA — bagikan link hati-hati"
];

export default function DevelopmentPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-x-hidden bg-lontar px-4 text-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,hsl(var(--accent)/0.20),transparent_45%),radial-gradient(circle_at_75%_75%,hsl(var(--primary)/0.10),transparent_50%)]" />

      <main className="relative z-10 mx-auto w-full max-w-xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-violet-600">
          <TerminalSquare className="h-4 w-4" />
          Development mode
        </div>

        <span className="bali-text mx-auto mt-6 grid h-16 w-16 place-items-center rounded-2xl bg-brick text-3xl font-black text-primary-foreground">
          {glyph(CP.akara)}
        </span>

        <h1 className="mt-5 font-display text-[clamp(32px,5vw,52px)] font-normal leading-tight tracking-[-0.02em]">
          Lagi <em className="italic text-brick">testing dulu.</em>
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Aksa Bali lagi di mode internal. Beberapa fitur masih di-tweak, bisa ada bug atau perubahan
          mendadak. Pengunjung umum mohon balik nanti — atau{" "}
          <Link href="/coming-soon" className="font-bold text-brick hover:underline">
            cek tanggal launch
          </Link>
          .
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-brick px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-brick/90"
          >
            <KeyRound className="h-4 w-4" />
            Login tim
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold text-ink/80 transition hover:border-ink/40 hover:text-ink"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin panel
          </Link>
        </div>

        <ul className="mx-auto mt-8 grid max-w-md gap-2 text-left">
          {checklist.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-ink/[0.08] bg-rice px-4 py-3 text-sm font-semibold leading-6 text-ink/75"
            >
              <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs font-semibold text-muted-foreground/70">
          Mode site bisa di-switch admin di <span className="font-mono text-foreground/80">/admin?section=overview</span>.
        </p>
      </main>
    </div>
  );
}
