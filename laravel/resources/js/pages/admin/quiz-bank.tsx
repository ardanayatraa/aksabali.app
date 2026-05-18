import { AdminPageHeader } from '@/components/admin-page-header';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { Puzzle } from 'lucide-react';

interface QuizMode {
    id: string;
    name: string;
    description: string;
}

interface QuizItem {
    id: string;
    latin: string;
    glyph: string | null;
    group: string;
}

interface QuizGroup {
    id: string;
    name: string;
    count: number;
    items: QuizItem[];
}

interface Props {
    modes: QuizMode[];
    groups: QuizGroup[];
}

export default function AdminQuizBank({ modes, groups }: Props) {
    return (
        <AdminLayout>
            <Head title="Bank kuis — Admin" />

            <AdminPageHeader
                title="Sumber soal untuk semua mode"
                description="Materi ini dipakai oleh kuis nyurat, tebak kata, tebak huruf, matching, membaca, dan mode acak."
                eyebrow="Bank kuis"
                icon={Puzzle}
            />

            <section>
                <h2 className="font-display text-xl font-bold tracking-tight">Mode kuis</h2>
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                    {modes.map((m) => (
                        <div key={m.id} className="rounded-2xl border border-border bg-card p-5">
                            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-primary">
                                {m.id}
                            </span>
                            <h3 className="mt-3 font-display text-lg font-bold tracking-tight">{m.name}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{m.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-10">
                <h2 className="font-display text-xl font-bold tracking-tight">
                    Materi per kategori <span className="text-sm font-medium text-muted-foreground">· {groups.length} grup</span>
                </h2>
                <div className="mt-3 grid gap-4 xl:grid-cols-2">
                    {groups.map((group) => (
                        <div key={group.id} className="rounded-2xl border border-border bg-card p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-primary">{group.id}</p>
                                    <h3 className="mt-1 font-display text-xl font-bold tracking-tight">{group.name}</h3>
                                </div>
                                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600">
                                    {group.count} item
                                </span>
                            </div>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                {group.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold">{item.latin}</p>
                                            <p className="truncate text-xs text-muted-foreground">{item.group}</p>
                                        </div>
                                        {item.glyph && (
                                            <span className="bali-text text-3xl leading-none text-primary">{item.glyph}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </AdminLayout>
    );
}
