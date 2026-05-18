import StudentLayout from '@/layouts/student-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Transaction {
    id: string;
    plan: string;
    amount: number;
    currency: string;
    status: 'pending' | 'success' | 'failed' | 'expired' | 'refunded';
    paid_at: string | null;
}

interface Snap {
    client_key: string | null;
    token: string | null;
    redirect_url: string | null;
    is_production: boolean;
}

interface Props {
    transaction: Transaction;
    snap: Snap;
}

declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                opts?: {
                    onSuccess?: (result: unknown) => void;
                    onPending?: (result: unknown) => void;
                    onError?: (result: unknown) => void;
                    onClose?: () => void;
                }
            ) => void;
        };
    }
}

const SNAP_SRC_SANDBOX = 'https://app.sandbox.midtrans.com/snap/snap.js';
const SNAP_SRC_PROD = 'https://app.midtrans.com/snap/snap.js';

function loadSnapScript(isProduction: boolean, clientKey: string | null): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.snap) return resolve();
        const src = isProduction ? SNAP_SRC_PROD : SNAP_SRC_SANDBOX;
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve());
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        if (clientKey) script.setAttribute('data-client-key', clientKey);
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Gagal load Snap.js'));
        document.head.appendChild(script);
    });
}

export default function PaymentShow({ transaction: initialTx, snap }: Props) {
    const [tx, setTx] = useState(initialTx);
    const [error, setError] = useState<string | null>(null);

    const pollStatus = useCallback(async () => {
        try {
            const res = await fetch(route('payment.status', { transaction: tx.id }), {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!res.ok) return;
            const data = await res.json();
            setTx((prev) => ({ ...prev, status: data.status, paid_at: data.paid_at }));
        } catch {
            // ignore
        }
    }, [tx.id]);

    useEffect(() => {
        if (tx.status === 'success' || tx.status === 'failed' || tx.status === 'expired') return;
        const interval = setInterval(pollStatus, 3000);
        return () => clearInterval(interval);
    }, [tx.status, pollStatus]);

    const handlePay = async () => {
        setError(null);
        if (!snap.token) {
            setError('Midtrans belum dikonfigurasi. Server admin perlu set GOOGLE_CLIENT_ID/MIDTRANS_SERVER_KEY di .env.');
            return;
        }
        try {
            await loadSnapScript(snap.is_production, snap.client_key);
            window.snap?.pay(snap.token, {
                onSuccess: () => router.reload(),
                onPending: () => pollStatus(),
                onError: () => setError('Pembayaran gagal. Coba lagi.'),
                onClose: () => pollStatus(),
            });
        } catch {
            setError('Tidak bisa load checkout Midtrans. Cek koneksi lalu refresh halaman.');
        }
    };

    const amountFmt = new Intl.NumberFormat('id-ID').format(tx.amount);

    return (
        <StudentLayout>
            <Head title={`Pembayaran ${tx.id} — Aksa Bali`} />

            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                    href={route('pricing')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke harga
                </Link>

                <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Pembayaran</p>
                    <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{tx.plan}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Order ID: <span className="font-mono">{tx.id}</span></p>

                    <div className="mt-6 flex items-baseline gap-3">
                        <span className="font-display text-2xl text-muted-foreground">{tx.currency === 'IDR' ? 'Rp' : tx.currency}</span>
                        <span className="font-display text-6xl font-medium leading-none tracking-[-0.03em]">{amountFmt}</span>
                    </div>

                    <div className="mt-6 flex items-center gap-2">
                        {tx.status === 'success' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Berhasil
                            </span>
                        )}
                        {tx.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-600">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Menunggu pembayaran
                            </span>
                        )}
                        {(tx.status === 'failed' || tx.status === 'expired') && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-sm font-bold text-destructive">
                                <XCircle className="h-4 w-4" />
                                {tx.status === 'expired' ? 'Kadaluarsa' : 'Gagal'}
                            </span>
                        )}
                    </div>

                    {tx.status === 'pending' && (
                        <button
                            type="button"
                            onClick={handlePay}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                        >
                            Bayar sekarang
                        </button>
                    )}

                    {tx.status === 'success' && (
                        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                            <p className="text-sm font-bold text-emerald-600">Premium aktif!</p>
                            <p className="mt-1 text-xs text-muted-foreground">Refresh halaman dashboard buat lihat fitur baru kebuka.</p>
                            <Link
                                href={route('dashboard')}
                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                            >
                                Ke dashboard
                            </Link>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>
                    )}

                    {!snap.token && tx.status === 'pending' && (
                        <p className="mt-3 text-xs text-muted-foreground">
                            Catatan: server belum diset key Midtrans. Hubungi admin untuk aktifkan pembayaran online.
                        </p>
                    )}
                </section>
            </div>
        </StudentLayout>
    );
}
