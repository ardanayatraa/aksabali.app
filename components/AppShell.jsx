"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Award,
  BarChart3,
  BookOpenText,
  ChevronDown,
  CreditCard,
  Gamepad2,
  GraduationCap,
  Home,
  LogOut,
  Puzzle,
  Sparkles,
  UserRound,
  UsersRound
} from "lucide-react";
import { AksaraMark } from "./AksaraMark";
import { AnimatedGridBackground } from "./ui/animated-grid-background";
import { ThemeToggle } from "./ThemeToggle";
import { SiteModeSwitcher } from "./admin/SiteModeSwitcher";

const nav = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/latihan", label: "Latihan", icon: BookOpenText },
  { href: "/quiz", label: "Kuis", icon: Puzzle },
  { href: "/game/lobby", label: "Gabung Game", icon: Gamepad2 }
];

const adminNav = [
  { href: "/admin", label: "Ringkasan", icon: BarChart3, section: "overview" },
  { href: "/admin?section=content", label: "Konten Aksara", icon: BookOpenText, section: "content" },
  { href: "/admin?section=quiz", label: "Bank Kuis", icon: Puzzle, section: "quiz" },
  { href: "/admin?section=users", label: "Pengguna", icon: UsersRound, section: "users" },
  { href: "/admin?section=activity", label: "Aktivitas", icon: Activity, section: "activity" },
  { href: "/admin?section=game", label: "Game", icon: Gamepad2, section: "game" },
  { href: "/admin?section=payments", label: "Pembayaran", icon: CreditCard, section: "payments" }
];

const teacherNav = [
  { href: "/guru", label: "Ruang Guru", icon: GraduationCap },
  { href: "/game/host", label: "Host Game", icon: Gamepad2 }
];

function initials(name, email) {
  const source = name || email || "AB";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppShell({ children, user, subscription }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const tier = user?.tier || "free";
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "pengajar";
  const navItems = isAdmin ? adminNav : isTeacher ? teacherNav : nav;
  const homeHref = isAdmin ? "/admin" : isTeacher ? "/guru" : "/dashboard";
  const statusLabel = isAdmin ? "Admin" : isTeacher ? "Guru" : subscription?.status === "active" ? "Premium aktif" : tier;
  const roleLabel = isAdmin ? "Admin" : isTeacher ? "Guru" : "Siswa";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setProfileOpen(false);
    router.push("/login");
    router.refresh();
  }

  function isActive(item) {
    if (isAdmin && item.section) {
      return pathname === "/admin" && (searchParams.get("section") || "overview") === item.section;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <div className={`relative min-h-screen w-full max-w-full overflow-x-hidden text-ink ${isAdmin ? "bg-muted" : "bg-background"}`}>
      {!isAdmin && <AnimatedGridBackground className="fixed z-0 opacity-75" gridSize={44} />}
      {!isAdmin && (
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_86%_10%,hsl(var(--primary)/0.08),transparent_30%),radial-gradient(circle_at_14%_90%,hsl(var(--tertiary)/0.10),transparent_34%),linear-gradient(180deg,hsl(var(--background)/0.78),hsl(var(--background)/0.94))]" />
      )}

      {isAdmin && (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-ink/10 bg-rice px-4 py-5 shadow-[10px_0_32px_hsl(var(--foreground)/0.04)] lg:flex">
          <Link href="/admin" aria-label="Aksa Bali admin" className="px-1">
            <AksaraMark compact />
          </Link>

          <div className="mt-6">
            <SiteModeSwitcher />
          </div>

          <nav className="mt-5 grid gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex min-h-10 items-center gap-3 rounded px-3 text-sm font-bold transition ${
                    active
                      ? "bg-brick text-primary-foreground shadow-[0_10px_22px_hsl(var(--primary)/0.12)]"
                      : "text-muted-foreground hover:bg-muted hover:text-brick"
                  }`}
                >
                  <span className={`grid h-7 w-7 place-items-center rounded ${active ? "bg-primary-foreground/15" : "bg-brick/10 text-brick"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded border border-ink/10 bg-muted p-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-brick text-sm font-black text-primary-foreground">
                {initials(user?.display_name, user?.email)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{user?.display_name || "Admin"}</p>
                <p className="truncate text-xs font-semibold text-muted-foreground/60">{user?.email}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/profile"
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded border border-ink/10 bg-rice px-3 text-xs font-black text-muted-foreground transition hover:border-brick/30 hover:text-brick"
              >
                <UserRound className="h-4 w-4" />
                Profil
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded bg-brick/10 px-3 text-xs font-black text-brick transition hover:bg-brick hover:text-primary-foreground"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        </aside>
      )}

      <header className={`sticky top-0 z-40 w-full max-w-full border-b border-ink/[0.06] bg-background/88 backdrop-blur-xl ${isAdmin ? "lg:hidden" : ""}`}>
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={homeHref} aria-label="Aksa Bali dashboard">
            <AksaraMark compact />
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-brick text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.16)]"
                      : "text-muted-foreground hover:bg-rice/70 hover:text-brick"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-ink/10 bg-rice/80 p-1 pr-2 text-left transition hover:border-brick/25"
              aria-expanded={profileOpen}
              aria-label="Menu profil"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brick text-sm font-black text-primary-foreground">
                {initials(user?.display_name, user?.email)}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 z-50 w-[min(280px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-ink/10 bg-rice shadow-[0_22px_60px_hsl(var(--foreground)/0.16)]">
                <div className="border-b border-ink/10 bg-background px-4 py-4">
                  <p className="truncate text-sm font-black text-ink">
                    {user?.display_name || "Aksa Bali"}
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold text-muted-foreground/65">{user?.email}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex rounded-full bg-brick/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-brick">
                      {roleLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.04] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-muted-foreground/70">
                      <Sparkles className="h-3 w-3 text-brick" />
                      {statusLabel}
                    </span>
                  </div>
                </div>
                <div className="grid p-2">
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="inline-flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-muted-foreground transition hover:bg-background hover:text-brick"
                  >
                    <UserRound className="h-4 w-4" />
                    Profil saya
                  </Link>
                  {!isAdmin && (
                    <Link
                      href="/game/podium"
                      onClick={() => setProfileOpen(false)}
                      className="inline-flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-muted-foreground transition hover:bg-background hover:text-brick"
                    >
                      <Award className="h-4 w-4" />
                      Podium
                    </Link>
                  )}
                  <ThemeToggle className="inline-flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-muted-foreground transition hover:bg-background hover:text-brick" />
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-brick transition hover:bg-brick/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav
          className={`ml-4 grid gap-2 pb-3 sm:mx-auto sm:w-full sm:px-6 md:hidden ${
            isTeacher ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
          }`}
          style={{ width: "min(342px, calc(100vw - 32px))" }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-bold ${
                  active ? "bg-brick text-primary-foreground" : "bg-rice/70 text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className={`relative z-10 ${isAdmin ? "lg:pl-[17rem]" : ""}`}>{children}</main>
    </div>
  );
}
