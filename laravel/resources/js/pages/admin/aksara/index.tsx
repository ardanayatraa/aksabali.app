import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Lock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Aksara {
    id: string;
    name: string;
    char: string | null;
    latin: string;
    category: string;
    order: number;
    is_premium: boolean;
    svg_url: string | null;
    target_stroke_count: number;
}

interface Cat {
    id: string;
    name: string;
}

interface Props {
    aksara: {
        data: Aksara[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: Cat[];
    filters: { category: string | null; q: string | null };
}

export default function AdminAksaraIndex({ aksara, categories, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');

    const apply = (key: 'category' | 'q', value: string) => {
        const params: Record<string, string> = {};
        if (filters.category) params.category = filters.category;
        if (filters.q) params.q = filters.q;
        if (value) params[key] = value;
        else delete params[key];
        router.get(route('admin.aksara.index'), params, { preserveScroll: true, preserveState: true });
    };

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        apply('q', q);
    };

    const handleDelete = (item: Aksara) => {
        if (!confirm(`Hapus aksara "${item.name}"?`)) return;
        router.delete(route('admin.aksara.destroy', { aksara: item.id }), { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Aksara Catalog — Admin" />

            <section className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Catalog</p>
                    <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">Aksara CMS.</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Catalog 32 aksara dasar + pangangge + angka + kata-aksara. Edit metadata, set premium, ubah urutan.
                    </p>
                </div>
                <Link
                    href={route('admin.aksara.create')}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Tambah aksara
                </Link>
            </section>

            <section className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <form onSubmit={submitSearch} className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Cari id, nama, atau latin..."
                        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
                    />
                </form>
                <select
                    value={filters.category ?? ''}
                    onChange={(e) => apply('category', e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                    <option value="">Semua kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </section>

            <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">Glyph</th>
                                <th className="px-4 py-3">Id / Nama</th>
                                <th className="px-4 py-3">Kategori</th>
                                <th className="px-4 py-3">Latin</th>
                                <th className="px-4 py-3">Stroke</th>
                                <th className="px-4 py-3">Premium</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {aksara.data.map((a) => (
                                <tr key={a.id}>
                                    <td className="px-4 py-3">
                                        <span className="bali-text text-2xl text-primary">{a.char ?? a.latin}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold">{a.name}</p>
                                        <p className="text-xs text-muted-foreground">{a.id}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs">{a.category}</td>
                                    <td className="px-4 py-3">{a.latin}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.target_stroke_count} pcs</td>
                                    <td className="px-4 py-3">
                                        {a.is_premium ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600">
                                                <Lock className="h-3 w-3" />
                                                Premium
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Free</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={route('admin.aksara.edit', { aksara: a.id })}
                                                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(a)}
                                                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground transition hover:border-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {aksara.data.length === 0 && (
                    <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                        Catalog kosong. Tambah aksara pertama lewat tombol di kanan atas.
                    </p>
                )}
            </section>

            {aksara.last_page > 1 && (
                <nav className="mt-6 flex flex-wrap items-center justify-center gap-1">
                    {aksara.links.map((link, i) => (
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
