"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Gamepad2, Search, UsersRound } from "lucide-react";

function normalizePin(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}

export function GameJoinClient({ initialPin = "", initialSession = null, user }) {
  const router = useRouter();
  const [pin, setPin] = useState(normalizePin(initialPin || initialSession?.pin));
  const [displayName, setDisplayName] = useState(user?.display_name || "Siswa");
  const [session, setSession] = useState(initialSession);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function findSession(event) {
    event?.preventDefault();
    const safePin = normalizePin(pin);
    if (safePin.length !== 6) {
      setMessage("PIN harus 6 angka.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/mobile/v1/game/sessions/${safePin}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Sesi tidak ditemukan.");
      setSession(payload.data.session);
      router.replace(`/game/lobby?pin=${safePin}`);
    } catch (error) {
      setSession(null);
      setMessage(error instanceof Error ? error.message : "Sesi tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }

  async function joinSession() {
    const safePin = normalizePin(session?.pin || pin);
    if (safePin.length !== 6) {
      setMessage("PIN belum valid.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/mobile/v1/game/sessions/${safePin}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Belum bisa masuk room.");
      router.push(`/game/live?pin=${safePin}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Belum bisa masuk room.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-ink sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={findSession} className="rounded-[1.5rem] border border-ink/10 bg-rice/82 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)] backdrop-blur">
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-brick">
            <Gamepad2 className="h-4 w-4" />
            Game siswa
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight">Masuk pakai PIN.</h1>
          <p className="mt-3 max-w-xl leading-7 text-muted-foreground/72">
            Minta PIN dari guru, cek room, lalu masuk sebagai pemain.
          </p>

          <label className="mt-6 grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/60">PIN room</span>
            <input
              value={pin}
              onChange={(event) => setPin(normalizePin(event.target.value))}
              inputMode="numeric"
              placeholder="123456"
              className="h-16 rounded-2xl border border-ink/10 bg-lontar px-4 text-3xl font-black tracking-[0.16em] outline-none focus:border-brick"
            />
          </label>

          <label className="mt-4 grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/60">Nama pemain</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="h-14 rounded-2xl border border-ink/10 bg-lontar px-4 font-bold outline-none focus:border-brick"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-b-2 border-brick/80 bg-brick px-5 text-sm font-black text-primary-foreground transition hover:bg-brick/90 disabled:opacity-55"
          >
            <Search className="h-4 w-4" />
            Cek room
          </button>

          {message && (
            <p className="mt-4 rounded-2xl border border-ink/10 bg-lontar px-4 py-3 text-sm font-bold text-muted-foreground">
              {message}
            </p>
          )}
        </form>

        <section className="rounded-[1.5rem] border border-ink/10 bg-rice/82 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)] backdrop-blur">
          {session ? (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-saffron">Room ditemukan</p>
                  <h2 className="mt-2 font-display text-4xl font-semibold">{session.title}</h2>
                  <p className="mt-2 text-sm font-bold text-muted-foreground/65">Host: {session.host_name || "Guru"} - Status: {session.status}</p>
                </div>
                <button
                  type="button"
                  onClick={joinSession}
                  disabled={loading}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brick px-5 text-sm font-black text-primary-foreground disabled:opacity-55"
                >
                  Gabung
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-lontar p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/55">PIN</p>
                  <p className="mt-2 text-3xl font-black tracking-[0.12em] text-brick">{session.pin}</p>
                </div>
                <div className="rounded-2xl bg-lontar p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/55">Pemain</p>
                  <p className="mt-2 text-3xl font-black">{session.players?.length || 0}</p>
                </div>
                <div className="rounded-2xl bg-lontar p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/55">Soal</p>
                  <p className="mt-2 text-3xl font-black">{session.question_count || 0}</p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-lontar p-5">
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-brick">
                  <UsersRound className="h-4 w-4" />
                  Pemain masuk
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {session.players?.length ? session.players.map((player) => (
                    <div key={player.id} className="rounded-xl bg-rice px-4 py-3 font-black">{player.display_name}</div>
                  )) : (
                    <p className="text-sm font-semibold leading-7 text-muted-foreground/70">Belum ada pemain.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="grid h-full min-h-[300px] place-items-center rounded-2xl border border-brick/20 bg-brick/10 p-6 text-center">
              <div>
                <p className="font-display text-3xl font-semibold text-brick">Masukkan PIN dulu.</p>
                <p className="mt-2 leading-7 text-muted-foreground">Room dari guru akan muncul di sini.</p>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
