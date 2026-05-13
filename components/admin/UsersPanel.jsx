"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, ShieldCheck, ShieldOff, X } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "siswa", label: "Siswa" },
  { value: "pengajar", label: "Guru" },
  { value: "admin", label: "Admin" }
];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export function UsersPanel({ initialUsers = [], currentUserId = "" }) {
  const [users, setUsers] = useState(initialUsers);
  const [pendingAction, setPendingAction] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  function requestRoleChange(userId, newRole) {
    const user = users.find((u) => u.id === userId);
    if (!user || user.role === newRole) return;
    setError("");
    setPendingAction({ type: "role", user, value: newRole });
  }

  function requestStatusToggle(user) {
    const next = user.status === "suspended" ? "active" : "suspended";
    setError("");
    setPendingAction({ type: "status", user, value: next });
  }

  function cancelAction() {
    if (savingId) return;
    setPendingAction(null);
  }

  async function confirmAction() {
    if (!pendingAction) return;
    const { type, user, value } = pendingAction;
    setSavingId(user.id);
    setError("");
    try {
      const body = type === "role" ? { role: value } : { status: value };
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "Gagal menyimpan.");
      setUsers((current) =>
        current.map((u) => (u.id === user.id ? { ...u, ...json.data.user } : u))
      );
      setPendingAction(null);
    } catch (err) {
      setError(err?.message || "Gagal menyimpan.");
    } finally {
      setSavingId(null);
    }
  }

  if (!users.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#2A2520]/15 bg-[#FBF7EE] p-6 text-center text-sm font-bold text-[#4A3F37]/65">
        Belum ada pengguna terdaftar.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const isSuspended = user.status === "suspended";
          const saving = savingId === user.id;
          return (
            <div
              key={user.id}
              className={`grid gap-3 rounded-2xl border bg-[#FBF7EE] p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center ${
                isSuspended ? "border-amber-500/40 opacity-80" : "border-[#2A2520]/10"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-black">{user.display_name}</p>
                  {isSelf && (
                    <span className="rounded-full bg-[#2A2520]/[0.06] px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.12em] text-[#4A3F37]/65">
                      Kamu
                    </span>
                  )}
                  {isSuspended && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.12em] text-amber-700">
                      Suspended
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-[#4A3F37]/65">{user.email}</p>
                <p className="mt-1 text-[0.65rem] font-bold text-[#4A3F37]/45">
                  Daftar: {formatDate(user.created_at)}
                </p>
              </div>

              <select
                value={user.role}
                disabled={saving || isSelf}
                onChange={(event) => requestRoleChange(user.id, event.target.value)}
                className="min-h-9 rounded-md border border-[#2A2520]/15 bg-white px-2 text-xs font-bold text-[#2A2520] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <span
                className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.1em] ${
                  user.tier === "premium"
                    ? "bg-amber-500/15 text-amber-700"
                    : "bg-[#2A2520]/[0.06] text-[#4A3F37]/65"
                }`}
              >
                {user.tier || "free"}
              </span>

              <button
                type="button"
                onClick={() => requestStatusToggle(user)}
                disabled={saving || isSelf}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSuspended
                    ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25"
                    : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25"
                }`}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isSuspended ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  <ShieldOff className="h-3.5 w-3.5" />
                )}
                {isSuspended ? "Aktifkan" : "Suspend"}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-700">
          {error}
        </p>
      )}

      {pendingAction && (
        <ConfirmModal
          action={pendingAction}
          saving={Boolean(savingId)}
          onCancel={cancelAction}
          onConfirm={confirmAction}
        />
      )}
    </>
  );
}

function ConfirmModal({ action, saving, onCancel, onConfirm }) {
  const { type, user, value } = action;
  const isRoleChange = type === "role";
  const isSuspending = type === "status" && value === "suspended";
  const isUnsuspending = type === "status" && value === "active";
  const isRolePromote = isRoleChange && value === "admin";

  const title = isRoleChange
    ? `Ganti role ${user.display_name}?`
    : isSuspending
      ? `Suspend akun ${user.display_name}?`
      : `Aktifkan kembali ${user.display_name}?`;

  const body = isRolePromote
    ? `Jadikan ${user.email} sebagai admin. Dia akan punya akses penuh ke panel admin, kelola konten, ubah role user lain, dan toggle mode site. Pastikan kamu percaya.`
    : isRoleChange && value === "pengajar"
      ? `Ubah ${user.email} jadi guru. Dia bisa bikin room game kelas dan host sesi, tapi nggak bisa lagi pakai mode siswa.`
      : isRoleChange && value === "siswa"
        ? `Turunkan ${user.email} jadi siswa biasa. Dia kehilangan akses admin/guru kalau sebelumnya punya.`
        : isSuspending
          ? `${user.email} nggak akan bisa login sampai di-aktifkan kembali. Sesi yang lagi berjalan otomatis tertolak di request berikutnya.`
          : `${user.email} bisa login lagi seperti biasa.`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Tutup konfirmasi"
        onClick={() => (saving ? null : onCancel())}
        className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-ink/10 bg-rice p-5 shadow-[0_30px_80px_hsl(var(--foreground)/0.25)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                isSuspending
                  ? "bg-amber-500/15 text-amber-700"
                  : isUnsuspending
                    ? "bg-emerald-500/15 text-emerald-700"
                    : "bg-brick/10 text-brick"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-brick">
                Konfirmasi
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold leading-tight tracking-tight">
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (saving ? null : onCancel())}
            disabled={saving}
            aria-label="Tutup"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground/55 hover:bg-ink/[0.05] hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-ink/[0.08] bg-background p-4">
          <p className="text-sm leading-6 text-ink/80">{body}</p>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-ink/15 bg-rice px-4 text-sm font-bold text-ink/75 transition hover:border-ink/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isSuspending ? "bg-amber-600 hover:bg-amber-700" : "bg-brick hover:bg-brick/90"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan…
              </>
            ) : isSuspending ? (
              "Suspend akun"
            ) : isUnsuspending ? (
              "Aktifkan akun"
            ) : (
              "Ganti role"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
