import Link from "next/link";
import { BookOpenText, Hash, Layers, Library, PenLine, Type } from "lucide-react";
import { GlyphImage } from "./GlyphImage";

const practiceModes = [
  {
    id: "nyurat",
    title: "Latihan Nyurat",
    badge: "Stroke",
    description: "Pilih aksara lalu tulis di kanvas dengan stroke recognition.",
    href: "/latihan/nyurat",
    icon: PenLine
  },
  {
    id: "huruf",
    title: "Latihan Huruf",
    badge: "Anacaraka",
    description: "Hafalkan bentuk dasar ha na ca ra ka dan seterusnya.",
    href: "/latihan/huruf",
    icon: Type
  },
  {
    id: "swara",
    title: "Latihan Swara",
    badge: "AIUEO",
    description: "Latih aksara suara a, i, u, e, dan o.",
    href: "/latihan/swara",
    icon: Library
  },
  {
    id: "angka",
    title: "Latihan Angka",
    badge: "0-9",
    description: "Kenali angka Bali dari nol sampai sembilan.",
    href: "/latihan/angka",
    icon: Hash
  },
  {
    id: "kata",
    title: "Latihan Kata",
    badge: "Kata",
    description: "Lihat kata Latin dan aksara Balinya secara berdampingan.",
    href: "/latihan/kata",
    icon: Layers
  },
  {
    id: "membaca",
    title: "Latihan Membaca",
    badge: "Maca",
    description: "Baca aksara dulu, lalu cek bacaan Latinnya.",
    href: "/latihan/membaca",
    icon: BookOpenText
  }
];

export function PracticeIndex({
  catalog = [],
  basePath = "/latihan",
  showModeTiles = true,
  eyebrow = "Latihan",
  title = "Pilih mode latihan.",
  description = "Mulai dari nyurat, huruf, swara, angka, kata, sampai membaca aksara Bali."
}) {
  const withPattern = catalog.filter((item) => item.svg_url);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">{eyebrow}</p>
          <h1 className="mt-2 font-display text-5xl font-semibold leading-tight">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-rice/75 p-5 shadow-[0_12px_34px_hsl(var(--foreground)/0.06)]">
          <div className="flex items-center gap-3">
            <BookOpenText className="h-8 w-8 text-brick" />
            <div>
              <p className="text-2xl font-black">{withPattern.length}/{catalog.length}</p>
              <p className="text-sm font-bold text-muted-foreground/65">materi punya pola stroke</p>
            </div>
          </div>
        </div>
      </section>

      {showModeTiles && (
        <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {practiceModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.id}
                href={mode.href}
                className="group min-h-56 rounded-[24px] border border-ink/10 bg-rice/80 p-5 text-ink shadow-[0_14px_34px_hsl(var(--foreground)/0.05)] transition hover:-translate-y-0.5 hover:border-brick/35"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-lontar px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-brick">
                    {mode.badge}
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brick/10 text-brick transition group-hover:bg-brick group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <span className="mt-7 block text-2xl font-black">{mode.title}</span>
                <span className="mt-3 block text-sm leading-6 text-muted-foreground">{mode.description}</span>
              </Link>
            );
          })}
        </section>
      )}

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brick">Materi nyurat</p>
            <h2 className="mt-1 text-3xl font-black">Pilih aksara untuk kanvas.</h2>
          </div>
          <Link href="/latihan/nyurat" className="text-sm font-black text-brick hover:text-ink">
            Buka Latihan Nyurat
          </Link>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {catalog.map((unit) => (
          <Link
            key={unit.id}
            href={`${basePath}/${unit.id}`}
            className="group min-h-60 rounded-[24px] border border-ink/10 bg-rice/80 p-5 text-ink shadow-[0_14px_34px_hsl(var(--foreground)/0.05)] transition hover:-translate-y-0.5 hover:border-brick/35"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/55">{unit.category}</p>
                <h2 className="mt-2 text-xl font-black">{unit.latin || unit.name}</h2>
              </div>
              <GlyphImage
                src={unit.image_url}
                glyph={unit.glyph}
                label={unit.latin || unit.name}
                className="bali-text grid h-16 w-16 place-items-center rounded-2xl bg-brick/10 text-5xl leading-none text-brick transition group-hover:bg-brick group-hover:text-primary-foreground"
                imageClassName="h-16 w-16 rounded-2xl bg-brick/10 object-contain p-2 transition group-hover:bg-brick/15"
              />
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground/70">{unit.notes || unit.name}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm font-black">
              <span className="inline-flex items-center gap-2">
                <PenLine className="h-4 w-4 text-brick" />
                {unit.svg_url ? "Bisa latihan" : "Pola belum ada"}
              </span>
              <span className="text-brick">
                {Number(unit.target_stroke_count || 0) || "-"} goresan
              </span>
              <span className={unit.is_premium ? "text-brick" : "text-[#4A7C59]"}>
                {unit.is_premium ? "Premium" : "Free"}
              </span>
            </div>
          </Link>
        ))}
      </section>

      {!catalog.length && (
        <div className="mt-8 rounded-[22px] border border-ink/10 bg-rice/80 p-6 text-muted-foreground">
          Materi latihan belum ada. Tambahkan konten lewat halaman admin.
        </div>
      )}
    </div>
  );
}
