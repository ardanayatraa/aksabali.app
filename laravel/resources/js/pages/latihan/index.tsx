import StudentLayout from '@/layouts/student-layout';
import { Head, Link } from '@inertiajs/react';
import { BookOpenText, Hash, Layers, Library, PenLine, Type } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface Aksara {
    id: string;
    name: string;
    char: string | null;
    latin: string;
    category: string;
    is_premium: boolean;
    svg_url: string | null;
    image_url: string | null;
    target_stroke_count: number;
}

interface Props {
    catalog: Aksara[];
}

const practiceModes: Array<{
    id: string;
    title: string;
    badge: string;
    description: string;
    href: string;
    icon: LucideIcon;
}> = [
    {
        id: 'nyurat',
        title: 'Nyurat',
        badge: 'Stroke',
        description: 'Tulis di kanvas, sistem cek bentuknya.',
        href: '/latihan/nyurat',
        icon: PenLine,
    },
    {
        id: 'huruf',
        title: 'Huruf',
        badge: 'Anacaraka',
        description: 'Hafalin bentuk dasar ha na ca ra ka.',
        href: '/latihan/huruf',
        icon: Type,
    },
    {
        id: 'swara',
        title: 'Pangangge',
        badge: 'Sandangan',
        description: 'Ulu, suku, taleng, pepet, tedung — sandangan vokal yang nempel ke konsonan.',
        href: '/latihan/swara',
        icon: Library,
    },
    {
        id: 'angka',
        title: 'Angka',
        badge: '0–9',
        description: 'Angka Bali dari nol sampai sembilan.',
        href: '/latihan/angka',
        icon: Hash,
    },
    {
        id: 'kata',
        title: 'Kata',
        badge: 'Kata',
        description: 'Kata Latin dan aksara Bali bersisian.',
        href: '/latihan/kata',
        icon: Layers,
    },
    {
        id: 'membaca',
        title: 'Membaca',
        badge: 'Maca',
        description: 'Baca aksara dulu, cek bacaannya.',
        href: '/latihan/membaca',
        icon: BookOpenText,
    },
];

export default function LatihanIndex({ catalog }: Props) {
    const withPattern = catalog.filter((item) => item.svg_url);

    return (
        <StudentLayout>
            <Head title="Latihan — Aksa Bali" />

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <section>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Latihan</p>
                    <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                        Pilih mode latihan.
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                        Mulai dari nyurat, huruf, swara, angka, kata, sampai membaca aksara Bali.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground/[0.04] px-3 py-1 text-xs font-bold text-foreground/70">
                        <BookOpenText className="h-3.5 w-3.5 text-primary" />
                        {withPattern.length} dari {catalog.length} aksara siap dilatih
                    </div>
                </section>

                <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {practiceModes.map((mode) => {
                        const Icon = mode.icon;
                        return (
                            <Link
                                key={mode.id}
                                href={mode.href}
                                className="group rounded-2xl border border-border bg-card p-5 text-foreground transition hover:border-primary/40"
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
                </section>
            </div>
        </StudentLayout>
    );
}
