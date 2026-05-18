import StudentLayout from '@/layouts/student-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Lock } from 'lucide-react';

interface Aksara {
    id: string;
    name: string;
    char: string | null;
    latin: string;
    category: string;
    is_premium: boolean;
    svg_url: string | null;
    image_url: string | null;
    target_stroke_count: number;
}

interface Props {
    mode: string;
    catalog: Aksara[];
}

const modeMeta: Record<string, { title: string; description: string; eyebrow: string }> = {
    nyurat: {
        eyebrow: 'Nyurat',
        title: 'Mode Nyurat.',
        description: 'Pilih aksara, lalu tulis di kanvas. Sistem cek bentuk + arah goresan.',
    },
    huruf: {
        eyebrow: 'Huruf',
        title: 'Anacaraka.',
        description: 'Hafalin dulu 18 huruf wianjana. Klik salah satu buat masuk drill.',
    },
    swara: {
        eyebrow: 'Pangangge',
        title: 'Sandangan suara.',
        description: 'Ulu, suku, taleng, pepet, tedung — 6 pangangge yang nempel ke konsonan.',
    },
    angka: {
        eyebrow: 'Angka',
        title: 'Angka Bali 0–9.',
        description: 'Sepuluh digit angka Bali. Singkat tapi penting.',
    },
    kata: {
        eyebrow: 'Kata',
        title: 'Kata aksara.',
        description: 'Latihan baca + tulis kata Bali pendek.',
    },
    membaca: {
        eyebrow: 'Membaca',
        title: 'Baca aksara.',
        description: 'Lihat aksara, cek bacaannya dalam Latin.',
    },
};

export default function LatihanMode({ mode, catalog }: Props) {
    const meta = modeMeta[mode] ?? { eyebrow: mode, title: mode, description: '' };

    return (
        <StudentLayout>
            <Head title={`${meta.title} — Latihan`} />

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                    href={route('latihan.index')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke mode
                </Link>

                <section className="mt-6">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{meta.eyebrow}</p>
                    <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                        {meta.title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{meta.description}</p>
                </section>

                {catalog.length === 0 ? (
                    <section className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                        <p className="text-base font-bold text-foreground">Belum ada aksara di kategori ini.</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Materi sedang disiapkan. Sementara, coba mode lain dari halaman utama latihan.
                        </p>
                    </section>
                ) : (
                    <section className="mt-10 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {catalog.map((aksara) => (
                            <Link
                                key={aksara.id}
                                href={`/latihan/${aksara.id}`}
                                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-foreground transition hover:border-primary/40"
                            >
                                <div className="bali-text flex aspect-square w-full items-center justify-center rounded-xl bg-background text-5xl text-primary transition group-hover:scale-105">
                                    {aksara.char ?? aksara.latin}
                                </div>
                                <div className="flex w-full items-center justify-between gap-2">
                                    <span className="truncate text-sm font-bold">{aksara.name}</span>
                                    {aksara.is_premium && (
                                        <span title="Premium" className="text-primary">
                                            <Lock className="h-3.5 w-3.5" />
                                        </span>
                                    )}
                                </div>
                                <span className="w-full text-left text-xs text-muted-foreground">{aksara.latin}</span>
                            </Link>
                        ))}
                    </section>
                )}
            </div>
        </StudentLayout>
    );
}
