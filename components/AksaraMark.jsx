export function AksaraMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`bali-text grid place-items-center rounded-lg bg-brick font-bold text-primary-foreground shadow-line ${
          compact ? "h-9 w-9 text-xl" : "h-11 w-11 text-2xl"
        }`}
      >
        ᬅ
      </div>
      <div className="leading-tight">
        <div className="font-display text-xl font-semibold tracking-normal text-ink">
          Aksa Bali
        </div>
        <div className="-mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-brick">
          Aksabali App
        </div>
      </div>
    </div>
  );
}
