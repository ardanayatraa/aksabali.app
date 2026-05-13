import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AksaraMark } from "./AksaraMark";
import { AnimatedGridBackground } from "./ui/animated-grid-background";

export function AuthShell({ eyebrow, title, subtitle, children, switchText, switchHref, switchLabel }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-lontar text-ink">
      <AnimatedGridBackground className="fixed z-0 opacity-80" gridSize={44} />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_82%_12%,hsl(var(--primary)/0.10),transparent_34%),radial-gradient(circle_at_18%_88%,hsl(var(--tertiary)/0.12),transparent_38%),linear-gradient(180deg,hsl(var(--background)/0.72),hsl(var(--background)/0.94))]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <section className="w-[calc(100vw-32px)] min-w-0 max-w-[342px] overflow-hidden rounded-[28px] border border-ink/10 bg-rice/80 p-5 shadow-[0_24px_70px_hsl(var(--foreground)/0.10)] backdrop-blur-xl sm:w-full sm:p-8 lg:max-w-[460px]">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <AksaraMark />
            </div>
            <Link
              href="/"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full border border-ink/10 bg-lontar/80 text-sm font-bold text-muted-foreground transition hover:border-brick hover:text-brick sm:w-auto sm:px-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </Link>
          </div>

          <div className="mt-10">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brick">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-[clamp(42px,11vw,56px)] font-semibold leading-[0.95] tracking-[-0.025em] text-ink">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          {switchText && switchHref && switchLabel ? (
            <p className="mt-6 text-sm text-muted-foreground">
              {switchText}{" "}
              <Link href={switchHref} className="font-black text-brick hover:text-ink">
                {switchLabel}
              </Link>
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
