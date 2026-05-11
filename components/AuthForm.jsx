"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

function Field({ icon: Icon, label, children }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </span>
      <div className="flex min-h-14 w-full min-w-0 items-center gap-3 rounded-xl border border-ink/10 bg-rice px-4 shadow-[0_1px_0_hsl(var(--foreground)/0.05)] transition-within focus-within:border-brick focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.10)]">
        <Icon className="h-5 w-5 shrink-0 text-brick/75" />
        {children}
      </div>
    </label>
  );
}

export function AuthForm({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const requestedRole = searchParams.get("role");
  const [role, setRole] = useState(["admin", "pengajar"].includes(requestedRole) ? requestedRole : "siswa");
  const isRegister = mode === "register";
  const initialName = searchParams.get("name") || "";
  const initialEmail = searchParams.get("email") || "";
  const fallbackError = isRegister ? "Akun belum bisa dibuat. Cek lagi datanya." : "Email atau password belum cocok.";

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
      displayName: formData.get("displayName"),
      role: isRegister ? role : undefined,
      adminKey: isRegister && role === "admin" ? formData.get("adminKey") : undefined
    };

    try {
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || fallbackError);
      const user = body.data?.user;
      const fallbackPath = user?.role === "admin" ? "/admin" : user?.role === "pengajar" ? "/guru" : "/dashboard";
      router.push(searchParams.get("next") || fallbackPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 grid w-full min-w-0 gap-5">
      {isRegister && (
        <Field icon={UserRound} label="Nama">
          <input
            name="displayName"
            autoComplete="name"
            className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:text-muted-foreground/45"
            placeholder="Nama kamu"
            defaultValue={initialName}
            required
          />
        </Field>
      )}

      {isRegister && (
        <div className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/70">
            Tipe akun
          </span>
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-ink/10 bg-rice p-1">
            {[
              ["siswa", "Siswa"],
              ["pengajar", "Guru"],
              ["admin", "Admin"]
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`min-h-11 rounded-lg text-sm font-black transition ${
                  role === value ? "bg-brick text-primary-foreground" : "text-muted-foreground hover:bg-lontar"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Field icon={Mail} label="Email">
        <input
          type="email"
          name="email"
          autoComplete="email"
          className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:text-muted-foreground/45"
          placeholder="nama@email.com"
          defaultValue={initialEmail}
          required
        />
      </Field>

      {isRegister && role === "admin" && (
        <Field icon={ShieldCheck} label="Kode admin">
          <input
            name="adminKey"
            autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:text-muted-foreground/45"
            placeholder="Kode undangan admin"
          />
        </Field>
      )}

      <Field icon={LockKeyhole} label="Password">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={8}
          className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:text-muted-foreground/45"
          placeholder="Minimal 8 karakter"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-lontar hover:text-brick"
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </Field>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-bold leading-6 text-destructive">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="focus-ring mt-1 min-h-14 w-full rounded-xl border-b-2 border-brick/80 bg-brick px-5 py-3 text-base font-black text-primary-foreground shadow-[0_12px_28px_hsl(var(--primary)/0.18)] transition hover:-translate-y-0.5 hover:bg-brick/90 active:translate-y-0.5 active:border-b disabled:cursor-not-allowed disabled:opacity-55"
      >
        {loading ? "Sebentar..." : isRegister ? "Buat akun" : "Masuk"}
      </button>
    </form>
  );
}
