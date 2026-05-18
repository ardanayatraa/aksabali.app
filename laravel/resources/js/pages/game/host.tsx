import StudentLayout from '@/layouts/student-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Gamepad2, LoaderCircle, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Existing {
    id: string;
    pin: string;
    title: string;
    status: 'lobby' | 'live' | 'finished' | 'expired';
    mode: string;
}

interface Props {
    existing: Existing | null;
}

const modeOptions = [
    { value: 'acak', label: 'Acak — campur semua kategori' },
    { value: 'huruf', label: 'Huruf — anacaraka, swara, angka' },
    { value: 'kata', label: 'Kata — Latin ↔ aksara' },
] as const;

export default function GameHost({ existing }: Props) {
    const form = useForm({
        title: 'Game Aksa Bali',
        mode: 'acak',
        question_count: 15,
        seconds_per_question: 20,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('game.host.store'));
    };

    return (
        <StudentLayout>
            <Head title="Host Game — Aksa Bali" />

            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
                <section>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Host</p>
                    <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Buat room game.</h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                        Bikin sesi kuis multiplayer buat kelas. Siswa join pakai PIN 6 digit yang muncul nanti.
                    </p>
                </section>

                {existing && (existing.status === 'lobby' || existing.status === 'live') && (
                    <section className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
                        <p className="inline-flex items-center gap-1.5 text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary">
                            <Sparkles className="h-3 w-3" />
                            Sesi aktif
                        </p>
                        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">{existing.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            PIN <strong className="font-mono font-bold text-primary">{existing.pin}</strong> · Status:{' '}
                            <span className="font-bold">{existing.status}</span>
                        </p>
                        <Link
                            href={route('game.host.console', { session: existing.id })}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                        >
                            Buka konsol
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </section>
                )}

                <form onSubmit={submit} className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="grid gap-5">
                        <div>
                            <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Judul sesi
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-primary focus:outline-none"
                                placeholder="Game Aksa Bali"
                            />
                            {form.errors.title && <p className="mt-1 text-xs text-destructive">{form.errors.title}</p>}
                        </div>

                        <div>
                            <label htmlFor="mode" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Mode soal
                            </label>
                            <select
                                id="mode"
                                value={form.data.mode}
                                onChange={(e) => form.setData('mode', e.target.value)}
                                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-primary focus:outline-none"
                            >
                                {modeOptions.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            {form.errors.mode && <p className="mt-1 text-xs text-destructive">{form.errors.mode}</p>}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="question_count"
                                    className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                                >
                                    Jumlah soal
                                </label>
                                <input
                                    id="question_count"
                                    type="number"
                                    min={5}
                                    max={30}
                                    value={form.data.question_count}
                                    onChange={(e) => form.setData('question_count', Number(e.target.value))}
                                    className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-primary focus:outline-none"
                                />
                                {form.errors.question_count && (
                                    <p className="mt-1 text-xs text-destructive">{form.errors.question_count}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="seconds_per_question"
                                    className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                                >
                                    Detik per soal
                                </label>
                                <input
                                    id="seconds_per_question"
                                    type="number"
                                    min={10}
                                    max={60}
                                    value={form.data.seconds_per_question}
                                    onChange={(e) => form.setData('seconds_per_question', Number(e.target.value))}
                                    className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-primary focus:outline-none"
                                />
                                {form.errors.seconds_per_question && (
                                    <p className="mt-1 text-xs text-destructive">{form.errors.seconds_per_question}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                    >
                        {form.processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Gamepad2 className="h-4 w-4" />}
                        {form.processing ? 'Bikin sesi...' : 'Bikin room'}
                    </button>
                </form>
            </div>
        </StudentLayout>
    );
}
