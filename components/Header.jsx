import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { AksaraMark } from "./AksaraMark";

const nav = [
  { href: "#belajar", label: "Belajar" },
  { href: "/game/lobby", label: "Game" },
  { href: "#sekolah", label: "Untuk Sekolah" },
  { href: "#harga", label: "Harga" },
  { href: "#tentang", label: "Tentang" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-lontar/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Aksa Bali home">
          <AksaraMark compact />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-ink/70 lg:flex">
          {nav.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-brick">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-brick px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.16)] transition hover:bg-brick/90"
          >
            <LogIn className="h-4 w-4" />
            Masuk
            <ArrowRight className="hidden h-4 w-4 sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
}
