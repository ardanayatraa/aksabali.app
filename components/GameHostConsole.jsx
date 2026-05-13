"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Clipboard, Gamepad2, PauseCircle, Play, RotateCcw, Trophy, UsersRound } from "lucide-react";

function normalizePin(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}

function statusLabel(status) {
  if (status === "live") return "Live";
  if (status === "finished") return "Selesai";
  return "Lobby";
}

const QUESTION_CATEGORIES = [
  { id: "semua", name: "Semua Aksara", meta: "59 item" },
  { id: "anacaraka", name: "Anacaraka", meta: "18 dasar" },
  { id: "swara", name: "Pangangge Suara", meta: "6 sandangan vokal" },
  { id: "angka", name: "Angka Bali", meta: "10 angka" },
  { id: "gabungan-vokal", name: "Gabungan Huruf + Vokal", meta: "16 suku kata" },
  { id: "kata", name: "Kata Aksara", meta: "10 kata" },
  { id: "dasar-campur", name: "Dasar Campur", meta: "anacaraka + swara + angka" }
];

export function GameHostConsole({ initialSession = null }) {
  const [session, setSession] = useState(initialSession);
  const [title, setTitle] = useState("Game Aksa Bali");
  const [mode, setMode] = useState("acak");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(["semua"]);
  const [questionCount, setQuestionCount] = useState(10);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(20);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const pin = session?.pin ? normalizePin(session.pin) : "";
  const question = session?.currentQuestion;
  const questionIndex = Number(session?.current_question_index || 0) + 1;
  const maxQuestion = Number(session?.question_count || 0);
  const leaderboard = useMemo(
    () => [...(session?.players || [])].sort((a, b) => Number(b.score || 0) - Number(a.score || 0)),
    [session?.players]
  );
  const refresh = useCallback(async () => {
    if (!pin) return;
    const response = await fetch(`/api/mobile/v1/game/sessions/${pin}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload.data?.session) {
      setSession(payload.data.session);
    }
  }, [pin]);

  useEffect(() => {
    if (!pin) return undefined;
    const timer = setInterval(() => refresh().catch(() => {}), 2500);
    return () => clearInterval(timer);
  }, [pin, refresh]);

  async function createSession(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/mobile/v1/game/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, mode, questionCategories: selectedCategoryIds, questionCount, secondsPerQuestion })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Room belum bisa dibuat.");
      setSession(payload.data.session);
      setMessage("Room siap. Bagikan PIN ke siswa.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Room belum bisa dibuat.");
    } finally {
      setLoading(false);
    }
  }

  async function control(action) {
    if (!pin) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/mobile/v1/game/sessions/${pin}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Sesi belum bisa diatur.");
      setSession(payload.data.session);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sesi belum bisa diatur.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPin() {
    if (!pin) return;
    await navigator.clipboard?.writeText(pin).catch(() => {});
    setMessage("PIN disalin.");
  }

  function toggleCategory(categoryId) {
    setSelectedCategoryIds((current) => {
      if (categoryId === "semua") return ["semua"];
      const withoutAll = current.filter((id) => id !== "semua");
      const next = withoutAll.includes(categoryId)
        ? withoutAll.filter((id) => id !== categoryId)
        : [...withoutAll, categoryId];
      return next.length ? next : ["semua"];
    });
  }

  const activeCategoryText = selectedCategoryIds.includes("semua")
    ? "Semua kategori aktif"
    : selectedCategoryIds
        .map((id) => QUESTION_CATEGORIES.find((category) => category.id === id)?.name || id)
        .join(", ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-ink sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={createSession} className="rounded-[1.5rem] border border-ink/10 bg-rice/80 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)] backdrop-blur">
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-brick">
            <Gamepad2 className="h-4 w-4" />
            Host guru
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">Buat room game.</h1>
          <p className="mt-3 leading-7 text-muted-foreground/72">
            Guru membuat PIN, siswa masuk sebagai pemain, lalu guru mengatur jalannya soal.
          </p>

          <label className="mt-6 grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/60">Judul room</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-14 rounded-2xl border border-ink/10 bg-lontar px-4 font-bold outline-none focus:border-brick"
            />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/60">Mode</span>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className="h-14 rounded-2xl border border-ink/10 bg-lontar px-4 font-bold outline-none focus:border-brick"
              >
                <option value="acak">Acak</option>
                <option value="huruf">Huruf</option>
                <option value="kata">Kata</option>
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-ink/10 bg-lontar p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brick">Kategori soal</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground/72">
                  Centang satu atau beberapa kategori aksara.
                </p>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground/50">
                {activeCategoryText}
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              {QUESTION_CATEGORIES.map((category) => {
                const checked = selectedCategoryIds.includes(category.id);
                return (
                  <label
                    key={category.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition ${
                      checked
                        ? "border-brick/30 bg-rice text-ink"
                        : "border-ink/10 bg-rice/45 text-muted-foreground hover:border-brick/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category.id)}
                      className="mt-1 h-4 w-4 rounded border-brick accent-brick"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-black">{category.name}</span>
                      <span className="mt-1 block text-xs font-semibold leading-5 text-muted-foreground/60">{category.meta}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/60">Soal</span>
              <input
                type="number"
                min="1"
                max="50"
                value={questionCount}
                onChange={(event) => setQuestionCount(event.target.value)}
                className="h-14 rounded-2xl border border-ink/10 bg-lontar px-4 font-bold outline-none focus:border-brick"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/60">Detik</span>
              <input
                type="number"
                min="5"
                max="120"
                value={secondsPerQuestion}
                onChange={(event) => setSecondsPerQuestion(event.target.value)}
                className="h-14 rounded-2xl border border-ink/10 bg-lontar px-4 font-bold outline-none focus:border-brick"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-b-2 border-brick/80 bg-brick px-5 text-sm font-black text-primary-foreground transition hover:bg-brick/90 disabled:opacity-55"
          >
            {session ? "Buat room baru" : "Buat room"}
            <ArrowRight className="h-4 w-4" />
          </button>
          {message && (
            <p className="mt-4 rounded-2xl border border-ink/10 bg-lontar px-4 py-3 text-sm font-bold text-muted-foreground">
              {message}
            </p>
          )}
        </form>

        <div className="grid gap-6">
          <section className="rounded-[1.5rem] border border-ink/10 bg-rice/80 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)] backdrop-blur">
            {session ? (
              <>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">PIN siswa</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {String(pin).match(/.{1,3}/g)?.map((part) => (
                        <span key={part} className="rounded-3xl bg-brick px-6 py-4 text-5xl font-black tracking-[0.08em] text-primary-foreground sm:text-7xl">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={copyPin} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/10 bg-lontar px-4 text-sm font-black text-muted-foreground">
                      <Clipboard className="h-4 w-4" />
                      Salin PIN
                    </button>
                    <Link href={`/game/live?pin=${pin}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brick px-4 text-sm font-black text-primary-foreground">
                      Layar live
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-lontar p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/55">Status</p>
                    <p className="mt-2 text-2xl font-black">{statusLabel(session.status)}</p>
                  </div>
                  <div className="rounded-2xl bg-lontar p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/55">Pemain</p>
                    <p className="mt-2 text-2xl font-black">{session.players?.length || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-lontar p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/55">Soal</p>
                    <p className="mt-2 text-2xl font-black">{Math.min(questionIndex, maxQuestion || 1)}/{maxQuestion}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button type="button" onClick={() => control("start")} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brick px-4 text-sm font-black text-primary-foreground disabled:opacity-50">
                    <Play className="h-4 w-4" />
                    Mulai
                  </button>
                  <button type="button" onClick={() => control("previous")} disabled={loading || !session} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/10 bg-lontar px-4 text-sm font-black text-muted-foreground disabled:opacity-50">
                    Sebelumnya
                  </button>
                  <button type="button" onClick={() => control("next")} disabled={loading || !session} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/10 bg-lontar px-4 text-sm font-black text-muted-foreground disabled:opacity-50">
                    Berikutnya
                  </button>
                  <button type="button" onClick={() => control("finish")} disabled={loading || !session} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brick/20 bg-brick/10 px-4 text-sm font-black text-brick disabled:opacity-50">
                    <PauseCircle className="h-4 w-4" />
                    Selesai
                  </button>
                  <Link href={`/game/podium?pin=${pin}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 text-sm font-black text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    Podium
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-brick/20 bg-brick/10 p-5">
                <p className="font-black text-brick">Belum ada room aktif.</p>
                <p className="mt-2 leading-7 text-muted-foreground">Buat room dulu, lalu bagikan PIN ke siswa.</p>
              </div>
            )}
          </section>

          {session && (
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.5rem] border border-ink/10 bg-rice/80 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.06)] backdrop-blur">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-saffron">Soal aktif</p>
                {question ? (
                  <div className="mt-4">
                    <h2 className="text-2xl font-black">{question.prompt}</h2>
                    <div className="mt-5 grid place-items-center rounded-[1.25rem] bg-lontar p-6 screen-grid">
                      <p className="bali-text text-[8rem] leading-none text-brick">{question.glyph}</p>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {question.options?.map((option) => (
                        <div key={option} className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-lg font-black">
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 leading-7 text-muted-foreground">Soal muncul setelah room dibuat.</p>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-ink/10 bg-rice/80 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.06)] backdrop-blur">
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-saffron">
                  <UsersRound className="h-4 w-4" />
                  Pemain
                </p>
                <div className="mt-4 grid gap-2">
                  {leaderboard.length ? leaderboard.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between rounded-2xl bg-lontar px-4 py-3">
                      <span className="font-black">{index + 1}. {player.display_name}</span>
                      <span className="text-sm font-black text-brick">{player.score || 0}</span>
                    </div>
                  )) : (
                    <p className="leading-7 text-muted-foreground">Siswa yang masuk PIN akan muncul di sini.</p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
