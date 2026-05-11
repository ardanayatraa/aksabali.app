import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function ProductionSetupNotice({ title = "Layanan sedang disiapkan" }) {
  return (
    <main className="grid min-h-screen place-items-center bg-lontar px-4 text-ink">
      <section className="max-w-2xl rounded-[1.5rem] border border-brick/20 bg-rice p-8 shadow-line">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-1 h-8 w-8 shrink-0 text-brick" />
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">
              Aksa Bali
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold">{title}</h1>
            <p className="mt-3 leading-7 text-ink/68">
              Beberapa data belum bisa dimuat. Coba lagi sebentar lagi atau kembali ke halaman utama.
            </p>
            <Link
              href="/"
              className="focus-ring mt-6 inline-flex rounded-full bg-brick px-5 py-3 font-bold text-rice"
            >
              Kembali ke landing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
