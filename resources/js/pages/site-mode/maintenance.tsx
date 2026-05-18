import { CP, glyph } from '@/lib/aksara-codepoints';
import { Head } from '@inertiajs/react';
import { Wrench } from 'lucide-react';

export default function Maintenance() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
            <Head title="Sedang Maintenance — Aksa Bali" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.10),transparent_40%),radial-gradient(circle_at_80%_70%,hsl(var(--tertiary)/0.06),transparent_42%)]" />

            <main className="relative z-10 mx-auto w-full max-w-xl text-center">
                <span className="bali-text mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground">
                    {glyph(CP.akara)}
                </span>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-primary">Aksa Bali</p>
                <h1 className="mt-3 font-display text-5xl font-semibold leading-tight tracking-tight">Lagi maintenance.</h1>

                <div className="mx-auto mt-8 grid h-20 w-20 place-items-center rounded-2xl bg-amber-500/10">
                    <Wrench className="h-8 w-8 text-amber-600" />
                </div>

                <p className="mt-6 text-base leading-7 text-muted-foreground">
                    Kami lagi bebersih + nambah fitur. Bentar lagi balik — biasanya kurang dari 30 menit.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                    Kalau urgent banget, email{' '}
                    <a href="mailto:hi@aksabali.app" className="font-bold text-primary hover:underline">
                        hi@aksabali.app
                    </a>
                    . Suksma sabarnya.
                </p>
            </main>
        </div>
    );
}
