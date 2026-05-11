"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }) {
  return (
    <main className="grid min-h-screen place-items-center bg-lontar px-4 text-ink">
      <section className="max-w-lg rounded-[1.5rem] border border-ink/10 bg-rice p-8 shadow-line">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">
          Terjadi kendala
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Coba muat ulang halaman.</h1>
        <p className="mt-3 leading-7 text-ink/68">
          Jika kendala berulang, coba kembali ke halaman utama lalu masuk lagi.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-brick px-5 py-3 font-bold text-rice"
        >
          <RotateCcw className="h-4 w-4" />
          Muat ulang
        </button>
      </section>
    </main>
  );
}
