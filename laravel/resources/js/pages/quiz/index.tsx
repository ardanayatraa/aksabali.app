import StudentLayout from '@/layouts/student-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpenText, Move, PenLine, Repeat2, Shuffle, Sparkles, Type } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface Props {
    stats: {
        totalMateri: number;
        totalSoal: number;
    };
}

const quizModes: Array<{
    id: string;
    title: string;
    description: string;
    badge: string;
    icon: LucideIcon;
}> = [
    {
        id: 'nyurat',
        title: 'Kuis Nyurat',
        description: 'Tulis aksara di kanvas, lalu recognition menilai stroke.',
        badge: 'Stroke',
        icon: PenLine,
    },
    {
        id: 'kata',
        title: 'Tebak Kata Bolak Balik',
        description: 'Aksara ke Latin, lalu Latin ke aksara.',
        badge: 'Kata',
        icon: Repeat2,
    },
    {
        id: 'huruf',
        title: 'Tebak Huruf Bolak Balik',
        description: 'Latih anacaraka, swara, dan angka dua arah.',
        badge: 'Huruf',
        icon: Type,
    },
    {
        id: 'match',
        title: 'Pencocokan Kata',
        description: 'Drag kata Latin ke kartu aksara yang cocok.',
        badge: 'Drag & drop',
        icon: Move,
    },
    {
        id: 'maca',
        title: 'Kuis Membaca Aksara Bali',
        description: 'Baca aksara Bali, ketik jawabannya.',
        badge: 'Maca',
        icon: BookOpenText,
    },
];

export default function QuizIndex({ stats }: Props) {
    return (
        <StudentLayout>
            <Head title="Kuis — Aksa Bali" />

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <section>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Kuis</p>
                    <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                        Asah pemahaman.
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                        Tebak aksara, padankan kata, sampai mode lawan kelas. Pilih satu untuk mulai.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-foreground/70">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] px-3 py-1">
                            <BookOpenText className="h-3.5 w-3.5 text-primary" />
                            {stats.totalMateri} materi
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] px-3 py-1">
                            <Move className="h-3.5 w-3.5 text-primary" />
                            ~{stats.totalSoal} soal di bank
                        </span>
                    </div>
                </section>

                {/* Quiz Global CTA — mode acak */}
                <section className="mt-8">
                    <Link
                        href="/quiz/acak"
                        className="group relative block overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-7 transition hover:border-primary/50 hover:bg-primary/[0.08]"
                    >
                        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/15 blur-2xl" />
                        <div className="relative flex flex-wrap items-center gap-5">
                            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                                <Shuffle className="h-7 w-7" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="inline-flex items-center gap-1.5 text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary">
                                    <Sparkles className="h-3 w-3" />
                                    Quiz Global
                                </p>
                                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                                    Soal acak dari semua kategori.
                                </h2>
                                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                                    15 soal random — anacaraka, swara, angka, gabungan vokal, dan kata aksara dicampur jadi satu. Bagus
                                    buat tes pemahaman menyeluruh.
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition group-hover:translate-x-0.5">
                                Mulai
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </Link>
                </section>

                {/* Mode tiles — sisa mode spesifik */}
                <section className="mt-6">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-foreground/45">Atau pilih mode spesifik</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {quizModes.map((mode) => {
                            const Icon = mode.icon;
                            return (
                                <Link
                                    key={mode.id}
                                    href={`/quiz/${mode.id}`}
                                    className="group rounded-2xl border border-border bg-card p-5 text-left text-foreground transition hover:border-primary/40"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-widest text-foreground/55">
                                            {mode.badge}
                                        </span>
                                    </div>
                                    <p className="mt-5 text-lg font-extrabold tracking-tight">{mode.title}</p>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{mode.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </StudentLayout>
    );
}
