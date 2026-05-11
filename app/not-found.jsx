import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-lontar px-4 text-ink">
      <section className="max-w-lg rounded-[1.5rem] border border-ink/10 bg-rice p-8 shadow-line">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">
          Halaman tidak ditemukan
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold">404</h1>
        <p className="mt-3 leading-7 text-ink/68">
          Jalur yang dibuka tidak tersedia. Kembali ke halaman utama untuk melanjutkan belajar.
        </p>
        <Link
          href="/"
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-brick px-5 py-3 font-bold text-rice"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
      </section>
    </main>
  );
}
