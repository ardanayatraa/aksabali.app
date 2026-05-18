import { AdminPageHeader } from '@/components/admin-page-header';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { Gamepad2 } from 'lucide-react';

interface Session {
    id: number;
    pin: string;
    title: string;
    status: string;
    question_count: number;
    seconds_per_question: number;
    player_count: number;
    host_name: string | null;
    created_at: string | null;
}

interface Props {
    sessions: Session[];
}

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

const statusTone: Record<string, string> = {
    live: 'text-emerald-600',
    lobby: 'text-amber-600',
    finished: 'text-muted-foreground',
    closed: 'text-muted-foreground',
};

export default function AdminGame({ sessions }: Props) {
    return (
        <AdminLayout>
            <Head title="Game kelas — Admin" />

            <AdminPageHeader
                title="Sesi game kelas"
                description="Pantau room game yang pernah dibuat, PIN, status, jumlah soal, dan pemain."
                eyebrow="Game"
                icon={Gamepad2}
            />

            {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada sesi game.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-border text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="py-2 pr-3">Sesi</th>
                                <th className="py-2 pr-3">Host</th>
                                <th className="py-2 pr-3">PIN</th>
                                <th className="py-2 pr-3">Status</th>
                                <th className="py-2 pr-3">Soal / Pemain</th>
                                <th className="py-2">Dibuat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {sessions.map((s) => (
                                <tr key={s.id}>
                                    <td className="py-3 pr-3">
                                        <p className="font-bold">{s.title}</p>
                                    </td>
                                    <td className="py-3 pr-3 text-muted-foreground">{s.host_name || 'Guru'}</td>
                                    <td className="py-3 pr-3 font-mono text-xs">{s.pin}</td>
                                    <td className="py-3 pr-3">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${statusTone[s.status] ?? 'text-muted-foreground'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-3 text-xs">
                                        {s.question_count} soal · {s.player_count} pemain
                                    </td>
                                    <td className="py-3 text-xs text-muted-foreground">{fmtDate(s.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
