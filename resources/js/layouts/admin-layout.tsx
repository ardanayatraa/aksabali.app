import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { CP, glyph } from '@/lib/aksara-codepoints';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BookOpenText,
    ExternalLink,
    LayoutDashboard,
    LogOut,
    type LucideIcon,
    Settings,
    Sparkles,
    UserRound,
    Users,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    match: string;
    exact?: boolean;
}

const adminNav: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, match: '/admin', exact: true },
    { href: '/admin/users', label: 'Pengguna', icon: Users, match: '/admin/users' },
    { href: '/admin/aksara', label: 'Aksara', icon: BookOpenText, match: '/admin/aksara' },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings, match: '/admin/settings' },
];

const studentShortcuts: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard siswa', icon: LayoutDashboard, match: '/dashboard', exact: true },
    { href: '/latihan', label: 'Latihan', icon: BookOpenText, match: '/latihan' },
    { href: '/quiz', label: 'Kuis', icon: Sparkles, match: '/quiz' },
];

function initials(name?: string | null, email?: string | null): string {
    const source = name || email || 'AB';
    return source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

/**
 * Admin layout — fixed left sidebar 17rem full-height (match Next.js AppShell admin mode).
 * Bottom of sidebar: profile card dgn avatar/initials + Profil + Keluar.
 * Mobile: replace sidebar dgn top header + horizontal tab.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const [pathname, setPathname] = useState('/admin');

    useEffect(() => {
        setPathname(window.location.pathname);
    }, []);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const isActive = (item: NavItem) => (item.exact ? pathname === item.match : pathname.startsWith(item.match));

    return (
        <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-muted text-foreground">
            {/* DESKTOP: fixed left sidebar 17rem */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-border bg-card px-4 py-5 shadow-[10px_0_32px_hsl(var(--foreground)/0.04)] lg:flex">
                <Link href="/admin" aria-label="Aksa Bali admin" className="flex items-center gap-3 px-1 text-primary">
                    <span className="bali-text grid h-10 w-10 place-items-center rounded-lg bg-primary text-base font-black text-primary-foreground">
                        {glyph(CP.akara)}
                    </span>
                    <span className="leading-tight">
                        <span className="block font-display text-lg font-semibold tracking-[-0.02em] text-foreground">
                            Aksa Bali
                        </span>
                        <span className="block text-[0.6rem] font-bold uppercase tracking-[0.18em] text-primary/80">
                            Admin Panel
                        </span>
                    </span>
                </Link>

                <nav className="mt-6 grid gap-1.5">
                    {adminNav.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex min-h-10 items-center gap-3 rounded px-3 text-sm font-bold transition ${
                                    active
                                        ? 'bg-primary text-primary-foreground shadow-[0_10px_22px_hsl(var(--primary)/0.12)]'
                                        : 'text-muted-foreground hover:bg-muted hover:text-primary'
                                }`}
                            >
                                <span
                                    className={`grid h-7 w-7 place-items-center rounded ${
                                        active ? 'bg-primary-foreground/15' : 'bg-primary/10 text-primary'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Student shortcuts — admin gampang preview UX siswa */}
                <div className="mt-5 border-t border-border pt-5">
                    <p className="mb-2 px-3 text-[0.62rem] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                        Preview siswa
                    </p>
                    <nav className="grid gap-1">
                        {studentShortcuts.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex min-h-9 items-center justify-between rounded px-3 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    <span className="inline-flex items-center gap-2.5">
                                        <Icon className="h-3.5 w-3.5" />
                                        {item.label}
                                    </span>
                                    <ExternalLink className="h-3 w-3 opacity-50" />
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom: profile card */}
                <div className="mt-auto rounded border border-border bg-muted p-3">
                    <div className="flex items-center gap-3">
                        {(user as { avatar_url?: string } | undefined)?.avatar_url ? (
                            <img
                                src={(user as { avatar_url?: string }).avatar_url ?? ''}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="h-10 w-10 shrink-0 rounded-full"
                            />
                        ) : (
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-primary text-sm font-black text-primary-foreground">
                                {initials(user?.name, user?.email)}
                            </span>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black">{user?.name || 'Admin'}</p>
                            <p className="truncate text-xs font-semibold text-muted-foreground/60">{user?.email}</p>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Link
                            href={route('profile.edit')}
                            className="inline-flex min-h-9 items-center justify-center gap-2 rounded border border-border bg-card px-3 text-xs font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                        >
                            <UserRound className="h-4 w-4" />
                            Profil
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex min-h-9 items-center justify-center gap-2 rounded bg-primary/10 px-3 text-xs font-black text-primary transition hover:bg-primary hover:text-primary-foreground"
                        >
                            <LogOut className="h-4 w-4" />
                            Keluar
                        </button>
                    </div>
                </div>
            </aside>

            {/* MOBILE: top header + horizontal nav */}
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-xl lg:hidden">
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <Link href="/admin" className="flex items-center gap-2.5 text-primary">
                        <span className="bali-text grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
                            {glyph(CP.akara)}
                        </span>
                        <span className="block font-display text-base font-semibold tracking-[-0.02em] text-foreground">
                            Admin
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <AppearanceToggleDropdown />
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-destructive hover:text-destructive"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2">
                    {adminNav.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                                    active
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            {/* DESKTOP: also expose theme toggle floating top-right */}
            <div className="fixed right-4 top-4 z-50 hidden lg:block">
                <div className="rounded-full border border-border bg-card/85 backdrop-blur-md">
                    <AppearanceToggleDropdown />
                </div>
            </div>

            <main className="relative z-10 lg:pl-[17rem]">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
            </main>
        </div>
    );
}
