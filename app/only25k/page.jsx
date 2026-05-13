import Link from "next/link";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { ThemeToggle } from "../../components/ThemeToggle";
import { getInitials, maskName, promoConfig, promoSlots } from "../../lib/promo-data";

export const metadata = {
  title: "Yang sudah ikut · Promo Aksa Bali",
  description:
    "Daftar pengguna awal Aksa Bali yang sudah ambil Premium di harga promo Rp 25rb."
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export default function Only25kPage() {
  const claimed = promoSlots.length;
  const total = promoConfig.total;
  const remaining = total - claimed;
  const progressPct = Math.min(100, Math.round((claimed / total) * 100));
  // Urutan: #1 paling atas, terbaru paling bawah (sesuai urutan mereka ikut).
  const ordered = [...promoSlots].sort((a, b) => a.id - b.id);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-lontar text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/[0.08] bg-lontar/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-brick"
          >
            <ArrowLeft className="h-4 w-4" />
            Aksa Bali
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle
              showLabel={false}
              className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 bg-rice/70 text-muted-foreground transition hover:border-brick/30 hover:text-brick"
            />
            <Link
              href="/login?promo=only25k&next=/dashboard"
              className="rounded-lg bg-brick px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-brick/90"
            >
              Ambil Premium
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero kecil */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-saffron">
            Yang sudah ikut
          </p>
          <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,48px)] font-normal leading-[1.1] tracking-[-0.02em]">
            {claimed} dari {total} sudah jadi Premium.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Diurutkan dari yang paling awal ikut. Nama akhir disamarkan demi privasi.
            Masih ada {remaining} tempat di harga promo.
          </p>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-ink/[0.06]">
            <div
              className="h-full rounded-full bg-brick transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </section>

        {/* List vertical */}
        <section className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-ink/[0.08] bg-rice">
          <ol className="divide-y divide-ink/[0.06]">
            {ordered.map((slot, index) => (
              <li key={slot.id} className="flex items-center gap-4 px-5 py-4">
                <span className="w-8 shrink-0 text-right font-display text-base font-semibold text-ink/45">
                  {index + 1}
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brick/10 text-sm font-black text-brick">
                  {getInitials(slot.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{maskName(slot.name)}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {slot.city} · {formatDate(slot.claimedAt)}
                  </p>
                </div>
                <BadgeCheck className="h-5 w-5 shrink-0 text-brick" />
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-ink/[0.08] px-4 py-8 sm:px-6">
        <p className="mx-auto max-w-[1180px] text-center text-xs text-muted-foreground">
          Promo terbatas 200 pengguna pertama · Aksa Bali —{" "}
          <Link href="/" className="font-semibold text-brick hover:underline">
            kembali ke beranda
          </Link>
        </p>
      </footer>
    </div>
  );
}
