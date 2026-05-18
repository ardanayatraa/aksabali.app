import { CP, glyph } from '@/lib/aksara-codepoints';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Gamepad2, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    prefillPin: string | null;
}

export default function GameLobby({ prefillPin }: Props) {
    const form = useForm({
        pin: prefillPin ?? '',
        display_name: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('game.join'));
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.10),transparent_40%),radial-gradient(circle_at_80%_70%,hsl(var(--tertiary)/0.06),transparent_42%)]" />
            <Head title="Gabung Game — Aksa Bali" />

            <div className="relative z-10 w-full max-w-md">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Link>

                <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-[0_24px_70px_hsl(var(--foreground)/0.10)] sm:p-8">
                    <div className="flex items-center gap-3">
                        <span className="bali-text grid h-12 w-12 place-items-center rounded-xl bg-primary text-2xl font-black text-primary-foreground">
                            {glyph(CP.akara)}
                        </span>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Gabung Game</p>
                            <h1 className="font-display text-2xl font-semibold tracking-tight">Punya PIN dari guru?</h1>
                        </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                        Masukin PIN 6 digit + nama panggilan kamu. Akun Google ga wajib — tamu juga bisa main.
                    </p>

                    <form onSubmit={submit} className="mt-6 grid gap-4">
                        <div>
                            <label htmlFor="pin" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                PIN 6 digit
                            </label>
                            <input
                                id="pin"
                                inputMode="numeric"
                                maxLength={6}
                                value={form.data.pin}
                                onChange={(e) => form.setData('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-3xl font-bold tracking-widest text-primary focus:border-primary focus:outline-none"
                                placeholder="000000"
                                autoFocus
                            />
                            {form.errors.pin && <p className="mt-1 text-xs text-destructive">{form.errors.pin}</p>}
                        </div>

                        <div>
                            <label
                                htmlFor="display_name"
                                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                            >
                                Nama panggilan
                            </label>
                            <input
                                id="display_name"
                                type="text"
                                maxLength={40}
                                value={form.data.display_name}
                                onChange={(e) => form.setData('display_name', e.target.value)}
                                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none"
                                placeholder="mis. Made / Ayu / Wira"
                            />
                            {form.errors.display_name && <p className="mt-1 text-xs text-destructive">{form.errors.display_name}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                        >
                            {form.processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Gamepad2 className="h-4 w-4" />}
                            {form.processing ? 'Gabung...' : 'Gabung room'}
                            {!form.processing && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Belum ada PIN? Bilang ke guru kamu buat bikin room di{' '}
                        <Link href={route('game.host')} className="font-bold text-primary hover:underline">
                            /game/host
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
