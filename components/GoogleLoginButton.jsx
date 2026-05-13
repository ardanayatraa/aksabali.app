"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

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

export function GoogleLoginButton({ next = "/dashboard" }) {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  function handleClick() {
    setLoading(true);
    window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}`;
  }

  return (
    <div className="mt-8 grid gap-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="focus-ring inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-ink/12 bg-rice px-5 text-base font-bold text-ink shadow-[0_2px_0_hsl(var(--foreground)/0.04)] transition hover:-translate-y-0.5 hover:border-brick/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
      >
        <GoogleLogo />
        <span>{loading ? "Mengarahkan..." : "Lanjut dengan Google"}</span>
      </button>

      {errorParam && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-bold leading-6 text-destructive">
          {errorParam}
        </div>
      )}

      <p className="text-center text-xs leading-6 text-muted-foreground">
        Dengan masuk, kamu setuju dengan{" "}
        <a href="/terms" className="font-bold text-brick hover:underline">
          syarat
        </a>{" "}
        dan{" "}
        <a href="/privacy" className="font-bold text-brick hover:underline">
          kebijakan privasi
        </a>{" "}
        Aksa Bali.
      </p>
    </div>
  );
}
