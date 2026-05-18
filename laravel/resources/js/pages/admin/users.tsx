import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: string;
    tier: string;
    status: string;
    created_at: string | null;
}

interface PaginatedUsers {
    data: UserRow[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    users: PaginatedUsers;
    filters: { role: string | null; status: string | null; q: string | null };
}

export default function AdminUsers({ users, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');

    const applyFilter = (key: 'role' | 'status' | 'q', value: string) => {
        const params: Record<string, string> = {};
        if (filters.role) params.role = filters.role;
        if (filters.status) params.status = filters.status;
        if (filters.q) params.q = filters.q;
        if (value) params[key] = value;
        else delete params[key];
        router.get(route('admin.users'), params, { preserveScroll: true, preserveState: true });
    };

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('q', q);
    };

    const toggleSuspend = (user: UserRow) => {
        router.post(route('admin.users.suspend', { user: user.id }), {}, { preserveScroll: true });
    };

    const changeRole = (user: UserRow, role: string) => {
        router.post(route('admin.users.role', { user: user.id }), { role }, { preserveScroll: true });
    };

    const changeTier = (user: UserRow, tier: string) => {
        router.post(route('admin.users.tier', { user: user.id }), { tier }, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Pengguna — Admin" />

            <h1 className="font-display text-3xl font-semibold tracking-tight">Kelola akun</h1>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <form onSubmit={submitSearch} className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Cari email atau nama..."
                        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
                    />
                </form>
                <select
                    value={filters.role ?? ''}
                    onChange={(e) => applyFilter('role', e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                    <option value="">Semua role</option>
                    <option value="siswa">Siswa</option>
                    <option value="pengajar">Pengajar</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilter('status', e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                    <option value="">Semua status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            <div className="mt-5 overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-border text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="py-2 pr-3">Pengguna</th>
                            <th className="py-2 pr-3">Role</th>
                            <th className="py-2 pr-3">Tier</th>
                            <th className="py-2 pr-3">Status</th>
                            <th className="py-2 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                        {users.data.map((u) => (
                            <tr key={u.id}>
                                <td className="py-3 pr-3">
                                    <Link
                                        href={route('admin.users.show', { user: u.id })}
                                        className="font-bold transition hover:text-primary"
                                    >
                                        {u.name || '—'}
                                    </Link>
                                    <div className="text-xs text-muted-foreground">{u.email}</div>
                                </td>
                                <td className="py-3 pr-3">
                                    <select
                                        value={u.role}
                                        onChange={(e) => changeRole(u, e.target.value)}
                                        className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
                                    >
                                        <option value="siswa">Siswa</option>
                                        <option value="pengajar">Pengajar</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="py-3 pr-3">
                                    <select
                                        value={u.tier}
                                        onChange={(e) => changeTier(u, e.target.value)}
                                        className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
                                    >
                                        <option value="free">Free</option>
                                        <option value="lite">Lite</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </td>
                                <td className="py-3 pr-3">
                                    <span
                                        className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${
                                            u.status === 'suspended' ? 'text-destructive' : 'text-emerald-600'
                                        }`}
                                    >
                                        {u.status === 'suspended' ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                                        {u.status}
                                    </span>
                                </td>
                                <td className="py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => toggleSuspend(u)}
                                        className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground transition hover:border-destructive hover:text-destructive"
                                    >
                                        {u.status === 'suspended' ? 'Aktifkan' : 'Suspend'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.data.length === 0 && (
                    <p className="py-10 text-center text-sm text-muted-foreground">Tidak ada pengguna yang cocok.</p>
                )}
            </div>

            {users.last_page > 1 && (
                <nav className="mt-6 flex flex-wrap items-center justify-center gap-1">
                    {users.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            preserveScroll
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                link.active
                                    ? 'bg-primary text-primary-foreground'
                                    : link.url
                                      ? 'border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
                                      : 'cursor-not-allowed border border-border bg-card text-muted-foreground/40'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </nav>
            )}
        </AdminLayout>
    );
}
