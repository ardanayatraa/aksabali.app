import { CP, glyph } from '@/lib/aksara-codepoints';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home } from 'lucide-react';

interface Props {
    status: number;
    title?: string;
    description?: string;
}

const defaultMessages: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Tidak diizinkan.',
        description: 'Halaman ini ga bisa kamu akses dgn akun yang sekarang. Coba login dengan akun lain atau kembali ke beranda.',
    },
    404: {
        title: 'Halaman tidak ditemukan.',
        description: 'Mungkin URL-nya salah ketik, atau halaman sudah dipindah. Cek lagi atau balik ke beranda.',
    },
    419: {
        title: 'Sesi kedaluwarsa.',
        description: 'Sesi kamu sudah expired. Coba refresh dan login lagi.',
    },
    500: {
        title: 'Ada yang error.',
        description: 'Server kami lagi bermasalah. Bentar lagi balik — kalau urgent, email hi@aksabali.app.',
    },
    503: {
        title: 'Sedang maintenance.',
        description: 'Kami lagi bebersih. Cek lagi sebentar lagi.',
    },
};

export default function ErrorPage({ status, title, description }: Props) {
    const meta = defaultMessages[status] ?? {
        title: 'Ada masalah.',
        description: 'Terjadi error tidak terduga. Coba refresh atau balik ke beranda.',
    };

    const finalTitle = title ?? meta.title;
    const finalDescription = description ?? meta.description;

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
            <Head title={`${status} — Aksa Bali`} />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.10),transparent_40%),radial-gradient(circle_at_80%_70%,hsl(var(--tertiary)/0.06),transparent_42%)]" />

            <main className="relative z-10 mx-auto w-full max-w-xl text-center">
                <span className="bali-text mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground">
                    {glyph(CP.akara)}
                </span>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-primary">Aksa Bali</p>
                <p className="mt-2 font-mono text-7xl font-bold tracking-tight text-primary/30">{status}</p>
                <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{finalTitle}</h1>
                <p className="mt-4 text-base leading-7 text-muted-foreground">{finalDescription}</p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                    >
                        <Home className="h-4 w-4" />
                        Beranda
                    </Link>
                </div>
            </main>
        </div>
    );
}
