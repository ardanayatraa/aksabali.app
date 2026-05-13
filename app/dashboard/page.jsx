import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenText, Gamepad2, Puzzle, Sparkles } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { ProductionSetupNotice } from "../../components/ProductionSetupNotice";
import { getCurrentUser } from "../../lib/server/auth";
import { redirectNonStudentFromStudentArea } from "../../lib/server/access";
import { getDashboardData } from "../../lib/server/data";
import { ProductionConfigError } from "../../lib/server/env";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let user;
  let data;

  try {
    user = await getCurrentUser();
    if (!user) redirect("/login?next=/dashboard");
    redirectNonStudentFromStudentArea(user);
    data = await getDashboardData(user.id);
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      return <ProductionSetupNotice message={error.message} />;
    }
    throw error;
  }

  const stats = [
    { label: "Total latihan", value: data.stats.totalAttempts, meta: "sesi tersimpan" },
    { label: "Skor rata-rata", value: data.stats.averageScore, meta: "dari semua latihan" },
    { label: "Aksara dikuasai", value: data.stats.masteredAksara, meta: "lulus latihan" },
    { label: "Minggu ini", value: data.stats.weeklyAttempts, meta: `+${data.stats.weeklyXp} XP` }
  ];

  const firstAksara = data.catalog[0];
  const tierLabel = (data.profile.tier || "free").toLowerCase();

  return (
    <AppShell user={data.profile} subscription={data.subscription}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero: greeting + tier chip — tanpa card */}
        <section className="flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brick">
            Rahajeng semeng, {data.profile.display_name.split(" ")[0]}.
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Lanjutkan latihanmu.
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1 font-bold uppercase tracking-widest text-ink/70">
              Paket · {tierLabel}
            </span>
            <Link href="/dashboard#upgrade" className="font-bold text-brick hover:underline">
              Kelola →
            </Link>
          </div>
        </section>

        {/* Stats — 1 card panjang dengan divider, bukan 4 card terpisah */}
        <section className="mt-10 rounded-2xl border border-ink/[0.08] bg-rice">
          <div className="grid divide-ink/[0.08] sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`px-6 py-5 ${i < stats.length - 1 ? "border-b border-ink/[0.08] sm:border-b-0" : ""} ${i === 1 ? "sm:border-b sm:border-ink/[0.08] lg:border-b-0" : ""}`}
              >
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-ink/45">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold text-ink/55">{stat.meta}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main: Lanjut belajar + Promo Premium */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-ink/[0.08] bg-rice p-7">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-brick">
              Lanjut belajar
            </p>
            <div className="mt-5 flex items-start justify-between gap-5">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
                  {firstAksara?.name || "Pilih aksara"}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-ink/65">
                  Ikuti urutan goresan. Progres otomatis tersimpan.
                </p>
              </div>
              <div className="bali-text grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-lontar text-6xl text-brick">
                {firstAksara?.glyph || "?"}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link
                href={firstAksara?.id ? `/latihan/${firstAksara.id}` : "/latihan"}
                className="inline-flex items-center gap-2 rounded-full bg-brick px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-brick/90"
              >
                <BookOpenText className="h-4 w-4" />
                Mulai
              </Link>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold text-ink/80 transition hover:border-ink/40 hover:text-ink"
              >
                <Puzzle className="h-4 w-4" />
                Kuis
              </Link>
              <Link
                href="/game/lobby"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold text-ink/80 transition hover:border-ink/40 hover:text-ink"
              >
                <Gamepad2 className="h-4 w-4" />
                Game
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-brick p-7 text-primary-foreground">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary-foreground/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-primary-foreground/5 blur-2xl" />

            <div className="relative">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em]">
                <Sparkles className="h-3 w-3" />
                Promo
              </p>
              <h2 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight">
                Akses penuh, sekali bayar.
              </h2>
              <p className="mt-3 text-sm leading-6 text-primary-foreground/80">
                <span className="line-through opacity-60">Rp 250rb</span>{" "}
                <span className="font-black text-primary-foreground">Rp 49rb</span> · 32 aksara,
                statistik harian, sertifikat per level.
              </p>
              <Link
                href="/dashboard#upgrade"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-rice px-5 py-2.5 text-sm font-bold text-brick transition hover:scale-105"
              >
                Ambil Premium
              </Link>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
