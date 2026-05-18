import { Head, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import AuthLayout from '@/layouts/auth-layout';

function GoogleLogo() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.85 0-5.27-1.93-6.13-4.52H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.87 14.11c-.22-.66-.34-1.36-.34-2.11s.12-1.45.34-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.69-2.84z"
            />
            <path
                fill="#EA4335"
                d="M12 5.42c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.69 2.84C6.73 7.35 9.15 5.42 12 5.42z"
            />
        </svg>
    );
}

interface LoginProps {
    status?: string;
    next?: string | null;
}

export default function Login({ status, next }: LoginProps) {
    const [loading, setLoading] = useState(false);
    const { props } = usePage<{ errors: Record<string, string> }>();
    const googleError = (props.errors as Record<string, string>)?.google;
    const authError = (props.errors as Record<string, string>)?.auth;

    function handleClick() {
        setLoading(true);
        const url = next
            ? `${route('auth.google.redirect')}?next=${encodeURIComponent(next)}`
            : route('auth.google.redirect');
        window.location.href = url;
    }

    return (
        <AuthLayout
            title="Masuk."
            description="Khusus siswa & pelajar. Login pakai akun Google — akun baru otomatis dibuat."
        >
            <Head title="Masuk" />

            <div className="mt-2 grid gap-4">
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={loading}
                    className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-input bg-background px-5 text-base font-bold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
                >
                    {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <GoogleLogo />}
                    <span>{loading ? 'Mengarahkan...' : 'Lanjut dengan Google'}</span>
                </button>

                {(googleError || authError) && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-bold leading-6 text-destructive">
                        {googleError || authError}
                    </div>
                )}

                {status && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-600">
                        {status}
                    </div>
                )}

                <p className="text-muted-foreground text-center text-xs leading-6">
                    Dengan masuk, kamu setuju dengan{' '}
                    <a href="/terms" className="font-bold text-primary hover:underline">
                        syarat
                    </a>{' '}
                    dan{' '}
                    <a href="/privacy" className="font-bold text-primary hover:underline">
                        kebijakan privasi
                    </a>{' '}
                    Aksa Bali.
                </p>
            </div>
        </AuthLayout>
    );
}
