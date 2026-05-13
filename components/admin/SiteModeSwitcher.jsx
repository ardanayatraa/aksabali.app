"use client";

import { useEffect, useState } from "react";
import {
  CircleDot,
  Loader2,
  Megaphone,
  Pencil,
  Radio,
  Wrench,
  X
} from "lucide-react";

const MODES = [
  {
    id: "live",
    label: "Live",
    desc: "Site aktif normal untuk semua",
    longDesc:
      "Pengunjung bisa akses landing, latihan, kuis, game seperti biasa. Mode default.",
    icon: Radio,
    tone: "green"
  },
  {
    id: "coming_soon",
    label: "Coming soon",
    desc: "Countdown + promo, daftar minat",
    longDesc:
      "Pengunjung lihat countdown ke launching plus promo Rp 25rb buat 100 pertama. Admin tetap bisa kerja.",
    icon: Megaphone,
    tone: "blue"
  },
  {
    id: "maintenance",
    label: "Maintenance",
    desc: "Tampilkan pesan maintenance",
    longDesc:
      "Pengunjung lihat pesan singkat plus tombol refresh. Cocok pas ada perbaikan teknis.",
    icon: Wrench,
    tone: "orange"
  },
  {
    id: "development",
    label: "Development",
    desc: "Hanya user login yang lolos",
    longDesc:
      "Pengunjung tanpa session diarahin ke coming-soon. Cocok buat staging atau test internal.",
    icon: CircleDot,
    tone: "purple"
  }
];

const TONE_CLASSES = {
  green: "bg-emerald-500/10 text-emerald-600",
  blue: "bg-sky-500/10 text-sky-600",
  orange: "bg-amber-500/10 text-amber-600",
  purple: "bg-violet-500/10 text-violet-600"
};

export function SiteModeSwitcher() {
  const [mode, setMode] = useState("live");
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/site-mode");
        const json = await res.json();
        if (!alive) return;
        if (json?.success) setMode(json.data.mode);
      } catch {
        // keep default
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const activeMeta = MODES.find((m) => m.id === mode) || MODES[0];

  return (
    <>
      <div className="rounded border border-ink/10 bg-muted p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-brick">
            Mode site
          </p>
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/55" />
          ) : (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.1em] ${TONE_CLASSES[activeMeta.tone]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {activeMeta.label}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={loading}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-rice px-2 py-1.5 text-[0.7rem] font-bold text-muted-foreground transition hover:bg-rice hover:text-brick disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Pencil className="h-3 w-3" />
          Atur mode
        </button>
      </div>

      {pickerOpen && (
        <PickerModal
          currentMode={mode}
          onClose={() => setPickerOpen(false)}
          onSaved={(newMode) => {
            setMode(newMode);
            setPickerOpen(false);
          }}
        />
      )}
    </>
  );
}

function PickerModal({ currentMode, onClose, onSaved }) {
  const [selected, setSelected] = useState(currentMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  async function handleSave() {
    if (selected === currentMode) {
      onClose();
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/site-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: selected })
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "Gagal ganti mode.");
      onSaved(json.data.mode);
    } catch (err) {
      setError(err?.message || "Gagal ganti mode.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-picker-title"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={() => (saving ? null : onClose())}
        className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-ink/10 bg-rice p-5 shadow-[0_30px_80px_hsl(var(--foreground)/0.25)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-brick">
              Mode site
            </p>
            <h2 id="mode-picker-title" className="mt-1 font-display text-xl font-semibold tracking-tight">
              Pilih mode aktif
            </h2>
          </div>
          <button
            type="button"
            onClick={() => (saving ? null : onClose())}
            disabled={saving}
            aria-label="Tutup"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground/55 hover:bg-ink/[0.05] hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Pilih mode site">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = selected === m.id;
            const current = currentMode === m.id;
            return (
              <label
                key={m.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  active
                    ? "border-brick/40 bg-rice shadow-[0_4px_12px_hsl(var(--primary)/0.10)]"
                    : "border-ink/[0.08] bg-background/50 hover:border-ink/20"
                } ${saving ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  name="site-mode-picker"
                  value={m.id}
                  checked={active}
                  disabled={saving}
                  onChange={() => setSelected(m.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-brick"
                />
                <span
                  className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                    active ? TONE_CLASSES[m.tone] : "bg-ink/[0.05] text-muted-foreground/70"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`text-sm font-extrabold ${active ? "text-ink" : "text-muted-foreground"}`}>
                      {m.label}
                    </span>
                    {current && (
                      <span className="rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground/70">
                        Sekarang
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground/75">
                    {m.longDesc}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => (saving ? null : onClose())}
            disabled={saving}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-ink/15 bg-rice px-4 text-sm font-bold text-ink/75 transition hover:border-ink/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || selected === currentMode}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brick px-4 text-sm font-bold text-primary-foreground transition hover:bg-brick/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
