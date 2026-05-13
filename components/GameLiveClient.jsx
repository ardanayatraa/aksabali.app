"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, PauseCircle, Play, RotateCcw, Timer, Trophy, UsersRound, X } from "lucide-react";

function normalizePin(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}

function optionClass({ option, selected, result }) {
  if (!result) {
    return selected === option
      ? "border-brick bg-brick/10 text-ink"
      : "border-ink/10 bg-rice text-ink hover:border-brick/35";
  }
  if (result.correctOption === option) return "border-[#4A7C59] bg-[#4A7C59]/10 text-ink";
  if (selected === option) return "border-destructive bg-destructive/10 text-ink";
  return "border-ink/10 bg-rice/60 text-muted-foreground/65";
}

export function GameLiveClient({ initialSession = null, user }) {
  const [session, setSession] = useState(initialSession);
  const [answerState, setAnswerState] = useState({ questionKey: "", selected: "", result: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const startedAtRef = useRef(0);
  const elapsedMsRef = useRef(0);
  const pin = normalizePin(session?.pin);
  const isHost = user?.role === "pengajar";
  const isOwner = isHost && session?.host_id === user?.id;
  const isStudent = user?.role !== "pengajar" && user?.role !== "admin";
  const question = session?.currentQuestion;
  const questionKey = question ? `${question.id}-${session?.current_question_index}` : session?.status;
  const selected = answerState.questionKey === questionKey ? answerState.selected : "";
  const result = answerState.questionKey === questionKey ? answerState.result : null;
  const joined = useMemo(
    () => (session?.players || []).some((player) => player.user_id === user?.id),
    [session?.players, user?.id]
  );
  const leaderboard = useMemo(
    () => [...(session?.players || [])].sort((a, b) => Number(b.score || 0) - Number(a.score || 0)),
    [session?.players]
  );

  const refresh = useCallback(async () => {
    if (!pin) return;
    const response = await fetch(`/api/mobile/v1/game/sessions/${pin}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload.data?.session) setSession(payload.data.session);
  }, [pin]);

  useEffect(() => {
    if (!pin) return undefined;
    const timer = setInterval(() => refresh().catch(() => {}), 2000);
    return () => clearInterval(timer);
  }, [pin, refresh]);

  useEffect(() => {
    startedAtRef.current = typeof performance !== "undefined" ? performance.now() : 0;
    elapsedMsRef.current = 0;
    const timer = setInterval(() => {
      const current = typeof performance !== "undefined" ? performance.now() : 0;
      elapsedMsRef.current = Math.max(0, current - startedAtRef.current);
    }, 250);
    return () => clearInterval(timer);
  }, [questionKey]);

  async function control(action) {
    if (!pin || !isOwner) return;
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

  async function joinFromLive() {
    if (!pin) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/mobile/v1/game/sessions/${pin}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: user?.display_name || "Siswa" })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Belum bisa masuk room.");
      setSession(payload.data.session);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Belum bisa masuk room.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer(option) {
    if (!pin || !question || result || session?.status !== "live") return;
      setAnswerState({ questionKey, selected: option, result: null });
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/mobile/v1/game/sessions/${pin}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIndex: session.current_question_index,
          answer: option,
          elapsedMs: Math.max(0, Math.round(elapsedMsRef.current)),
          displayName: user?.display_name || "Siswa"
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Jawaban belum terkirim.");
      setAnswerState({ questionKey, selected: option, result: payload.data });
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Jawaban belum terkirim.");
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[1.5rem] border border-ink/10 bg-rice/82 p-8 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)]">
          <p className="font-display text-4xl font-semibold">Sesi tidak ditemukan.</p>
          <Link href={isHost ? "/game/host" : "/game/lobby"} className="mt-5 inline-flex rounded-xl bg-brick px-5 py-3 text-sm font-black text-primary-foreground">
            Kembali
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-ink sm:px-6 lg:px-8">
      <header className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brick">PIN {session.pin}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {isHost ? session.title : session.status === "lobby" ? "Tunggu guru mulai." : question?.prompt || "Soal belum siap"}
          </h1>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-rice/82 px-5 py-4 shadow-[0_12px_30px_hsl(var(--foreground)/0.06)]">
          <div className="flex items-center gap-3">
            <Timer className="h-6 w-6 text-brick" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/55">Durasi</p>
              <p className="text-3xl font-black">{session.seconds_per_question || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-rice/82 px-5 py-4 shadow-[0_12px_30px_hsl(var(--foreground)/0.06)]">
          <div className="flex items-center gap-3">
            <UsersRound className="h-6 w-6 text-brick" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/55">Pemain</p>
              <p className="text-3xl font-black">{session.players?.length || 0}</p>
            </div>
          </div>
        </div>
      </header>

      {message && (
        <p className="mt-5 rounded-2xl border border-ink/10 bg-rice/82 px-4 py-3 text-sm font-bold text-brick">
          {message}
        </p>
      )}

      {isHost && !isOwner && (
        <section className="mt-8 rounded-[1.5rem] border border-brick/20 bg-brick/10 p-6">
          <p className="font-black text-brick">Room ini dibuat guru lain.</p>
          <p className="mt-2 leading-7 text-muted-foreground">Hanya host pembuat room yang bisa mengatur sesi.</p>
        </section>
      )}

      {session.status === "finished" ? (
        <section className="mt-8 rounded-[1.5rem] border border-ink/10 bg-rice/82 p-8 text-center shadow-[0_18px_50px_hsl(var(--foreground)/0.07)]">
          <Trophy className="mx-auto h-12 w-12 text-saffron" />
          <h2 className="mt-4 font-display text-4xl font-semibold">Sesi selesai.</h2>
          <Link href={`/game/podium?pin=${pin}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brick px-5 py-3 text-sm font-black text-primary-foreground">
            Lihat podium
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.5rem] border border-ink/10 bg-rice/82 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-saffron">
              {session.status === "live" ? `Soal ${Number(session.current_question_index || 0) + 1}/${session.question_count}` : "Lobby"}
            </p>
            {question && session.status === "live" ? (
              <>
                <h2 className="mt-3 text-2xl font-black">{question.prompt}</h2>
                <div className="mt-5 grid place-items-center rounded-[1.25rem] bg-lontar p-6 screen-grid">
                  <p className="bali-text text-[8rem] leading-none text-brick sm:text-[11rem]">{question.glyph}</p>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-2xl bg-lontar p-6">
                <p className="text-xl font-black">Pemain bisa masuk dulu.</p>
                <p className="mt-2 leading-7 text-muted-foreground/72">Guru menekan Mulai setelah semua siswa masuk.</p>
              </div>
            )}

            {isOwner && (
              <div className="mt-6 flex flex-wrap gap-2">
                <button type="button" onClick={() => control("start")} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brick px-4 text-sm font-black text-primary-foreground disabled:opacity-50">
                  <Play className="h-4 w-4" />
                  Mulai
                </button>
                <button type="button" onClick={() => control("previous")} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/10 bg-lontar px-4 text-sm font-black text-muted-foreground disabled:opacity-50">
                  Sebelumnya
                </button>
                <button type="button" onClick={() => control("next")} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/10 bg-lontar px-4 text-sm font-black text-muted-foreground disabled:opacity-50">
                  Berikutnya
                </button>
                <button type="button" onClick={() => control("finish")} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brick/20 bg-brick/10 px-4 text-sm font-black text-brick disabled:opacity-50">
                  <PauseCircle className="h-4 w-4" />
                  Selesai
                </button>
              </div>
            )}

            {isStudent && !joined && (
              <button type="button" onClick={joinFromLive} disabled={loading} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-brick px-5 text-sm font-black text-primary-foreground disabled:opacity-50">
                Gabung sebagai pemain
              </button>
            )}
          </div>

          <div className="grid gap-6">
            {isStudent && question && session.status === "live" && joined && (
              <div className="grid gap-3 sm:grid-cols-2">
                {question.options?.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => submitAnswer(option)}
                    disabled={loading || Boolean(result)}
                    className={`min-h-24 rounded-[1.25rem] border px-5 py-4 text-left text-2xl font-black transition ${optionClass({ option, selected, result })}`}
                  >
                    <span className={/[\u{1B00}-\u{1B7F}]/u.test(option) ? "bali-text text-5xl" : ""}>{option}</span>
                    {result?.correctOption === option && <Check className="mt-2 h-5 w-5 text-[#4A7C59]" />}
                    {result && selected === option && result.correctOption !== option && <X className="mt-2 h-5 w-5 text-destructive" />}
                  </button>
                ))}
                {result && (
                  <div className="sm:col-span-2 rounded-2xl border border-ink/10 bg-rice/82 px-5 py-4 text-sm font-bold text-muted-foreground">
                    {result.correct ? `Benar, +${result.scoreDelta} poin.` : `Belum tepat. Jawaban: ${result.correctOption}`}
                  </div>
                )}
              </div>
            )}

            <aside className="rounded-[1.5rem] border border-ink/10 bg-rice/82 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.06)]">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-saffron">Peringkat sementara</p>
              <div className="mt-4 grid gap-2">
                {leaderboard.length ? leaderboard.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between rounded-2xl bg-lontar px-4 py-3">
                    <span className="font-black">{index + 1}. {player.display_name}</span>
                    <span className="text-sm font-black text-brick">{player.score || 0}</span>
                  </div>
                )) : (
                  <p className="leading-7 text-muted-foreground/72">Belum ada pemain masuk.</p>
                )}
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
