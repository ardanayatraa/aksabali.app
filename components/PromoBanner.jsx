"use client";

import Link from "next/link";
import { Sparkles, X } from "lucide-react";

export function PromoBanner({ claimed, total, onDismiss }) {
  const remaining = Math.max(0, total - claimed);

  return (
    <div className="relative w-full bg-[#1A1A1A] text-white">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link
          href="/only25k"
          className="group flex flex-1 items-center gap-2 text-[13px] sm:text-sm"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-[#FCA5A5]" />
          <span className="min-w-0 truncate">
            <strong className="font-bold text-[#FCA5A5]">200 orang pertama</strong>
            <span className="mx-1.5">·</span>
            <span>Premium cuma Rp 25rb</span>
            <span className="mx-1.5 hidden sm:inline">·</span>
            <span className="hidden text-white/70 sm:inline">
              <strong className="font-bold text-white">{remaining}</strong> tersisa
            </span>
          </span>
          <span className="ml-auto shrink-0 whitespace-nowrap font-semibold text-[#FCA5A5] underline-offset-4 group-hover:underline">
            Lihat →
          </span>
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup banner promo"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
