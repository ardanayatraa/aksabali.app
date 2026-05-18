import { AdminPageHeader } from '@/components/admin-page-header';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';

interface Transaction {
    id: number;
    order_id: string;
    amount: number;
    plan: string | null;
    status: string;
    payment_type: string | null;
    display_name: string | null;
    email: string | null;
    created_at: string | null;
}

interface Props {
    transactions: Transaction[];
}

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

function fmtRp(n: number): string {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
}

const statusTone: Record<string, string> = {
    success: 'text-emerald-600',
    pending: 'text-amber-600',
    failed: 'text-destructive',
    expired: 'text-muted-foreground',
    refunded: 'text-muted-foreground',
};

export default function AdminPayments({ transactions }: Props) {
    return (
        <AdminLayout>
            <Head title="Pembayaran — Admin" />

            <AdminPageHeader
                title="Transaksi dan premium"
                description="Pantau transaksi paket belajar yang dibuat dari aplikasi."
                eyebrow="Pembayaran"
                icon={CreditCard}
            />

            {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada transaksi pembayaran.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-border text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="py-2 pr-3">Pengguna</th>
                                <th className="py-2 pr-3">Order</th>
                                <th className="py-2 pr-3">Paket</th>
                                <th className="py-2 pr-3">Metode</th>
                                <th className="py-2 pr-3">Status</th>
                                <th className="py-2 pr-3">Jumlah</th>
                                <th className="py-2">Dibuat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {transactions.map((t) => (
                                <tr key={t.id}>
                                    <td className="py-3 pr-3">
                                        <p className="font-bold">{t.display_name || t.email || 'Anonim'}</p>
                                        {t.email && t.display_name && (
                                            <p className="text-xs text-muted-foreground">{t.email}</p>
                                        )}
                                    </td>
                                    <td className="py-3 pr-3 font-mono text-xs text-muted-foreground">{t.order_id}</td>
                                    <td className="py-3 pr-3 text-xs">{t.plan ?? '—'}</td>
                                    <td className="py-3 pr-3 text-xs">{t.payment_type ?? '—'}</td>
                                    <td className="py-3 pr-3">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${statusTone[t.status] ?? 'text-muted-foreground'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-3 font-bold">{fmtRp(t.amount)}</td>
                                    <td className="py-3 text-xs text-muted-foreground">{fmtDate(t.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
