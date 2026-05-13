import { ArrowRight, Bell, Check, Flame, Sparkles } from "lucide-react";
import { CountdownTimer } from "../../components/CountdownTimer";
import { CP, glyph } from "../../lib/aksara-codepoints";
import { getSiteSettings } from "../../lib/server/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sebentar Lagi Rilis · Aksa Bali",
  description:
    "Aksa Bali — aplikasi latihan menulis aksara Bali — sebentar lagi rilis. 100 pendaftar pertama dapat Premium Rp 25rb (sebelumnya Rp 49rb), berlaku selamanya."
};

const PROMO_SEATS = 100;
const PROMO_PRICE = 25_000;
const ORIGINAL_PRICE = 49_000;

const features = [
  "32 aksara dasar, lengkap pola goresnya",
  "Kuis acak dari semua kategori",
  "Game kelas — bagi PIN ke temen-temen",
  "Web + Android, satu akun"
];

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default async function ComingSoonPage() {
  const { launchAt } = await getSiteSettings();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-lontar text-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,hsl(var(--primary)/0.10),transparent_40%),radial-gradient(circle_at_85%_85%,hsl(var(--accent)/0.30),transparent_45%)]" />

      <header className="relative z-10 border-b border-ink/[0.08]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brick font-display text-base font-black text-primary-foreground">
              {glyph(CP.akara)}
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold tracking-tight">Aksa Bali</p>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-brick/70">
                Belajar nyurat aksara Bali
              </p>
            </div>
          </div>
          <a
            href="mailto:hi@aksabali.app"
            className="hidden text-sm font-semibold text-muted-foreground transition hover:text-brick sm:inline"
          >
            Kontak
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        {/* Hero countdown */}
        <section className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brick/30 bg-brick/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-brick">
              <Sparkles className="h-3.5 w-3.5" />
              Bentar lagi
            </p>
            <h1 className="mt-6 font-display text-[clamp(38px,6vw,72px)] font-normal leading-[1.02] tracking-[-0.025em]">
              Bentar lagi, <em className="italic text-brick">siap kamu pakai.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-7 text-muted-foreground">
              Aplikasi latihan menulis aksara Bali. Materi dasar gratis,
              Premium sekali bayar — sesuai kebutuhanmu.
            </p>

            <ul className="mt-8 grid gap-2.5">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-ink/80">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brick/10">
                    <Check className="h-3 w-3 text-brick" strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-ink/45">
                Hitung mundur
              </p>
              <div className="mt-3">
                <CountdownTimer targetIso={launchAt} />
              </div>
              <p className="mt-3 text-xs font-semibold text-ink/55">
                Targetnya jalan{" "}
                <strong className="text-ink">
                  {new Date(launchAt).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </strong>
                .
              </p>
            </div>

            {/* Promo card — marketing */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-brick bg-[#1A1A1A] p-7 text-white">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brick/30 blur-3xl" />
              <div className="relative">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-brick px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white">
                  <Flame className="h-3 w-3" />
                  {PROMO_SEATS} Pendaftar Pertama
                </p>
                <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight">
                  Rp {formatRupiah(PROMO_PRICE / 1000)}rb aja,{" "}
                  <span className="italic text-[#FCA5A5]">cuma buat yang duluan.</span>
                </h2>
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="text-sm font-semibold text-white/55 line-through decoration-2">
                    Rp {formatRupiah(ORIGINAL_PRICE / 1000)}rb
                  </span>
                  <span className="font-display text-5xl font-bold leading-none tracking-tight text-white">
                    Rp {formatRupiah(PROMO_PRICE / 1000)}rb
                  </span>
                  <span className="text-sm font-bold text-white/70">/selamanya</span>
                </div>
                <p className="mt-5 text-sm leading-6 text-white/70">
                  Bayar sekali, dipake selamanya. Cuma {PROMO_SEATS} orang pertama yang
                  daftar dapet harga ini. Habis itu balik Rp {formatRupiah(ORIGINAL_PRICE / 1000)}rb.
                </p>
                <a
                  href="#notify"
                  className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#1A1A1A] transition hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Daftar dulu yuk
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Notify section */}
        <section
          id="notify"
          className="mt-20 rounded-2xl border border-ink/[0.08] bg-rice p-7 sm:p-10"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-brick">
                <Bell className="h-3.5 w-3.5" />
                Biar nggak kelewat
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Aku kabarin pas udah jalan.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Tinggal kirim emailmu. Satu email aja — pas aplikasi siap. Bukan
                buat marketing.
              </p>
            </div>
            <a
              href="mailto:hi@aksabali.app?subject=Daftar%20minat%20Aksa%20Bali&body=Halo%2C%20kabarin%20aku%20pas%20Aksa%20Bali%20udah%20siap%20dipakai.%20Makasih%21"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brick px-6 py-3 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-brick/90"
            >
              Kabarin aku yuk
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Trust signals — short */}
        <section className="mt-16 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="font-display text-4xl font-semibold tracking-tight text-brick">32</p>
            <p className="mt-1 text-sm font-semibold text-ink/70">Aksara dasar siap dilatih</p>
          </div>
          <div>
            <p className="font-display text-4xl font-semibold tracking-tight text-brick">5</p>
            <p className="mt-1 text-sm font-semibold text-ink/70">Mode kuis lintas materi</p>
          </div>
          <div>
            <p className="font-display text-4xl font-semibold tracking-tight text-brick">∞</p>
            <p className="mt-1 text-sm font-semibold text-ink/70">Akses Premium berlaku selamanya</p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-ink/[0.08]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <p className="text-xs text-muted-foreground">
            Aksa Bali · Belajar nyurat aksara Bali · Yang resmi hanya di{" "}
            <strong className="font-semibold text-ink">aksabali.app</strong>
          </p>
          <a
            href="mailto:hi@aksabali.app"
            className="text-xs font-semibold text-brick hover:underline"
          >
            hi@aksabali.app
          </a>
        </div>
      </footer>
    </div>
  );
}
