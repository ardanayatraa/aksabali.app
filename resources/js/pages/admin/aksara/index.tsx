import { AdminPageHeader } from '@/components/admin-page-header';
import { AksaraStrokePreview } from '@/components/aksara-stroke-preview';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    BookOpenText,
    Check,
    LoaderCircle,
    Lock,
    PenTool,
    Pencil,
    Plus,
    Save,
    Search,
    Sparkles,
    Trash2,
    Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Aksara {
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
    aksara: Aksara[];
    categories: Cat[];
    filters: { category: string | null; q: string | null };
}

interface FormShape {
    id: string;
    name: string;
    char: string;
    latin: string;
    category: string;
    order: number;
    is_premium: boolean;
    svg_url: string;
    image_url: string;
    audio_url: string;
    target_stroke_count: number;
    notes: string;
}

const emptyForm = (catId: string): FormShape => ({
    id: '',
    name: '',
    char: '',
    latin: '',
    category: catId,
    order: 0,
    is_premium: false,
    svg_url: '',
    image_url: '',
    audio_url: '',
    target_stroke_count: 0,
    notes: '',
});

function toForm(item: Aksara): FormShape {
    return {
        id: item.id ?? '',
        name: item.name ?? '',
        char: item.char ?? '',
        latin: item.latin ?? '',
        category: item.category ?? '',
        order: Number(item.order ?? 0),
        is_premium: Boolean(item.is_premium),
        svg_url: item.svg_url ?? '',
        image_url: item.image_url ?? '',
        audio_url: item.audio_url ?? '',
        target_stroke_count: Number(item.target_stroke_count ?? 0),
        notes: item.notes ?? '',
    };
}

