import StudentLayout from '@/layouts/student-layout';
import { Head, Link } from '@inertiajs/react';
import { BookOpenText, Gamepad2, Puzzle, Sparkles } from 'lucide-react';

interface Profile {
    id: number;
    name: string;
    display_name: string;
    email: string;
    tier: string;
    role: string;
    avatar_url: string | null;
}

interface Stats {
    totalAttempts: number;
    averageScore: number;
    masteredAksara: number;
    weeklyAttempts: number;
    weeklyXp: number;
}

interface NextAksara {
    id: string;
    name: string;
    char: string | null;
    latin: string;
    category: string;
}

interface Props {
    profile: Profile;
    stats: Stats;
    nextAksara: NextAksara | null;
}

export default function Dashboard({ profile, stats, nextAksara }: Props) {
    const firstName = profile.display_name.split(' ')[0] ?? profile.display_name;
    const tierLabel = (profile.tier ?? 'free').toLowerCase();

    const statTiles = [
        { label: 'Total latihan', value: stats.totalAttempts, meta: 'sesi tersimpan' },
        { label: 'Skor rata-rata', value: stats.averageScore, meta: 'dari semua latihan' },
        { label: 'Aksara dikuasai', value: stats.masteredAksara, meta: 'lulus latihan' },
        { label: 'Minggu ini', value: stats.weeklyAttempts, meta: `+${stats.weeklyXp} XP` },
    ];

    return (
        <StudentLayout>
            <Head title="Dashboard — Aksa Bali" />

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Hero */}
                <section className="flex flex-col gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
                        Rahajeng semeng, {firstName}.
                    </p>
                    <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                        Lanjutkan latihanmu.
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] px-3 py-1 font-bold uppercase tracking-widest text-foreground/70">
                            Paket · {tierLabel}
                        </span>
                        {tierLabel === 'free' && (
                            <Link href={route('pricing')} className="font-bold text-primary hover:underline">
                                Upgrade →
                            </Link>
                        )}
                    </div>
                </section>

                {/* Stats — 1 card panjang dgn divider */}
                <section className="mt-10 rounded-2xl border border-border bg-card">
                    <div className="grid divide-border sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
                        {statTiles.map((stat, i) => (
                            <div
                                key={stat.label}
                                className={`px-6 py-5 ${i < statTiles.length - 1 ? 'border-b border-border sm:border-b-0' : ''} ${
                                    i === 1 ? 'sm:border-b sm:border-border lg:border-b-0' : ''
                                }`}
                            >
                                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                                <p className="mt-2 text-3xl font-extrabold tracking-tight">{stat.value}</p>
                                <p className="mt-1 text-xs font-semibold text-muted-foreground">{stat.meta}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Main: Lanjut belajar + Promo Premium */}
                <section className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                    {/* Lanjut belajar */}
                    <div className="rounded-2xl border border-border bg-card p-7">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary">Lanjut belajar</p>
                        <div className="mt-5 flex items-start justify-between gap-5">
                            <div className="min-w-0 flex-1">
                                <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
                                    {nextAksara?.name ?? 'Pilih aksara'}
                                </h2>
                                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                    Ikuti urutan goresan. Progres otomatis tersimpan.
                                </p>
                            </div>
                            <div className="bali-text grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-background text-6xl text-primary">
                                {nextAksara?.char ?? nextAksara?.latin ?? '?'}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <Link
                                href={nextAksara?.id ? `/latihan/${nextAksara.id}` : route('latihan.index')}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                            >
                                <BookOpenText className="h-4 w-4" />
                                Mulai
                            </Link>
                            <Link
                                href={route('quiz.index')}
                                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground/80 transition hover:border-foreground/40 hover:text-foreground"
                            >
                                <Puzzle className="h-4 w-4" />
                                Kuis
                            </Link>
                            <Link
                                href={route('game.lobby')}
                                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground/80 transition hover:border-foreground/40 hover:text-foreground"
                            >
                                <Gamepad2 className="h-4 w-4" />
                                Game
                            </Link>
                        </div>
                    </div>

                    {/* Promo Premium */}
                    {tierLabel === 'free' ? (
                        <div className="relative overflow-hidden rounded-2xl bg-primary p-7 text-primary-foreground">
                            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary-foreground/10 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-primary-foreground/5 blur-2xl" />

                            <div className="relative">
                                <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em]">
                                    <Sparkles className="h-3 w-3" />
                                    Promo
                                </p>
                                <h2 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight">
                                    Akses penuh, sekali bayar.
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-primary-foreground/80">
                                    <span className="line-through opacity-60">Rp 250rb</span>{' '}
                                    <span className="font-black text-primary-foreground">Rp 49rb</span> · 32 aksara, statistik harian,
                                    sertifikat per level.
                                </p>
                                <Link
                                    href={route('pricing')}
                                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-bold text-primary transition hover:scale-105"
                                >
                                    Ambil Premium
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-7">
                            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-500/10 blur-2xl" />
                            <div className="relative">
                                <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-amber-600">
                                    <Sparkles className="h-3 w-3" />
                                    Premium aktif
                                </p>
                                <h2 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-amber-700 dark:text-amber-400">
                                    Terima kasih, sayang!
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    Semua fitur kebuka. Selamat belajar — dan kasih tahu temanmu juga ya.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </StudentLayout>
    );
}
