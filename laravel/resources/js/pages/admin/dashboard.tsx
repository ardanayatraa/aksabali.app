import { AdminPageHeader } from '@/components/admin-page-header';
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

            <AdminPageHeader
                title="Ringkasan"
                description="Ringkasan singkat — siapa yang aktif, apa yang dipakai, sama berapa yang lulus."
            />

            <p className="-mt-2 mb-6 text-sm text-muted-foreground">
                Site mode:{' '}
                <span className={`font-bold ${siteMode === 'live' ? 'text-emerald-600' : 'text-amber-600'}`}>{siteMode}</span>.{' '}
                <Link href={route('admin.settings')} className="font-bold text-primary hover:underline">
                    Ubah →
                </Link>
            </p>

            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {tiles.map((tile) => {
                    const Icon = tile.icon;
                    return (
                        <div key={tile.label} className="border-l-2 border-border pl-4">
                            <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${tile.accent}`} />
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tile.label}</p>
                            </div>
                            <p className="mt-1 font-display text-4xl font-semibold tracking-tight">{tile.value}</p>
                            {tile.sub && <p className="text-xs text-muted-foreground">{tile.sub}</p>}
                        </div>
                    );
                })}
            </div>

            <section className="mt-10">
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-display text-xl font-bold tracking-tight">
                        Pengguna terbaru <span className="text-sm font-medium text-muted-foreground">· {recentUsers.length} terdaftar</span>
                    </h2>
                    <Link
                        href={route('admin.users')}
                        className="text-xs font-bold text-primary transition hover:underline"
                    >
                        Kelola semua →
                    </Link>
                </div>

                {recentUsers.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">Belum ada pengguna.</p>
                ) : (
                    <ul className="mt-3 divide-y divide-border">
                        {recentUsers.map((u) => (
                            <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={route('admin.users.show', { user: u.id })}
                                        className="truncate font-bold transition hover:text-primary"
                                    >
                                        {u.name || u.email}
                                    </Link>
                                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="font-bold uppercase tracking-wider text-muted-foreground">{u.role}</span>
                                    <span
                                        className={`font-bold uppercase tracking-wider ${
                                            u.tier === 'premium' || u.tier === 'lite' ? 'text-amber-600' : 'text-muted-foreground'
                                        }`}
                                    >
                                        {u.tier}
                                    </span>
                                    {u.status === 'suspended' ? (
                                        <UserX className="h-3.5 w-3.5 text-destructive" />
                                    ) : (
                                        <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </AdminLayout>
    );
}
