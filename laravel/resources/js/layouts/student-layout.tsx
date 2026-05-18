import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { CP, glyph } from '@/lib/aksara-codepoints';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, NotebookPen, Sparkles, UserRound } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: '/dashboard' },
    { href: '/latihan', label: 'Latihan', icon: NotebookPen, match: '/latihan' },
    { href: '/quiz', label: 'Kuis', icon: Sparkles, match: '/quiz' },
] as const;

function BrandMark() {
    return (
        <Link href="/dashboard" className="flex items-center gap-2.5 text-primary">
            <span className="bali-text grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
                {glyph(CP.akara)}
            </span>
            <span className="leading-tight">
                <span className="block font-display text-lg font-semibold tracking-[-0.02em] text-foreground">Aksa Bali</span>
                <span className="block text-[0.6rem] font-bold uppercase tracking-[0.18em] text-primary/80">Aksabali App</span>
            </span>
        </Link>
    );
}

export default function StudentLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const [pathname, setPathname] = useState('/');

    useEffect(() => {
        setPathname(window.location.pathname);
    }, []);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <BrandMark />
                    <nav className="hidden items-center gap-1 md:flex">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = pathname.startsWith(item.match);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                        active
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex items-center gap-2">
                        <AppearanceToggleDropdown />
                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('profile.edit')}
                                    className="hidden items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary sm:inline-flex"
                                >
                                    {(user as { avatar_url?: string }).avatar_url ? (
                                        <img
                                            src={(user as { avatar_url?: string }).avatar_url ?? ''}
                                            alt=""
                                            className="h-6 w-6 rounded-full"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <UserRound className="h-4 w-4" />
                                    )}
                                    <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-destructive hover:text-destructive"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Keluar</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile nav */}
                <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname.startsWith(item.match);
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

            <main className="relative">{children}</main>
        </div>
    );
}
