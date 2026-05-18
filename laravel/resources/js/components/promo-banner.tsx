import { Link } from '@inertiajs/react';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'promo-only25k-dismissed';

interface Props {
    claimed?: number;
    total?: number;
}

/**
 * PromoBanner — fixed top, sticky. Tambah `html.promo-visible` class supaya nav + main
 * bisa adjust offset-nya via CSS (top-11 sm:top-10 di nav, pt-32 di main).
 */
export function PromoBanner({ claimed = 47, total = 100 }: Props) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            const dismissed = window.localStorage.getItem(STORAGE_KEY);
            const isVisible = dismissed !== '1';
            setVisible(isVisible);
            document.documentElement.classList.toggle('promo-visible', isVisible);
        } catch {
            setVisible(true);
            document.documentElement.classList.add('promo-visible');
        }
        return () => {
            document.documentElement.classList.remove('promo-visible');
        };
    }, []);

    const dismiss = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            /* noop */
        }
        setVisible(false);
        document.documentElement.classList.remove('promo-visible');
    };

    if (!visible) return null;

    const remaining = Math.max(0, total - claimed);

    return (
        <div className="fixed inset-x-0 top-0 z-50 bg-primary text-primary-foreground">
            <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
                <Link href="/only25k" className="flex min-w-0 items-center gap-2.5 text-xs font-bold sm:text-sm">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                    <span className="hidden sm:inline">Promo:</span>
                    <span className="truncate">
                        <strong className="font-black">Premium Rp 25rb</strong> ·{' '}
                        <span className="opacity-90">
                            {remaining} slot tersisa dari {total}
                        </span>
                    </span>
                    <span className="hidden shrink-0 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-widest sm:inline">
                        Klik
                    </span>
                </Link>
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Tutup banner promo"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-primary-foreground/80 transition hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
