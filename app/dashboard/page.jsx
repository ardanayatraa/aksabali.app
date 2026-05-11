import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenText, Gamepad2, LockKeyhole, Puzzle, Trophy, Zap } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { GlyphImage } from "../../components/GlyphImage";
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
    { label: "Percobaan stroke", value: data.stats.totalAttempts, meta: "progres tersimpan" },
    { label: "Rata-rata skor", value: data.stats.averageScore, meta: "dari latihan menulis" },
    { label: "Aksara dikuasai", value: data.stats.masteredAksara, meta: "berdasarkan latihan lulus" },
    { label: "Latihan minggu ini", value: data.stats.weeklyAttempts, meta: `${data.stats.weeklyXp} XP` }
  ];

  return (
    <AppShell user={data.profile} subscription={data.subscription}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">
              Rahajeng semeng, {data.profile.display_name}.
            </p>
            <h1 className="mt-2 font-display text-5xl font-semibold leading-tight">
              Dashboard latihan.
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-ink/66">
              Pantau progres nyurat, lanjutkan aksara terakhir, dan masuk game
              kelas dari PIN guru.
            </p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-rice p-5 shadow-line" id="voucher">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-brick">
                  Paket belajar
                </p>
                <p className="mt-2 text-2xl font-bold">{data.profile.tier}</p>
                <p className="mt-1 text-sm text-ink/58">
                  Kelola paket belajar dan akses premium akunmu.
                </p>
              </div>
              <LockKeyhole className="h-9 w-9 text-moss" />
            </div>
            <form action="/api/payments/create" method="post" className="mt-4">
              <Link
                href="/dashboard#upgrade"
                className="focus-ring inline-flex w-full justify-center rounded-full bg-brick px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                Kelola upgrade
              </Link>
            </form>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-ink/10 bg-rice p-5 shadow-line">
              <p className="text-xs font-black uppercase tracking-[0.17em] text-ink/50">
                {stat.label}
              </p>
              <p className="mt-3 text-4xl font-black">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-moss">{stat.meta}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_390px]">
          <div className="rounded-[1.5rem] border border-ink/10 bg-rice p-6 shadow-line">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">
                  Lanjutkan belajar
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  {data.catalog[0]?.name || "Pilih aksara pertama"}
                </h2>
                <p className="mt-2 max-w-xl leading-7 text-ink/65">
                  Mulai dari aksara dasar, ikuti pola goresannya, lalu simpan progres latihanmu.
                </p>
              </div>
              <div className="bali-text grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-lontar text-7xl text-brick screen-grid">
                {data.catalog[0]?.glyph || "?"}
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link href={data.catalog[0]?.id ? `/latihan/${data.catalog[0].id}` : "/latihan"} className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-brick px-4 py-3 font-bold text-rice">
                <BookOpenText className="h-4 w-4" />
                Lanjut latihan
              </Link>
              <Link href="/game/lobby" className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-3 font-bold text-ink">
                <Gamepad2 className="h-4 w-4" />
                Gabung Game
              </Link>
              <Link href="/quiz" className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-3 font-bold text-ink">
                <Puzzle className="h-4 w-4" />
                Kuis
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-brick/15 bg-brick p-6 text-primary-foreground shadow-[0_18px_50px_hsl(var(--primary)/0.14)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-primary-foreground">
                  Tantangan harian
                </p>
                <h2 className="mt-2 text-2xl font-black">Siap latihan bareng?</h2>
              </div>
              <Zap className="h-10 w-10 text-primary-foreground" />
            </div>
            <p className="mt-5 text-lg font-semibold leading-8">
              Tantangan baru terbuka setelah kamu memilih sesi latihan atau masuk room dari guru.
            </p>
            <Link href="/game/lobby" className="mt-6 inline-flex items-center gap-2 rounded-full bg-rice px-5 py-3 font-bold text-brick">
              Buka game
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="rounded-[1.5rem] border border-ink/10 bg-rice p-6 shadow-line">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Aktivitas terakhir</h2>
            </div>
            <div className="mt-5 space-y-4">
              {data.recentAttempts.length ? (
                data.recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brick" />
                    <div>
                      <p className="font-bold">
                        {attempt.aksara_name || attempt.aksara_id || "Stroke attempt"}
                      </p>
                      <p className="text-sm text-ink/55">
                        Skor {attempt.score} - {attempt.passed ? "lulus" : "belum lulus"} -{" "}
                        {new Date(attempt.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-ink/60">
                  Belum ada aktivitas. Latihan stroke pertama akan muncul di sini setelah tersimpan.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-ink/10 bg-rice p-6 shadow-line" id="library">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Library aksara</h2>
                <p className="mt-1 text-ink/60">
                  Pilih aksara, pelajari bentuknya, lalu lanjutkan ke latihan goresan.
                </p>
              </div>
              <Trophy className="h-8 w-8 text-brick" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.catalog.length ? (
                data.catalog.map((unit) => (
                  <Link key={unit.id} href={`/latihan/${unit.id}`} className="rounded-2xl border border-ink/10 bg-lontar p-4 transition hover:-translate-y-0.5 hover:border-brick/35">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/45">
                          {unit.category}
                        </p>
                        <h3 className="mt-2 text-xl font-black">{unit.latin || unit.name}</h3>
                      </div>
                      <GlyphImage
                        src={unit.image_url}
                        glyph={unit.glyph}
                        label={unit.latin || unit.name}
                        className="bali-text text-4xl text-brick"
                        imageClassName="h-14 w-14 rounded-2xl bg-brick/10 object-contain p-2"
                      />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-ink/62">{unit.notes || "Belum ada catatan."}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
                      <span>{unit.svg_url ? "Pola siap" : "Pola menyusul"}</span>
                      <span>{unit.target_stroke_count || "-"} goresan</span>
                      <span className={unit.is_premium ? "text-brick" : "text-moss"}>
                        {unit.is_premium ? "Premium" : "Free"}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-ink/60">
                  Library aksara sedang dimuat. Coba refresh halaman sebentar lagi.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
