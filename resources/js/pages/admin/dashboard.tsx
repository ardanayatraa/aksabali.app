import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { BookOpenText, CreditCard, Gamepad2, Sparkles, UserCheck, Users, UserX } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface Stats {
    users: number;
    premium: number;
    suspended: number;
    aksara: number;
    aksara_premium: number;
    active_sessions: number;
    total_sessions: number;
    pending_payments: number;
    success_payments: number;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    role: string;
    tier: string;
    status: string;
    created_at: string | null;
}

interface Props {
    stats: Stats;
    recentUsers: RecentUser[];
    siteMode: string;
}

interface StatTile {
    label: string;
    value: number | string;
    sub?: string;
    icon: LucideIcon;
    accent: string;
}

export default function AdminDashboard({ stats, recentUsers, siteMode }: Props) {
    const tiles: StatTile[] = [
        { label: 'Total pengguna', value: stats.users, sub: `${stats.premium} premium`, icon: Users, accent: 'text-primary' },
        { label: 'Akun premium', value: stats.premium, sub: `dari ${stats.users}`, icon: Sparkles, accent: 'text-amber-500' },
        { label: 'Disuspend', value: stats.suspended, icon: UserX, accent: 'text-destructive' },
        { label: 'Aksara catalog', value: stats.aksara, sub: `${stats.aksara_premium} premium`, icon: BookOpenText, accent: 'text-emerald-600' },
        { label: 'Sesi aktif', value: stats.active_sessions, sub: `total ${stats.total_sessions}`, icon: Gamepad2, accent: 'text-primary' },
        { label: 'Pembayaran sukses', value: stats.success_payments, sub: `${stats.pending_payments} pending`, icon: CreditCard, accent: 'text-emerald-600' },
    ];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard — Aksa Bali" />

            <section>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Admin</p>
                <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Ringkasan platform.</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Site mode saat ini:{' '}
                    <span className={`font-bold ${siteMode === 'live' ? 'text-emerald-600' : 'text-amber-600'}`}>{siteMode}</span>.{' '}
                    <Link href={route('admin.settings')} className="font-bold text-primary hover:underline">
                        Ubah →
                    </Link>
                </p>
            </section>

            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tiles.map((tile) => {
                    const Icon = tile.icon;
                    return (
                        <div key={tile.label} className="rounded-2xl border border-border bg-card p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tile.label}</p>
                                <Icon className={`h-4 w-4 ${tile.accent}`} />
                            </div>
                            <p className="mt-2 font-display text-4xl font-semibold tracking-tight">{tile.value}</p>
                            {tile.sub && <p className="mt-1 text-xs text-muted-foreground">{tile.sub}</p>}
                        </div>
                    );
                })}
            </section>

            <section className="mt-8 rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pengguna terbaru</p>
                        <h2 className="mt-1 font-display text-xl font-bold tracking-tight">{recentUsers.length} terdaftar</h2>
                    </div>
                    <Link
                        href={route('admin.users')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                        Kelola semua
                    </Link>
                </div>

                {recentUsers.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">Belum ada pengguna.</p>
                ) : (
                    <ul className="mt-4 grid gap-2">
                        {recentUsers.map((u) => (
                            <li
                                key={u.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-bold">{u.name || u.email}</p>
                                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="rounded-full bg-foreground/[0.04] px-2 py-0.5 font-bold uppercase tracking-wider text-muted-foreground">
                                        {u.role}
                                    </span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider ${
                                            u.tier === 'premium' || u.tier === 'lite'
                                                ? 'bg-amber-500/10 text-amber-600'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {u.tier}
                                    </span>
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        {u.status === 'suspended' ? <UserX className="h-3 w-3 text-destructive" /> : <UserCheck className="h-3 w-3 text-emerald-500" />}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </AdminLayout>
    );
}
