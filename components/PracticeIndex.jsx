import Link from "next/link";
import { BookOpenText, Hash, Layers, Library, PenLine, Type } from "lucide-react";

const practiceModes = [
  {
    id: "nyurat",
    title: "Nyurat",
    badge: "Stroke",
    description: "Tulis di kanvas, sistem cek bentuknya.",
    href: "/latihan/nyurat",
    icon: PenLine
  },
  {
    id: "huruf",
    title: "Huruf",
    badge: "Anacaraka",
    description: "Hafalin bentuk dasar ha na ca ra ka.",
    href: "/latihan/huruf",
    icon: Type
  },
  {
    id: "swara",
    title: "Pangangge",
    badge: "Sandangan",
    description: "Ulu, suku, taleng, pepet, tedung — sandangan vokal yang nempel ke konsonan.",
    href: "/latihan/swara",
    icon: Library
  },
  {
    id: "angka",
    title: "Angka",
    badge: "0–9",
    description: "Angka Bali dari nol sampai sembilan.",
    href: "/latihan/angka",
    icon: Hash
  },
  {
    id: "kata",
    title: "Kata",
    badge: "Kata",
    description: "Kata Latin dan aksara Bali bersisian.",
    href: "/latihan/kata",
    icon: Layers
  },
  {
    id: "membaca",
    title: "Membaca",
    badge: "Maca",
    description: "Baca aksara dulu, cek bacaannya.",
    href: "/latihan/membaca",
    icon: BookOpenText
  }
];

export function PracticeIndex({
  catalog = [],
  showModeTiles = true,
  eyebrow = "Latihan",
  title = "Pilih mode latihan.",
  description = "Mulai dari nyurat, huruf, swara, angka, kata, sampai membaca aksara Bali."
}) {
  const withPattern = catalog.filter((item) => item.svg_url);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero flat — counter jadi chip kecil, bukan card terpisah */}
      <section>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brick">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink/[0.04] px-3 py-1 text-xs font-bold text-ink/70">
          <BookOpenText className="h-3.5 w-3.5 text-brick" />
          {withPattern.length} dari {catalog.length} aksara siap dilatih
        </div>
      </section>

      {/* Mode tiles — lebih kompak, no heavy shadow */}
      {showModeTiles && (
        <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {practiceModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.id}
                href={mode.href}
                className="group rounded-2xl border border-ink/[0.08] bg-rice p-5 text-ink transition hover:border-brick/40 hover:bg-rice"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brick/10 text-brick transition group-hover:bg-brick group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-ink/[0.04] px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-widest text-ink/55">
                    {mode.badge}
                  </span>
                </div>
                <p className="mt-5 text-lg font-extrabold tracking-tight">{mode.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{mode.description}</p>
              </Link>
            );
          })}
        </section>
      )}

    </div>
  );
}
