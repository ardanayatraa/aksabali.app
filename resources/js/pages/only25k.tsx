import { CP, glyph } from '@/lib/aksara-codepoints';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check, Clock, Sparkles, Users } from 'lucide-react';

const features = [
    '32 aksara dasar lengkap',
    'Bikin room game tanpa batas',
    'Statistik latihan tersimpan',
    'Sinkron web ↔ Android',
    'Update gratis, selamanya',
    'Tanpa langganan bulanan',
];

const TOTAL_SLOTS = 100;
const CLAIMED_SLOTS = 47; // TODO: pull from DB (PaymentTransaction where promo_code='only25k' status=success)

export default function Only25kPromo() {
    const remaining = TOTAL_SLOTS - CLAIMED_SLOTS;
    const percent = Math.round((CLAIMED_SLOTS / TOTAL_SLOTS) * 100);

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <Head title="Promo Rp 25rb — Aksa Bali" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_60%)]" />

            <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
                <Link href="/" className="flex items-center gap-2.5 text-primary">
                    <span className="bali-text grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
                        {glyph(CP.akara)}
                    </span>
                    <span className="leading-tight">
                        <span className="block font-display text-lg font-semibold tracking-[-0.02em] text-foreground">Aksa Bali</span>
                    </span>
                </Link>
                <Link
                    href="/login"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                    Masuk
                </Link>
            </header>

            <main className="relative z-10 mx-auto max-w-3xl px-4 pt-8 pb-16 sm:px-6">
                <section className="text-center">
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
                        <Sparkles className="h-3 w-3" />
                        Promo terbatas
                    </p>
                    <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
                        Premium Aksa Bali.
                    </h1>
                    <h2 className="mt-3 font-display text-3xl font-medium italic leading-tight text-primary sm:text-4xl">
                        Cuma Rp 25rb. Untuk 100 pendaftar pertama.
                    </h2>
                    <p className="mt-6 mx-auto max-w-xl text-base leading-7 text-muted-foreground">
                        Sekali bayar, dipake selamanya. Web + Android, 32 aksara, statistik latihan, room game tanpa batas.
                    </p>
                </section>

                <section className="mt-12 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slot tersedia</p>
                        </div>
                        <p className="mt-3 font-display text-5xl font-bold tracking-tight text-primary">{remaining}</p>
                        <p className="mt-1 text-sm text-muted-foreground">dari {TOTAL_SLOTS} slot</p>
                        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{CLAIMED_SLOTS} sudah ambil</p>
                    </div>

                    <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <p className="text-xs font-bold uppercase tracking-wider text-primary">Harga promo</p>
                        </div>
                        <div className="mt-3 text-sm font-semibold text-muted-foreground line-through">Rp 250rb</div>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="font-display text-2xl text-muted-foreground">Rp</span>
                            <span className="font-display text-6xl font-bold leading-none tracking-tight text-primary">25</span>
                            <span className="font-display text-2xl text-muted-foreground">rb</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">Sekali bayar, dipake selamanya</p>
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Yang kamu dapet</p>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                        {features.map((f) => (
                            <li key={f} className="flex gap-3 text-sm text-foreground">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                {f}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-10 flex flex-col items-center gap-4">
                    <Link
                        href="/login?next=/harga"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_8px_24px_hsl(var(--primary)/0.30)]"
                    >
                        Ambil Premium Rp 25rb
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <p className="text-xs text-muted-foreground">
                        Login pakai Google. Tidak ada langganan, tidak ada penagihan ulang.
                    </p>
                </section>

                <p className="mt-12 text-center text-xs text-muted-foreground">
                    * Promo berlaku untuk 100 pendaftar pertama. Setelah kuota habis, harga normal Rp 49rb.
                </p>
            </main>
        </div>
    );
}
