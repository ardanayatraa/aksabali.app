import { AdminPageHeader } from '@/components/admin-page-header';
import { AksaraStrokePreview } from '@/components/aksara-stroke-preview';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Lock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Fragment, useState } from 'react';

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
    const [previewId, setPreviewId] = useState<string | null>(null);

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

            <AdminPageHeader
                title="Konten aksara"
                description="Ngatur daftar aksara, pola goresnya, dan urutannya."
                actions={
                    <Link
                        href={route('admin.aksara.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Link>
                }
            />

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
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
            </div>

            <div className="mt-5 overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-border text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="py-2 pr-3">Glyph</th>
                            <th className="py-2 pr-3">Nama</th>
                            <th className="py-2 pr-3">Kategori</th>
                            <th className="py-2 pr-3">Latin</th>
                            <th className="py-2 pr-3">Stroke</th>
                            <th className="py-2 pr-3">Tier</th>
                            <th className="py-2 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                        {aksara.data.map((a) => {
                            const open = previewId === a.id;
                            return (
                                <Fragment key={a.id}>
                                    <tr>
                                        <td className="py-3 pr-3">
                                            <span className="bali-text text-2xl text-primary">{a.char ?? a.latin}</span>
                                        </td>
                                        <td className="py-3 pr-3">
                                            <p className="font-bold">{a.name}</p>
                                            <p className="text-xs text-muted-foreground">{a.id}</p>
                                        </td>
                                        <td className="py-3 pr-3 text-xs text-muted-foreground">{a.category}</td>
                                        <td className="py-3 pr-3">{a.latin}</td>
                                        <td className="py-3 pr-3 text-xs text-muted-foreground">
                                            {a.svg_url ? `${a.target_stroke_count} pcs` : <span className="text-destructive/70">—</span>}
                                        </td>
                                        <td className="py-3 pr-3">
                                            {a.is_premium ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                                                    <Lock className="h-3 w-3" />
                                                    Premium
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Free</span>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewId(open ? null : a.id)}
                                                    disabled={!a.svg_url}
                                                    title={a.svg_url ? 'Peragakan goresan' : 'SVG belum ada'}
                                                    className={`grid h-7 w-7 place-items-center rounded-md border transition ${
                                                        open
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-primary'
                                                    } disabled:cursor-not-allowed disabled:opacity-40`}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                                <Link
                                                    href={route('admin.aksara.edit', { aksara: a.id })}
                                                    title="Edit aksara"
                                                    className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground transition hover:border-primary hover:text-primary"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(a)}
                                                    title="Hapus aksara"
                                                    className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground transition hover:border-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {open && (
                                        <tr className="bg-muted/30">
                                            <td colSpan={7} className="px-2 py-4">
                                                <div className="flex flex-wrap items-start gap-6">
                                                    <AksaraStrokePreview
                                                        svgUrl={a.svg_url}
                                                        glyph={a.char}
                                                        size={220}
                                                        durationMs={1800}
                                                    />
                                                    <div className="min-w-0 flex-1 text-sm">
                                                        <p className="font-display text-xl font-bold tracking-tight">{a.name}</p>
                                                        <p className="text-muted-foreground">Latin: {a.latin}</p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Urutan goresan diperagakan pelan biar gampang dicek satu per satu.
                                                            Tombol Putar lagi buat ulangin animasi.
                                                        </p>
                                                        {a.svg_url && (
                                                            <p className="mt-2 break-all font-mono text-[0.65rem] text-muted-foreground/70">
                                                                {a.svg_url}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>

                {aksara.data.length === 0 && (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                        Catalog kosong. Tambah aksara pertama lewat tombol Tambah di kanan atas.
                    </p>
                )}
            </div>

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
