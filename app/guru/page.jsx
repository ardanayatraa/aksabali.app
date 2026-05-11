import Link from "next/link";
import { redirect } from "next/navigation";
import { Gamepad2, GraduationCap, Trophy, UsersRound } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { ProductionSetupNotice } from "../../components/ProductionSetupNotice";
import { getCurrentUser } from "../../lib/server/auth";
import { query } from "../../lib/server/db";
import { ProductionConfigError } from "../../lib/server/env";

export const dynamic = "force-dynamic";

async function getTeacherDashboard(userId) {
  const [[sessionSummary], [studentSummary], recentSessions] = await Promise.all([
    query("SELECT COUNT(*) AS total FROM game_sessions WHERE host_id = ?", [userId]).catch(() => [{ total: 0 }]),
    query("SELECT COUNT(*) AS total FROM profiles WHERE role IN ('siswa', 'user')").catch(() => [{ total: 0 }]),
    query(
      `SELECT gs.pin, gs.title, gs.status, gs.question_count, gs.seconds_per_question, gs.created_at,
              COUNT(gp.id) AS player_count
       FROM game_sessions gs
       LEFT JOIN game_players gp ON gp.session_id = gs.id
       WHERE gs.host_id = ?
       GROUP BY gs.id, gs.pin, gs.title, gs.status, gs.question_count, gs.seconds_per_question, gs.created_at
       ORDER BY gs.created_at DESC
       LIMIT 6`,
      [userId]
    ).catch(() => [])
  ]);

  return {
    totalSessions: Number(sessionSummary?.total || 0),
    totalStudents: Number(studentSummary?.total || 0),
    recentSessions
  };
}

export default async function GuruPage() {
  let user;
  let data;

  try {
    user = await getCurrentUser();
    if (!user) redirect("/login?next=/guru&role=pengajar");
    if (user.role === "admin") redirect("/admin");
    if (user.role !== "pengajar") redirect("/dashboard");
    data = await getTeacherDashboard(user.id);
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      return <ProductionSetupNotice message={error.message} />;
    }
    throw error;
  }

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-7xl px-4 py-8 text-ink sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-brick">
              <GraduationCap className="h-4 w-4" />
              Ruang guru
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-tight">
              Host game kelas.
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground/70">
              Buat room Kahoot, bagikan PIN ke siswa, lalu kontrol soal dari layar guru.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-ink/10 bg-rice/80 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-saffron">Aksi cepat</p>
            <Link href="/game/host" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brick px-5 text-sm font-black text-primary-foreground">
              <Gamepad2 className="h-4 w-4" />
              Buat room
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink/10 bg-rice/80 p-5 shadow-[0_12px_34px_hsl(var(--foreground)/0.05)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/55">Room dibuat</p>
            <p className="mt-3 text-4xl font-black">{data.totalSessions}</p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-rice/80 p-5 shadow-[0_12px_34px_hsl(var(--foreground)/0.05)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/55">Akun siswa</p>
            <p className="mt-3 text-4xl font-black">{data.totalStudents}</p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-rice/80 p-5 shadow-[0_12px_34px_hsl(var(--foreground)/0.05)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/55">Mode</p>
            <p className="mt-3 text-4xl font-black">Kahoot</p>
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-ink/10 bg-rice/80 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-saffron">
                <Trophy className="h-4 w-4" />
                Room terakhir
              </p>
              <h2 className="mt-2 text-2xl font-black">Riwayat game kelas.</h2>
            </div>
            <UsersRound className="h-8 w-8 text-brick" />
          </div>

          <div className="mt-5 grid gap-3">
            {data.recentSessions.length ? data.recentSessions.map((session) => (
              <Link key={session.pin} href={`/game/host?pin=${session.pin}`} className="grid gap-3 rounded-2xl border border-ink/10 bg-lontar p-4 transition hover:border-brick/30 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-black">{session.title}</p>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground/65">PIN {session.pin} - {session.status}</p>
                </div>
                <p className="text-sm font-black text-brick">{session.player_count || 0} pemain</p>
                <p className="text-sm font-semibold text-muted-foreground/60">{session.question_count} soal</p>
              </Link>
            )) : (
              <p className="rounded-2xl bg-lontar p-5 text-sm font-semibold leading-7 text-muted-foreground/70">
                Belum ada room. Buat room pertama dari tombol aksi cepat.
              </p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
