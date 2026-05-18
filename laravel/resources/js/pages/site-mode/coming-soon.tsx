import { CP, glyph } from '@/lib/aksara-codepoints';
import { Head } from '@inertiajs/react';
import { Calendar, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    mode: string;
    launchAt: string;
}

function diffTo(launchAt: string): { days: number; hours: number; minutes: number; seconds: number; passed: boolean } {
    const target = new Date(launchAt).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        passed: false,
    };
}

export default function ComingSoon({ launchAt }: Props) {
    const [countdown, setCountdown] = useState(() => diffTo(launchAt));

    useEffect(() => {
        const interval = setInterval(() => setCountdown(diffTo(launchAt)), 1000);
        return () => clearInterval(interval);
    }, [launchAt]);

    const dateFmt = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(launchAt));

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
            <Head title="Coming Soon — Aksa Bali" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.10),transparent_40%),radial-gradient(circle_at_80%_70%,hsl(var(--tertiary)/0.06),transparent_42%)]" />

            <main className="relative z-10 mx-auto w-full max-w-2xl text-center">
                <span className="bali-text mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground">
                    {glyph(CP.akara)}
                </span>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-primary">Aksa Bali</p>
                <h1 className="mt-3 font-display text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
                    Segera tayang.
                </h1>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                    Aksa Bali — belajar nyurat aksara Bali. Web + Android, satu akun, sekali bayar.
                </p>

                {!countdown.passed ? (
                    <div className="mt-10 grid grid-cols-4 gap-3 sm:gap-5">
                        {[
                            { label: 'Hari', value: countdown.days },
                            { label: 'Jam', value: countdown.hours },
                            { label: 'Menit', value: countdown.minutes },
                            { label: 'Detik', value: countdown.seconds },
                        ].map((t) => (
                            <div key={t.label} className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                                <p className="font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl">
                                    {String(t.value).padStart(2, '0')}
                                </p>
                                <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">
                                    {t.label}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6">
                        <p className="text-sm font-bold text-primary">
                            Sudah waktunya. Refresh halaman atau cek lagi sebentar lagi.
                        </p>
                    </div>
                )}

                <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground/[0.04] px-4 py-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    Launch: <strong className="font-bold text-foreground">{dateFmt}</strong>
                </p>

                <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-left">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kabari aku saat tayang</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Mau jadi user awal? Email ke{' '}
                        <a href="mailto:hi@aksabali.app" className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
                            <Mail className="h-3.5 w-3.5" />
                            hi@aksabali.app
                        </a>
                        . Akan kami kabari + dapet harga spesial.
                    </p>
                </div>
            </main>
        </div>
    );
}
