import { usePage } from '@inertiajs/react';
import { ShieldCheck, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface AdminStats {
    categories: number;
    aksara: number;
    users: number;
}

interface PageProps {
    adminStats?: AdminStats | null;
    [key: string]: unknown;
}

interface Props {
    /** Section title e.g. "Ringkasan", "Pengguna", "Konten aksara". */
    title: string;
    /** Section description — match dgn sectionMeta di app/admin/page.jsx Next.js. */
    description?: string;
    /** Eyebrow label. Default "Admin". */
    eyebrow?: string;
    /** Eyebrow icon. Default ShieldCheck (match Next.js). */
    icon?: LucideIcon;
    /** Override: kalau tidak set, baca dari Inertia share `adminStats`. Set null untuk hide. */
    stats?: AdminStats | null;
    /** Tombol/aksi opsional di kanan atas (sebelum stats box). */
    actions?: ReactNode;
}

/**
 * Header admin yg konsisten — match dengan pattern Next.js app/admin/page.jsx:
 * eyebrow + ShieldCheck icon + title + description + right-side 3-stat box (Kategori/Aksara/Akun).
 *
 * Stats di-share via HandleInertiaRequests middleware → tidak perlu di-pass per page.
 */
export function AdminPageHeader({
    title,
    description,
    eyebrow = 'Admin',
    icon: Icon = ShieldCheck,
    stats,
    actions,
}: Props) {
    const sharedStats = usePage<PageProps>().props.adminStats;
    const finalStats = stats !== undefined ? stats : sharedStats;

    return (
        <section className="mb-6 flex flex-col gap-4 border-b border-border pb-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                    <Icon className="h-4 w-4" />
                    {eyebrow}
                </p>
                <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-normal">{title}</h1>
                {description && (
                    <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
                {actions}
                {finalStats && (
                    <div className="grid grid-cols-3 overflow-hidden rounded border border-border bg-card text-sm shadow-[0_8px_22px_hsl(var(--foreground)/0.04)]">
                        <StatCell label="Kategori" value={finalStats.categories} divider />
                        <StatCell label="Aksara" value={finalStats.aksara} divider />
                        <StatCell label="Akun" value={finalStats.users} />
                    </div>
                )}
            </div>
        </section>
    );
}

function StatCell({ label, value, divider = false }: { label: string; value: number; divider?: boolean }) {
    return (
        <div className={`px-4 py-3 ${divider ? 'border-r border-border' : ''}`}>
            <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-muted-foreground/70">{label}</p>
            <p className="mt-1 text-xl font-black">{value}</p>
        </div>
    );
}
