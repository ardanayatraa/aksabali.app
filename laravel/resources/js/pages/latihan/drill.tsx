import { PracticeCanvas } from '@/components/practice-canvas';
import StudentLayout from '@/layouts/student-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Headphones, Info, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    notes: string | null;
}

interface Props {
    aksara: Aksara;
}

/**
 * Parse SVG ref → array path d="..." string. Browser-only.
 */
async function loadReferencePaths(svgUrl: string | null): Promise<string[]> {
    if (!svgUrl) return [];
    try {
        const res = await fetch(svgUrl, { credentials: 'same-origin' });
        if (!res.ok) return [];
        const text = await res.text();
        const matches = text.match(/<path[^>]*\sd\s*=\s*"([^"]+)"/g) ?? [];
        return matches
            .map((m) => {
                const dMatch = m.match(/\sd\s*=\s*"([^"]+)"/);
                return dMatch ? dMatch[1].trim() : '';
            })
            .filter(Boolean);
    } catch {
        return [];
    }
}

export default function LatihanDrill({ aksara }: Props) {
    const [referencePaths, setReferencePaths] = useState<string[]>([]);

    useEffect(() => {
        loadReferencePaths(aksara.svg_url).then(setReferencePaths);
    }, [aksara.svg_url]);

    const playAudio = () => {
        const audio = new Audio(`/audio/${aksara.category}/${aksara.id}.mp3`);
        audio.play().catch(() => {});
    };

    const goNext = () => {
        // Visit /latihan untuk pilih aksara berikut manual.
        // (atau bisa di-extend: fetch next aksara dari API + router.visit)
        router.visit('/latihan');
    };

    return (
        <StudentLayout>
            <Head title={`${aksara.name} — Latihan`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href={route('latihan.index')}
                    className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Semua latihan
                </Link>

                <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[340px_1fr_300px]">
                    {/* Left aside: info card + audio + cultural context */}
                    <aside className="min-w-0 space-y-5">
                        <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
                                {aksara.category || 'Belum ada kategori'}
                            </p>
                            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                                <div className="min-w-0">
                                    <h1 className="text-5xl font-black">{aksara.latin || aksara.name}</h1>
                                    <p className="mt-2 font-semibold text-muted-foreground">{aksara.name}</p>
                                </div>
                                {aksara.char && (
                                    <span className="bali-text hidden shrink-0 text-8xl leading-none text-primary sm:block">
                                        {aksara.char}
                                    </span>
                                )}
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-2 text-center sm:grid-cols-4 sm:gap-3">
                                {[
                                    ['Pola', aksara.svg_url ? 'Siap' : '-'],
                                    ['SVG', referencePaths.length],
                                    ['Goresan', aksara.target_stroke_count || '-'],
                                    ['Tier', aksara.is_premium ? 'Premium' : 'Free'],
                                ].map(([label, value]) => (
                                    <div key={label} className="min-w-0 rounded-2xl bg-background px-1 py-4 sm:px-3">
                                        <p className="text-[0.56rem] font-black uppercase tracking-[0.04em] text-muted-foreground sm:text-xs sm:tracking-[0.12em]">
                                            {label}
                                        </p>
                                        <p className="mt-1 font-black">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
                            <div className="flex items-center gap-3">
                                <Headphones className="h-5 w-5 text-primary" />
                                <p className="font-black">Pengucapan</p>
                            </div>
                            <p className="mt-3 leading-7 text-muted-foreground">
                                Dengarkan bunyi aksara dan ulangi pelan-pelan sebelum mulai menulis.
                            </p>
                            <button
                                type="button"
                                onClick={playAudio}
                                className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                            >
                                <Volume2 className="h-4 w-4" />
                                Putar audio
                            </button>
                        </div>

                        <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
                            <div className="flex items-center gap-3">
                                <Info className="h-5 w-5 text-primary" />
                                <p className="font-black">Konteks budaya</p>
                            </div>
                            <p className="mt-3 leading-7 text-muted-foreground">
                                {aksara.notes || 'Catatan budaya untuk aksara ini akan tampil di sini.'}
                            </p>
                        </div>
                    </aside>

                    {/* Center: canvas */}
                    <section className="min-w-0">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Latihan stroke</p>
                                <h2 className="mt-1 text-2xl font-black">Ikuti stroke aktif pada kanvas</h2>
                            </div>
                            <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm font-bold shadow-soft">
                                <span className="rounded-full bg-primary px-4 py-2 text-primary-foreground">Panduan 3x3</span>
                                <span className="px-4 py-2 text-muted-foreground">Pola</span>
                            </div>
                        </div>
                        <PracticeCanvas
                            aksaraId={aksara.id}
                            glyph={aksara.char ?? ''}
                            label={aksara.latin || aksara.name}
                            referencePaths={referencePaths}
                            onNext={goNext}
                        />
                        <p className="mt-4 rounded-2xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary">
                            Skor dihitung dari bentuk, arah, posisi, panjang, dan kehalusan stroke.
                        </p>
                    </section>

                    {/* Right aside: detail + tips */}
                    <aside className="min-w-0 space-y-5">
                        <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Detail latihan</p>
                            <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
                                <p>Aksara: {aksara.id}</p>
                                <p>Target goresan: {aksara.target_stroke_count || 'belum tersedia'}</p>
                                <p>Pola: {aksara.svg_url ? 'tersedia' : 'belum tersedia'}</p>
                                <p>Progres latihan tersimpan otomatis saat kamu menyelesaikan stroke.</p>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-primary/15 bg-primary p-6 text-primary-foreground shadow-[0_18px_50px_hsl(var(--primary)/0.14)]">
                            <p className="font-black">Tips latihan</p>
                            <p className="mt-3 leading-7 text-primary-foreground/80">
                                Ikuti garis kuning dari awal sampai akhir. Pelan dulu, baru tambah kecepatan.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </StudentLayout>
    );
}
