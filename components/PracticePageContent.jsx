import Link from "next/link";
import { ArrowLeft, Headphones, Info } from "lucide-react";
import { GlyphImage } from "./GlyphImage";
import { PracticeCanvas } from "./PracticeCanvas";

export function PracticePageContent({ aksara, referencePaths = [], basePath = "/latihan" }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={basePath} className="inline-flex items-center gap-2 text-sm font-bold text-ink/62 hover:text-brick">
        <ArrowLeft className="h-4 w-4" />
        Semua latihan
      </Link>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[340px_1fr_300px]">
        <aside className="min-w-0 space-y-5">
          <div className="rounded-[1.5rem] border border-ink/10 bg-rice p-6 shadow-line">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">
              {aksara?.category || "Belum ada kategori"}
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-5xl font-black">{aksara?.latin || aksara?.name || "Pilih aksara"}</h1>
                <p className="mt-2 font-semibold text-ink/58">{aksara?.name || "Mulai dari aksara dasar"}</p>
              </div>
              {aksara?.glyph && (
                <GlyphImage
                  src={aksara.image_url}
                  glyph={aksara.glyph}
                  label={aksara.latin || aksara.name}
                  className="bali-text hidden shrink-0 text-8xl leading-none text-brick sm:block"
                  imageClassName="hidden h-28 w-28 shrink-0 rounded-[1.25rem] bg-brick/10 object-contain p-3 sm:block"
                />
              )}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 text-center sm:grid-cols-4 sm:gap-3">
              {[
                ["Pola", aksara?.svg_url ? "Siap" : "-"],
                ["SVG", referencePaths.length],
                ["Goresan", aksara?.target_stroke_count || "-"],
                ["Tier", aksara?.is_premium ? "Premium" : "Free"]
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-2xl bg-lontar px-1 py-4 sm:px-3">
                  <p className="text-[0.56rem] font-black uppercase tracking-[0.04em] text-ink/45 sm:text-xs sm:tracking-[0.12em]">{label}</p>
                  <p className="mt-1 font-black">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-ink/10 bg-rice p-6 shadow-line">
            <div className="flex items-center gap-3">
              <Headphones className="h-5 w-5 text-brick" />
              <p className="font-black">Pengucapan</p>
            </div>
            <p className="mt-3 leading-7 text-ink/68">
              Dengarkan bunyi aksara dan ulangi pelan-pelan sebelum mulai menulis.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-ink/10 bg-rice p-6 shadow-line">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-brick" />
              <p className="font-black">Konteks budaya</p>
            </div>
            <p className="mt-3 leading-7 text-ink/68">
              {aksara?.notes || "Catatan budaya untuk aksara ini akan tampil di sini."}
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">
                Latihan stroke
              </p>
              <h2 className="mt-1 text-2xl font-black">Ikuti stroke aktif pada kanvas</h2>
            </div>
            <div className="inline-flex rounded-full border border-ink/10 bg-rice p-1 text-sm font-bold shadow-line">
              <span className="rounded-full bg-brick px-4 py-2 text-primary-foreground">Panduan 3x3</span>
              <span className="px-4 py-2 text-muted-foreground">Pola</span>
            </div>
          </div>
          <PracticeCanvas
            aksaraId={aksara?.id || null}
            glyph={aksara?.glyph || ""}
            label={aksara?.latin || aksara?.name || "aksara"}
            referencePaths={referencePaths}
            strokeTemplates={[]}
          />
          <p className="mt-4 rounded-2xl border border-saffron/30 bg-saffron/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-brick">
            Skor dihitung dari bentuk, arah, posisi, panjang, dan kehalusan stroke.
          </p>
        </section>

        <aside className="min-w-0 space-y-5">
          <div className="rounded-[1.5rem] border border-ink/10 bg-rice p-6 shadow-line">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">
              Detail latihan
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-ink/65">
              <p>Aksara: {aksara?.id || "belum tersedia"}</p>
              <p>Target goresan: {aksara?.target_stroke_count || "belum tersedia"}</p>
              <p>Pola: {aksara?.svg_url ? "tersedia" : "belum tersedia"}</p>
              <p>Progres latihan tersimpan otomatis saat kamu menyelesaikan stroke.</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-brick/15 bg-brick p-6 text-primary-foreground shadow-[0_18px_50px_hsl(var(--primary)/0.14)]">
            <p className="font-black">Tips latihan</p>
            <p className="mt-3 leading-7 text-primary-foreground/80">
              Ikuti garis kuning dari awal sampai akhir. Pelan dulu, baru tambah kecepatan.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
