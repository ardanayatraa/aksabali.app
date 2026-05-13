import Link from "next/link";
import { Lock } from "lucide-react";

export function PracticeCatalogGrid({ catalog = [], basePath = "/latihan" }) {
  const items = catalog.filter((item) => item.svg_url);
  if (!items.length) {
    return (
      <div className="mx-auto -mt-6 max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-ink/[0.08] bg-rice p-6 text-sm text-muted-foreground">
          Belum ada aksara siap dilatih. Coba lagi nanti ya.
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto -mt-6 max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`${basePath}/${item.id}`}
          className="group rounded-2xl border border-ink/[0.08] bg-rice p-4 text-center text-ink transition hover:border-brick/40"
        >
          <div className="bali-text mx-auto grid aspect-[3/4] w-full place-items-center rounded-xl bg-lontar text-5xl text-brick">
            {item.glyph}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="truncate text-sm font-extrabold tracking-tight">{item.name}</p>
            {item.is_premium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.06] px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-widest text-ink/55">
                <Lock className="h-2.5 w-2.5" />
                Premium
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.latin}</p>
        </Link>
      ))}
      </section>
    </div>
  );
}