export default function AdminAksaraIndex({ aksara, categories, filters }: Props) {
    const [tab, setTab] = useState<'data' | 'tool'>('data');
    const [search, setSearch] = useState(filters.q ?? '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category ?? 'all');
    const [selectedId, setSelectedId] = useState<string | null>(aksara[0]?.id ?? null);
    const [svgFile, setSvgFile] = useState<File | null>(null);
    const [svgPreviewUrl, setSvgPreviewUrl] = useState<string>('');
    const [status, setStatus] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedItem = useMemo(() => aksara.find((a) => a.id === selectedId) ?? null, [aksara, selectedId]);
    const isNew = !selectedItem;

    const form = useForm<FormShape>(selectedItem ? toForm(selectedItem) : emptyForm(categories[0]?.id ?? ''));

    // Reset form ketika selectedItem berubah (dari klik list)
    useEffect(() => {
        if (selectedItem) {
            form.setData(toForm(selectedItem));
        } else {
            form.setData(emptyForm(categoryFilter !== 'all' ? categoryFilter : categories[0]?.id ?? ''));
        }
        setSvgFile(null);
        if (svgPreviewUrl) {
            URL.revokeObjectURL(svgPreviewUrl);
            setSvgPreviewUrl('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (svgPreviewUrl) URL.revokeObjectURL(svgPreviewUrl);
        };
    }, [svgPreviewUrl]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return aksara
            .filter((a) => categoryFilter === 'all' || a.category === categoryFilter)
            .filter((a) => {
                if (!q) return true;
                return [a.id, a.name, a.latin, a.category, a.char]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(q));
            });
    }, [aksara, categoryFilter, search]);

    const startNew = () => {
        setSelectedId(null);
        form.reset();
        form.setData(emptyForm(categoryFilter !== 'all' ? categoryFilter : categories[0]?.id ?? ''));
        setStatus('');
    };

    const handleSelect = (a: Aksara) => {
        setSelectedId(a.id);
        setStatus('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isNew) {
            form.post(route('admin.aksara.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setStatus('Aksara baru tersimpan.');
                },
                onError: () => setStatus('Belum bisa disimpan — cek field yang merah.'),
            });
        } else {
            form.put(route('admin.aksara.update', { aksara: selectedItem!.id }), {
                preserveScroll: true,
                onSuccess: () => setStatus(`Update ${selectedItem!.name} tersimpan.`),
                onError: () => setStatus('Belum bisa disimpan — cek field yang merah.'),
            });
        }
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        if (!confirm(`Hapus aksara "${selectedItem.name}"?`)) return;
        router.delete(route('admin.aksara.destroy', { aksara: selectedItem.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedId(null);
                setStatus(`${selectedItem.name} dihapus.`);
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (svgPreviewUrl) URL.revokeObjectURL(svgPreviewUrl);
        setSvgFile(file);
        setSvgPreviewUrl(file ? URL.createObjectURL(file) : '');
    };

    const handleUploadSvg = async () => {
        if (!selectedItem || !svgFile) {
            setStatus('Pilih aksara + file SVG dulu.');
            return;
        }
        setUploading(true);
        setStatus('');
        try {
            const tokenEl = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
            const csrf = tokenEl?.content ?? '';
            const fd = new FormData();
            fd.append('file', svgFile);
            const res = await fetch(route('admin.aksara.svg', { aksara: selectedItem.id }), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
                credentials: 'same-origin',
                body: fd,
            });
            const body = await res.json();
            if (!res.ok) {
                setStatus(body.error ?? 'SVG belum bisa diupload.');
                return;
            }
            setStatus(`SVG tersimpan: ${body.data.svgUrl} (${body.data.strokeCount} goresan).`);
            setSvgFile(null);
            if (svgPreviewUrl) {
                URL.revokeObjectURL(svgPreviewUrl);
                setSvgPreviewUrl('');
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
            router.reload({ only: ['aksara'] });
        } catch {
            setStatus('Belum bisa upload SVG — cek koneksi.');
        } finally {
            setUploading(false);
        }
    };

    const currentSvgUrl = svgPreviewUrl || form.data.svg_url || selectedItem?.svg_url || '';
    const currentGlyph = form.data.char || selectedItem?.char || '';

    return (
        <AdminLayout>
            <Head title="Konten aksara — Admin" />

            <AdminPageHeader
                title="Konten aksara"
                description="Ngatur daftar aksara, pola goresnya, dan urutannya."
                eyebrow="Konten"
                icon={BookOpenText}
                actions={
                    <button
                        type="button"
                        onClick={startNew}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold transition hover:border-primary hover:text-primary"
                    >
                        <Plus className="h-4 w-4" />
                        Baru
                    </button>
                }
            />

            <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                {/* Left: catalog list */}
                <aside className="flex min-h-0 flex-col gap-3">
                    <div className="grid gap-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari id, nama, latin..."
                                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        >
                            <option value="all">Semua kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs font-bold text-muted-foreground">
                            {filtered.length} dari {aksara.length} aksara
                        </p>
                    </div>

                    <div className="max-h-[68vh] overflow-y-auto rounded-lg border border-border">
                        {filtered.map((a) => {
                            const active = a.id === selectedId;
                            return (
                                <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => handleSelect(a)}
                                    aria-pressed={active}
                                    className={`flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left transition last:border-b-0 ${
                                        active
                                            ? 'bg-primary/10 shadow-[inset_3px_0_0_hsl(var(--primary))]'
                                            : 'hover:bg-muted/50'
                                    }`}
                                >
                                    <span className="bali-text grid h-9 w-9 shrink-0 place-items-center rounded bg-background text-2xl text-primary">
                                        {a.char ?? '·'}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-bold">{a.latin || a.name}</span>
                                            <span className="text-[0.62rem] font-bold tabular-nums text-muted-foreground/70">
                                                {a.order}
                                            </span>
                                        </span>
                                        <span className="mt-1 flex flex-wrap items-center gap-1">
                                            <span className="rounded bg-muted px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
                                                {a.category}
                                            </span>
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${
                                                    a.svg_url
                                                        ? 'bg-emerald-500/15 text-emerald-600'
                                                        : 'bg-destructive/15 text-destructive'
                                                }`}
                                            >
                                                {a.svg_url ? 'SVG' : 'Kosong'}
                                            </span>
                                            {a.target_stroke_count > 0 && (
                                                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-amber-600">
                                                    {a.target_stroke_count} stroke
                                                </span>
                                            )}
                                            {a.is_premium && (
                                                <Lock className="h-3 w-3 text-amber-600" />
                                            )}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                        {!filtered.length && (
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                Tidak ada aksara yang cocok.
                            </p>
                        )}
                    </div>

                    {status && (
                        <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground">
                            {status}
                        </div>
                    )}
                </aside>

                {/* Right: editor */}
                <section className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
                        <div>
                            <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-primary">
                                {isNew ? 'Tambah baru' : 'Edit aksara'}
                            </p>
                            <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
                                {isNew ? 'Aksara baru' : selectedItem!.name}
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {isNew
                                    ? 'Isi data dasar dulu, lalu simpan sebelum upload SVG-nya.'
                                    : 'Edit metadata + referensi SVG untuk aksara yg dipilih.'}
                            </p>
                        </div>
                        {!isNew && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus
                            </button>
                        )}
                    </div>

                    {/* Sub-tabs */}
                    <div className="flex gap-1 border-b border-border bg-muted/30 px-5 pt-3">
                        {(
                            [
                                { id: 'data' as const, label: 'Data aksara', icon: Pencil },
                                { id: 'tool' as const, label: 'Pola SVG', icon: PenTool },
                            ]
                        ).map(({ id, label, icon: Icon }) => {
                            const active = tab === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setTab(id)}
                                    className={`inline-flex items-center gap-2 rounded-t-lg border border-b-0 px-3.5 py-2 text-xs font-black uppercase tracking-wider transition ${
                                        active
                                            ? 'border-border bg-card text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-primary'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid xl:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="p-5">
                            {tab === 'data' && (
                                <>
                                    <div className="mb-5 grid gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
                                        <span className="bali-text grid h-12 w-12 place-items-center rounded-lg bg-background text-3xl text-primary">
                                            {currentGlyph || '·'}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded bg-primary/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary">
                                                    {form.data.category || 'Belum dipilih'}
                                                </span>
                                                {form.data.svg_url && (
                                                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-emerald-600">
                                                        SVG aktif
                                                    </span>
                                                )}
                                                {form.data.is_premium && (
                                                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-amber-600">
                                                        <Sparkles className="h-3 w-3" />
                                                        Premium
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-2 truncate font-bold">{form.data.latin || form.data.name || 'Belum diisi'}</p>
                                            <p className="mt-0.5 break-all font-mono text-[0.62rem] text-muted-foreground/70">
                                                {currentSvgUrl || 'SVG belum ada — upload di bawah.'}
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                                        <FormField label="ID slug" error={form.errors.id}>
                                            <input
                                                className="input"
                                                value={form.data.id}
                                                onChange={(e) => form.setData('id', e.target.value)}
                                                disabled={!isNew}
                                                placeholder="anacaraka-ka-1B13"
                                            />
                                        </FormField>
                                        <FormField label="Nama" error={form.errors.name}>
                                            <input
                                                className="input"
                                                value={form.data.name}
                                                onChange={(e) => form.setData('name', e.target.value)}
                                                placeholder="Ka"
                                                required
                                            />
                                        </FormField>
                                        <FormField label="Aksara Bali">
                                            <input
                                                className="input bali-text text-2xl text-primary"
                                                value={form.data.char}
                                                onChange={(e) => form.setData('char', e.target.value)}
                                                maxLength={8}
                                            />
                                        </FormField>
                                        <FormField label="Latin" error={form.errors.latin}>
                                            <input
                                                className="input"
                                                value={form.data.latin}
                                                onChange={(e) => form.setData('latin', e.target.value)}
                                                placeholder="ka"
                                            />
                                        </FormField>
                                        <FormField label="Kategori" error={form.errors.category}>
                                            <select
                                                className="input"
                                                value={form.data.category}
                                                onChange={(e) => form.setData('category', e.target.value)}
                                            >
                                                {categories.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>
                                        <FormField label="Urutan">
                                            <input
                                                className="input"
                                                type="number"
                                                value={form.data.order}
                                                onChange={(e) => form.setData('order', Number(e.target.value))}
                                            />
                                        </FormField>
                                        <FormField label="Target goresan">
                                            <input
                                                className="input"
                                                type="number"
                                                min={0}
                                                max={30}
                                                value={form.data.target_stroke_count}
                                                onChange={(e) => form.setData('target_stroke_count', Number(e.target.value))}
                                            />
                                        </FormField>
                                        <label className="flex min-h-[42px] items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-bold">
                                            <input
                                                type="checkbox"
                                                checked={form.data.is_premium}
                                                onChange={(e) => form.setData('is_premium', e.target.checked)}
                                                className="h-4 w-4 accent-primary"
                                            />
                                            Konten premium
                                        </label>

                                        {/* SVG upload */}
                                        <div className="rounded-lg border border-border bg-muted/30 p-4 sm:col-span-2">
                                            <p className="text-[0.62rem] font-black uppercase tracking-wider text-muted-foreground">
                                                Upload SVG
                                            </p>
                                            <div className="mt-2 grid gap-2 lg:grid-cols-[1fr_auto] lg:items-end">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".svg,image/svg+xml"
                                                    onChange={handleFileChange}
                                                    className="block min-h-[42px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-black file:text-primary-foreground"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleUploadSvg}
                                                    disabled={uploading || !selectedItem || !svgFile}
                                                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-bold transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                                                >
                                                    {uploading ? (
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4" />
                                                    )}
                                                    Upload SVG
                                                </button>
                                            </div>
                                            <p className="mt-2 break-all text-xs text-muted-foreground/70">
                                                {svgFile
                                                    ? `File dipilih: ${svgFile.name} (${Math.round(svgFile.size / 1024)} KB)`
                                                    : currentSvgUrl || 'Belum ada SVG. Aksara harus disimpan dulu sebelum upload.'}
                                            </p>
                                        </div>

                                        <FormField label="Catatan" className="sm:col-span-2">
                                            <textarea
                                                className="input min-h-[90px] py-2.5"
                                                value={form.data.notes}
                                                onChange={(e) => form.setData('notes', e.target.value)}
                                                placeholder="Catatan pembelajaran atau konteks budaya"
                                                maxLength={1000}
                                            />
                                        </FormField>

                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:col-span-2"
                                        >
                                            {form.processing ? (
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {form.processing ? 'Menyimpan...' : 'Simpan aksara'}
                                        </button>

                                        {form.recentlySuccessful && (
                                            <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 sm:col-span-2">
                                                <Check className="h-3.5 w-3.5" />
                                                Tersimpan.
                                            </p>
                                        )}
                                    </form>
                                </>
                            )}

                            {tab === 'tool' && (
                                selectedItem && form.data.svg_url ? (
                                    <div>
                                        <p className="text-[0.62rem] font-black uppercase tracking-wider text-primary">
                                            Pola SVG aktif
                                        </p>
                                        <h3 className="mt-1 font-display text-lg font-bold">{selectedItem.name}</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Peragakan urutan goresan biar gampang verify pola SVG bener.
                                        </p>
                                        <div className="mt-4">
                                            <AksaraStrokePreview
                                                svgUrl={form.data.svg_url}
                                                glyph={form.data.char || selectedItem.char}
                                                size={300}
                                                durationMs={1800}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-primary/30 bg-muted/30 p-8 text-center">
                                        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                                            <PenTool className="h-5 w-5" />
                                        </span>
                                        <p className="mt-3 text-sm font-bold">
                                            {selectedItem ? 'SVG belum ada' : 'Pilih aksara dulu'}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {selectedItem
                                                ? 'Upload file SVG dari tab Data aksara, lalu balik ke sini buat preview animasi gores.'
                                                : 'Atau bikin aksara baru lewat tombol Baru, simpan dulu, lalu upload SVG.'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setTab('data')}
                                            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold transition hover:border-primary hover:text-primary"
                                        >
                                            Ke tab Data aksara
                                        </button>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Right preview aside */}
                        <aside className="border-t border-border bg-muted/30 p-5 xl:border-l xl:border-t-0">
                            <p className="text-[0.62rem] font-black uppercase tracking-wider text-primary">Preview</p>
                            <div className="mt-3">
                                <AksaraStrokePreview
                                    svgUrl={form.data.svg_url || null}
                                    glyph={currentGlyph || null}
                                    size={240}
                                    durationMs={1800}
                                />
                            </div>
                            <dl className="mt-4 divide-y divide-border rounded-lg border border-border bg-background text-sm">
                                <SummaryRow label="ID" value={form.data.id || '—'} />
                                <SummaryRow label="Kategori" value={form.data.category || '—'} />
                                <SummaryRow label="Goresan" value={String(form.data.target_stroke_count || 0)} />
                                <SummaryRow label="Akses" value={form.data.is_premium ? 'Premium' : 'Gratis'} />
                            </dl>
                        </aside>
                    </div>
                </section>
            </div>

            <style>{`
                .input {
                    min-height: 42px;
                    width: 100%;
                    border-radius: 0.5rem;
                    border: 1px solid hsl(var(--border));
                    background: hsl(var(--background));
                    padding: 0 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                }
                .input:focus { border-color: hsl(var(--primary)); outline: none; }
                .input:disabled { opacity: 0.6; }
                textarea.input { padding: 0.5rem 0.75rem; }
            `}</style>
        </AdminLayout>
    );
}

function FormField({
    label,
    error,
    className = '',
    children,
}: {
    label: string;
    error?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <label className={`grid gap-1.5 ${className}`}>
            <span className="text-[0.62rem] font-black uppercase tracking-wider text-muted-foreground">{label}</span>
            {children}
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="font-semibold text-muted-foreground">{label}</span>
            <span className="truncate font-bold">{value}</span>
        </div>
    );
}
