import { AdminPageHeader } from '@/components/admin-page-header';
import { AksaraStrokePreview } from '@/components/aksara-stroke-preview';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpenText, LoaderCircle, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface AksaraInput {
    id: string;
    name: string;
    char: string | null;
    latin: string;
    category: string;
    order: number;
    is_premium: boolean;
    svg_url: string | null;
    image_url: string | null;
    audio_url: string | null;
    target_stroke_count: number;
    notes: string | null;
}

interface Cat {
    id: string;
    name: string;
}

interface Props {
    aksara: AksaraInput | null;
    categories: Cat[];
}

export default function AdminAksaraEdit({ aksara, categories }: Props) {
    const isNew = !aksara;
    const form = useForm({
        id: aksara?.id ?? '',
        name: aksara?.name ?? '',
        char: aksara?.char ?? '',
        latin: aksara?.latin ?? '',
        category: aksara?.category ?? categories[0]?.id ?? '',
        order: aksara?.order ?? 0,
        is_premium: aksara?.is_premium ?? false,
        svg_url: aksara?.svg_url ?? '',
        image_url: aksara?.image_url ?? '',
        audio_url: aksara?.audio_url ?? '',
        target_stroke_count: aksara?.target_stroke_count ?? 1,
        notes: aksara?.notes ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isNew) {
            form.post(route('admin.aksara.store'));
        } else {
            form.put(route('admin.aksara.update', { aksara: aksara!.id }));
        }
    };

    return (
        <AdminLayout>
            <Head title={isNew ? 'Tambah Aksara — Admin' : `Edit ${aksara?.name} — Admin`} />

            <Link
                href={route('admin.aksara.index')}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke catalog
            </Link>

            <AdminPageHeader
                title={isNew ? 'Aksara baru' : aksara!.name}
                description={
                    isNew
                        ? 'Tambah aksara baru ke catalog — isi metadata + SVG referensi.'
                        : 'Edit metadata + SVG referensi. Preview goresan tampil di samping.'
                }
                eyebrow={isNew ? 'Tambah aksara' : 'Edit aksara'}
                icon={BookOpenText}
            />

            <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
                <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">ID slug</label>
                        <input
                            type="text"
                            value={form.data.id}
                            onChange={(e) => form.setData('id', e.target.value)}
                            disabled={!isNew}
                            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm focus:border-primary focus:outline-none disabled:opacity-60"
                            placeholder="anacaraka-ha-1B33"
                        />
                        {form.errors.id && <p className="mt-1 text-xs text-destructive">{form.errors.id}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama tampilan</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                            placeholder="Ha"
                        />
                        {form.errors.name && <p className="mt-1 text-xs text-destructive">{form.errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Glyph (char)</label>
                        <input
                            type="text"
                            value={form.data.char}
                            onChange={(e) => form.setData('char', e.target.value)}
                            className="bali-text mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-2xl text-primary focus:border-primary focus:outline-none"
                            maxLength={8}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Latin</label>
                        <input
                            type="text"
                            value={form.data.latin}
                            onChange={(e) => form.setData('latin', e.target.value)}
                            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                            placeholder="ha"
                        />
                        {form.errors.latin && <p className="mt-1 text-xs text-destructive">{form.errors.latin}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategori</label>
                        <select
                            value={form.data.category}
                            onChange={(e) => form.setData('category', e.target.value)}
                            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.id})
                                </option>
                            ))}
                        </select>
                        {form.errors.category && <p className="mt-1 text-xs text-destructive">{form.errors.category}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Order</label>
                        <input
                            type="number"
                            value={form.data.order}
                            onChange={(e) => form.setData('order', Number(e.target.value))}
                            min={0}
                            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Target stroke count</label>
                        <input
                            type="number"
                            value={form.data.target_stroke_count}
                            onChange={(e) => form.setData('target_stroke_count', Number(e.target.value))}
                            min={0}
                            max={30}
                            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div className="flex items-end">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5">
                            <input
                                type="checkbox"
                                checked={form.data.is_premium}
                                onChange={(e) => form.setData('is_premium', e.target.checked)}
                                className="h-4 w-4 accent-primary"
                            />
                            <span className="text-sm font-bold">Premium only</span>
                        </label>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">SVG URL</label>
                        <input
                            type="text"
                            value={form.data.svg_url}
                            onChange={(e) => form.setData('svg_url', e.target.value)}
                            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm focus:border-primary focus:outline-none"
                            placeholder="/aksara/strokes/anacaraka/ha-1B33.svg"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Image URL</label>
                        <input
                            type="text"
                            value={form.data.image_url}
                            onChange={(e) => form.setData('image_url', e.target.value)}
                            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm focus:border-primary focus:outline-none"
                            placeholder="/aksara/cards/anacaraka/ha-1B33.png"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Audio URL</label>
                        <input
                            type="text"
                            value={form.data.audio_url}
                            onChange={(e) => form.setData('audio_url', e.target.value)}
                            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm focus:border-primary focus:outline-none"
                            placeholder="/audio/anacaraka/ha.mp3"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</label>
                        <textarea
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            rows={3}
                            maxLength={1000}
                            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                            placeholder="Catatan internal: cara baca, urutan stroke, dll."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 sm:col-span-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                        >
                            {form.processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {form.processing ? 'Menyimpan...' : isNew ? 'Buat' : 'Update'}
                        </button>
                    </div>
                </form>

                <aside className="lg:sticky lg:top-6 lg:self-start">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview goresan</p>
                    <div className="mt-2">
                        <AksaraStrokePreview
                            svgUrl={form.data.svg_url || null}
                            glyph={form.data.char || null}
                            size={240}
                            durationMs={1800}
                        />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Animasi pakai SVG URL yang lagi diisi. Update field SVG URL untuk reload preview.
                    </p>
                </aside>
            </div>
        </AdminLayout>
    );
}
