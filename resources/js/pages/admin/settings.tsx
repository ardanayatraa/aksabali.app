import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    siteMode: string;
    launchAt: string;
    modes: string[];
}

const modeMeta: Record<string, { label: string; desc: string; chip: string }> = {
    live: { label: 'Live', desc: 'Semua halaman publik aktif normal.', chip: 'bg-emerald-500/10 text-emerald-600' },
    coming_soon: {
        label: 'Coming Soon',
        desc: 'Landing tampilkan countdown ke launch_at. Login & dashboard tetap bisa diakses oleh admin.',
        chip: 'bg-amber-500/10 text-amber-600',
    },
    maintenance: {
        label: 'Maintenance',
        desc: 'Semua halaman publik diblok dgn pesan. Hanya admin yang masih bisa masuk.',
        chip: 'bg-destructive/10 text-destructive',
    },
    development: {
        label: 'Development',
        desc: 'Mode internal — buat staging/preview. Mirip Live tapi feature flag aktif.',
        chip: 'bg-muted text-muted-foreground',
    },
};

export default function AdminSettings({ siteMode, launchAt, modes }: Props) {
    const form = useForm({
        site_mode: siteMode,
        launch_at: launchAt ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('admin.settings.site-mode'));
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan — Admin" />

            <section>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Pengaturan</p>
                <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">Site mode + launch.</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Ubah perilaku platform secara global. Cache 5 detik, jadi efek perubahan kira-kira hampir-langsung.
                </p>
            </section>

            <form onSubmit={submit} className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Site mode</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {modes.map((m) => {
                        const meta = modeMeta[m] ?? { label: m, desc: '', chip: 'bg-muted text-muted-foreground' };
                        const active = form.data.site_mode === m;
                        return (
                            <label
                                key={m}
                                className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition ${
                                    active ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/40'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="site_mode"
                                    value={m}
                                    checked={active}
                                    onChange={() => form.setData('site_mode', m)}
                                    className="sr-only"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="font-display text-lg font-bold tracking-tight">{meta.label}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${meta.chip}`}>
                                        {m}
                                    </span>
                                </div>
                                <p className="text-sm leading-6 text-muted-foreground">{meta.desc}</p>
                            </label>
                        );
                    })}
                </div>

                <div className="mt-6">
                    <label htmlFor="launch_at" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Launch date (untuk Coming Soon)
                    </label>
                    <input
                        id="launch_at"
                        type="datetime-local"
                        value={form.data.launch_at?.slice(0, 16) ?? ''}
                        onChange={(e) => form.setData('launch_at', e.target.value)}
                        className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none sm:w-80"
                    />
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                    {form.processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {form.processing ? 'Menyimpan...' : 'Simpan'}
                </button>

                {form.recentlySuccessful && (
                    <p className="mt-3 text-sm font-bold text-emerald-600">Tersimpan.</p>
                )}
            </form>
        </AdminLayout>
    );
}
