import StudentLayout from '@/layouts/student-layout';
import { Head, useForm } from '@inertiajs/react';
import { Check, LoaderCircle, Sparkles } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Plan {
    id: string;
    name: string;
    amount: number;
    currency: string;
    promo_code?: string;
}

interface Props {
    plans: Plan[];
    currentTier: string | null;
}

const planFeatures: Record<string, string[]> = {
    lifetime: [
        '32 aksara dasar lengkap',
        'Bikin room game tanpa batas',
        'Statistik latihan tersimpan',
        'Sinkron web ↔ Android',
        'Update gratis, selamanya',
    ],
    only25k: [
        'Semua fitur Lifetime',
        'Harga promo buat pengguna awal',
        'Cuma sekali bayar',
        'Aktif langsung setelah bayar',
    ],
};

function formatIDR(amount: number): string {
    if (amount >= 1_000_000) return `Rp ${Math.round(amount / 100_000) / 10}jt`;
    if (amount >= 1_000) return `Rp ${Math.round(amount / 1_000)}rb`;
    return `Rp ${amount}`;
}

export default function Pricing({ plans, currentTier }: Props) {
    const [pickedPlan, setPickedPlan] = useState<string | null>(null);
    const form = useForm({ plan: '' });

    const isPremium = currentTier === 'premium' || currentTier === 'lite';

    const submit = (planId: string): FormEventHandler => (e) => {
        e.preventDefault();
        setPickedPlan(planId);
        form.transform((data) => ({ ...data, plan: planId }));
        form.post(route('payment.checkout'));
    };

    return (
        <StudentLayout>
            <Head title="Harga — Aksa Bali" />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <section className="text-center">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Harga</p>
                    <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                        Coba dulu gratisnya. <em className="italic text-primary">Upgrade kalau cocok.</em>
                    </h1>
                    <p className="mt-3 mx-auto max-w-xl text-base leading-7 text-muted-foreground">
                        Materi dasar gratis selamanya. Premium sekali bayar, dipake selamanya.
                    </p>
                </section>

                {isPremium && (
                    <section className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
                        <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600">
                            <Sparkles className="h-3.5 w-3.5" />
                            Kamu sudah Premium
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">Akses penuh semua materi & fitur sudah aktif.</p>
                    </section>
                )}

                <section className="mt-10 grid gap-6 lg:grid-cols-2">
                    {plans.map((plan) => {
                        const features = planFeatures[plan.id] ?? [];
                        const isPromo = !!plan.promo_code;
                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-[20px] p-7 transition hover:-translate-y-1 sm:px-9 ${
                                    isPromo
                                        ? 'border-2 border-primary bg-gradient-to-b from-background to-card shadow-[0_20px_50px_hsl(var(--primary)/0.12)]'
                                        : 'border border-border bg-card hover:shadow-[0_16px_40px_hsl(var(--foreground)/0.08)]'
                                }`}
                            >
                                {isPromo && (
                                    <div className="absolute -top-3 left-9 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                                        Paling Populer
                                    </div>
                                )}
                                <div className="font-display text-2xl font-semibold tracking-[-0.01em]">{plan.name}</div>
                                <p className="mt-2 text-sm text-muted-foreground">Akses penuh, sekali bayar</p>
                                <div className="mt-6 flex items-baseline gap-2">
                                    <span className="font-display text-2xl text-muted-foreground">{plan.currency === 'IDR' ? 'Rp' : plan.currency}</span>
                                    <span className="font-display text-6xl font-medium leading-none tracking-[-0.03em]">
                                        {plan.amount >= 1000 ? Math.round(plan.amount / 1000) : plan.amount}
                                    </span>
                                    {plan.amount >= 1000 && <span className="font-display text-2xl text-muted-foreground">rb</span>}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">Sekali bayar, dipake selamanya</p>
                                <ul className="mt-7 grid gap-3 border-t border-border pt-7">
                                    {features.map((feature) => (
                                        <li key={feature} className="flex gap-3 text-sm text-foreground">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <form onSubmit={submit(plan.id)}>
                                    <button
                                        type="submit"
                                        disabled={isPremium || (form.processing && pickedPlan === plan.id)}
                                        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-3.5 text-sm font-semibold transition disabled:opacity-60 ${
                                            isPromo
                                                ? 'bg-primary text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90'
                                                : 'border border-border text-foreground hover:border-primary hover:text-primary'
                                        }`}
                                    >
                                        {form.processing && pickedPlan === plan.id ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : null}
                                        {isPremium
                                            ? 'Sudah aktif'
                                            : form.processing && pickedPlan === plan.id
                                              ? 'Memproses...'
                                              : `Ambil ${plan.name}`}
                                    </button>
                                </form>
                                <p className="mt-2 text-center text-xs text-muted-foreground">{formatIDR(plan.amount)}</p>
                            </div>
                        );
                    })}
                </section>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    Harga promo buat pengguna awal. Premium langsung aktif setelah bayar.
                </p>
            </div>
        </StudentLayout>
    );
}
