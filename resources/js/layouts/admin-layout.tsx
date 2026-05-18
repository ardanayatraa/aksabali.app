import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { CP, glyph } from '@/lib/aksara-codepoints';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BookOpenText, LayoutDashboard, LogOut, type LucideIcon, Settings, Users } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    match: string;
    exact?: boolean;
}

const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, match: '/admin', exact: true },
    { href: '/admin/users', label: 'Pengguna', icon: Users, match: '/admin/users' },
    { href: '/admin/aksara', label: 'Aksara', icon: BookOpenText, match: '/admin/aksara' },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings, match: '/admin/settings' },
];

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

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <Link href="/admin" className="flex items-center gap-2.5 text-primary">
                        <span className="bali-text grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
                            {glyph(CP.akara)}
                        </span>
                        <span className="leading-tight">
                            <span className="block font-display text-lg font-semibold tracking-[-0.02em] text-foreground">
                                Aksa Bali
                            </span>
                            <span className="block text-[0.6rem] font-bold uppercase tracking-[0.18em] text-primary/80">Admin Panel</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <AppearanceToggleDropdown />
                        {user && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-destructive hover:text-destructive"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Keluar</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
                <aside className="hidden w-56 shrink-0 lg:block">
                    <nav className="grid gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = item.exact ? pathname === item.match : pathname.startsWith(item.match);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
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
                </aside>

                <div className="lg:hidden">
                    <nav className="mb-4 flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = item.exact ? pathname === item.match : pathname.startsWith(item.match);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                                        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}
