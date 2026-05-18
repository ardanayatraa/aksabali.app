import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Hourglass, Wrench } from 'lucide-react';

interface PageProps {
    siteMode?: string;
    [key: string]: unknown;
}

const meta: Record<string, { label: string; copy: string; tone: string; icon: typeof Wrench }> = {
    maintenance: {
        label: 'Maintenance aktif',
        copy: 'Publik lihat halaman maintenance. Admin bypass — kamu masih bisa akses semua. Switch ke Live di Pengaturan kalau udah selesai.',
        tone: 'border-destructive/40 bg-destructive/10 text-destructive',
        icon: Wrench,
    },
    coming_soon: {
        label: 'Coming Soon aktif',
        copy: 'Publik lihat landing countdown. Login & admin masih bisa diakses. Switch ke Live kalau udah siap launch.',
        tone: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        icon: Hourglass,
    },
    development: {
        label: 'Development mode',
        copy: 'Mode internal aktif — feature flag terbuka, behavior bisa beda dari production.',
        tone: 'border-tertiary/40 bg-tertiary/10 text-tertiary',
        icon: AlertTriangle,
    },
};

/**
 * Banner global untuk admin: tampil sticky kalau site_mode bukan 'live'.
 * Tujuan: admin sadar mode lagi aktif (karena admin selalu bypass gate-nya).
 */
export function SiteModeBanner() {
    const siteMode = usePage<PageProps>().props.siteMode;
    if (!siteMode || siteMode === 'live') return null;

    const m = meta[siteMode];
    if (!m) return null;

    const Icon = m.icon;
    return (
        <div className={`flex flex-wrap items-center gap-3 border-b px-4 py-2.5 text-sm font-semibold sm:px-6 lg:px-10 ${m.tone}`}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="font-black uppercase tracking-wider">{m.label}</span>
            <span className="min-w-0 flex-1 truncate font-medium opacity-90 sm:whitespace-normal sm:overflow-visible">{m.copy}</span>
            <Link
                href={route('admin.settings')}
                className="ml-auto rounded-full border border-current/30 px-3 py-1 text-xs font-bold uppercase tracking-wider transition hover:bg-current/10"
            >
                Pengaturan →
            </Link>
        </div>
    );
}
