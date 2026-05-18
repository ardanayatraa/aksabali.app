import StudentLayout from '@/layouts/student-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Aksara {
    id: string;
    name: string;
    char: string | null;
    latin: string;
    category: string;
    is_premium: boolean;
}

interface Props {
    mode: string;
    catalog: Aksara[];
}

interface Question {
    aksara: Aksara;
    direction: 'aksara-to-latin' | 'latin-to-aksara';
    options: string[];
    answer: string;
}

const modeMeta: Record<string, { title: string; description: string; eyebrow: string }> = {
    acak: { eyebrow: 'Mode Acak', title: 'Mode Acak.', description: '15 soal random dari semua kategori.' },
    nyurat: { eyebrow: 'Nyurat', title: 'Kuis Nyurat.', description: 'Tulis aksara, sistem skor stroke-nya.' },
    kata: { eyebrow: 'Kata', title: 'Tebak Kata.', description: 'Aksara ↔ Latin bolak-balik.' },
    huruf: { eyebrow: 'Huruf', title: 'Tebak Huruf.', description: 'Anacaraka, swara, angka.' },
    match: { eyebrow: 'Pencocokan', title: 'Pencocokan Kata.', description: 'Drag Latin ke kartu aksara.' },
    maca: { eyebrow: 'Maca', title: 'Membaca Aksara.', description: 'Lihat aksara, ketik bacaannya.' },
};

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildQuestions(catalog: Aksara[], count: number = 10): Question[] {
    const pool = catalog.filter((a) => !a.is_premium && a.char);
    if (pool.length < 4) return [];

    const sample = shuffle(pool).slice(0, count);
    return sample.map((aksara) => {
        const direction: Question['direction'] = Math.random() < 0.5 ? 'aksara-to-latin' : 'latin-to-aksara';
        const wrongs = shuffle(pool.filter((a) => a.id !== aksara.id)).slice(0, 3);

        if (direction === 'aksara-to-latin') {
            const answer = aksara.latin;
            const options = shuffle([answer, ...wrongs.map((w) => w.latin)]);
            return { aksara, direction, options, answer };
        }
        const answer = aksara.char ?? aksara.latin;
        const options = shuffle([answer, ...wrongs.map((w) => w.char ?? w.latin)]);
        return { aksara, direction, options, answer };
    });
}

export default function QuizMode({ mode, catalog }: Props) {
    const meta = modeMeta[mode] ?? { eyebrow: mode, title: mode, description: '' };
    const [seed, setSeed] = useState(0);

    const questions = useMemo(() => {
        // mode `match` & `nyurat` butuh implementasi khusus — sementara fallback ke pilihan-ganda.
        const count = mode === 'acak' ? 15 : 10;
        return buildQuestions(catalog, count);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catalog, mode, seed]);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [picked, setPicked] = useState<string | null>(null);
    const [correct, setCorrect] = useState(0);
    const [done, setDone] = useState(false);

    const reset = () => {
        setSeed((s) => s + 1);
        setCurrentIdx(0);
        setPicked(null);
        setCorrect(0);
        setDone(false);
    };

    const handlePick = (opt: string) => {
        if (picked) return;
        setPicked(opt);
        if (opt === questions[currentIdx]?.answer) {
            setCorrect((c) => c + 1);
        }
    };

    const handleNext = () => {
        if (currentIdx + 1 >= questions.length) {
            setDone(true);
        } else {
            setCurrentIdx((i) => i + 1);
            setPicked(null);
        }
    };

    return (
        <StudentLayout>
            <Head title={`${meta.title} — Kuis`} />

            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                    href={route('quiz.index')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke kuis
                </Link>

                <section className="mt-6">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{meta.eyebrow}</p>
                    <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{meta.title}</h1>
                    <p className="mt-2 text-base leading-7 text-muted-foreground">{meta.description}</p>
                </section>

                {questions.length === 0 ? (
                    <section className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                        <p className="text-base font-bold text-foreground">Belum cukup materi.</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Catalog aksara perlu minimal 4 item buat generate soal. Coba lagi setelah CMS aksara diisi.
                        </p>
                    </section>
                ) : done ? (
                    <section className="mt-8 rounded-3xl border border-border bg-card p-8 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Selesai</p>
                        <h2 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight">
                            {correct} / {questions.length}
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            {correct === questions.length
                                ? 'Sempurna! Lanjut tantang mode lain.'
                                : correct >= questions.length / 2
                                  ? 'Lumayan! Bisa diulang lagi buat naikin skor.'
                                  : 'Yuk diulang — biar nempel.'}
                        </p>
                        <button
                            type="button"
                            onClick={reset}
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Ulang
                        </button>
                    </section>
                ) : (
                    <section className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                            <span>
                                Soal {currentIdx + 1} / {questions.length}
                            </span>
                            <span>Benar: {correct}</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                            />
                        </div>

                        <div className="mt-8 flex flex-col items-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {questions[currentIdx].direction === 'aksara-to-latin' ? 'Aksara ini bacanya?' : 'Aksara untuk Latin ini?'}
                            </p>
                            <div
                                className={`mt-4 ${
                                    questions[currentIdx].direction === 'aksara-to-latin' ? 'bali-text' : 'font-display'
                                } rounded-3xl bg-background px-10 py-6 text-7xl text-primary`}
                            >
                                {questions[currentIdx].direction === 'aksara-to-latin'
                                    ? questions[currentIdx].aksara.char
                                    : questions[currentIdx].aksara.latin}
                            </div>
                        </div>

                        <div className="mt-8 grid gap-2 sm:grid-cols-2">
                            {questions[currentIdx].options.map((opt) => {
                                const isAnswer = opt === questions[currentIdx].answer;
                                const isPicked = opt === picked;
                                let style = 'border-border bg-background hover:border-primary/40';
                                if (picked) {
                                    if (isAnswer) style = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600';
                                    else if (isPicked) style = 'border-destructive/60 bg-destructive/10 text-destructive';
                                    else style = 'border-border bg-background opacity-60';
                                }
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        disabled={!!picked}
                                        onClick={() => handlePick(opt)}
                                        className={`rounded-xl border px-4 py-3 text-left text-base font-medium transition ${style} ${
                                            questions[currentIdx].direction === 'latin-to-aksara' ? 'bali-text text-2xl' : ''
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>

                        {picked && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                            >
                                {currentIdx + 1 >= questions.length ? 'Lihat hasil' : 'Lanjut'}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        )}
                    </section>
                )}
            </div>
        </StudentLayout>
    );
}
