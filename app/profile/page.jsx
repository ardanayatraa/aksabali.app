import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenText, Gamepad2, GraduationCap, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { ProductionSetupNotice } from "../../components/ProductionSetupNotice";
import { getCurrentUser } from "../../lib/server/auth";
import { getDashboardData } from "../../lib/server/data";
import { query } from "../../lib/server/db";
import { ProductionConfigError } from "../../lib/server/env";

export const dynamic = "force-dynamic";

async function getAdminProfileStats() {
  const [[categorySummary], [aksaraSummary], [studentSummary]] = await Promise.all([
    query("SELECT COUNT(*) AS total FROM categories"),
    query("SELECT COUNT(*) AS total FROM aksara"),
    query("SELECT COUNT(*) AS total FROM profiles WHERE role IN ('siswa', 'user')")
  ]);

  return {
    categories: Number(categorySummary?.total || 0),
    aksara: Number(aksaraSummary?.total || 0),
    students: Number(studentSummary?.total || 0)
  };
}

async function getTeacherProfileStats(userId) {
  const [[sessionSummary], [playerSummary], [liveSummary]] = await Promise.all([
    query("SELECT COUNT(*) AS total FROM game_sessions WHERE host_id = ?", [userId]).catch(() => [{ total: 0 }]),
    query(
      `SELECT COUNT(DISTINCT gp.user_id) AS total
       FROM game_players gp
       JOIN game_sessions gs ON gs.id = gp.session_id
       WHERE gs.host_id = ?`,
      [userId]
    ).catch(() => [{ total: 0 }]),
    query("SELECT COUNT(*) AS total FROM game_sessions WHERE host_id = ? AND status = 'live'", [userId]).catch(() => [{ total: 0 }])
  ]);

  return {
    sessions: Number(sessionSummary?.total || 0),
    players: Number(playerSummary?.total || 0),
    live: Number(liveSummary?.total || 0)
  };
}

function roleLabelFor(user) {
  if (user.role === "admin") return "Admin";
  if (user.role === "pengajar") return "Guru";
  return "Siswa";
}

function IdentityCard({ user }) {
  const roleLabel = roleLabelFor(user);

  return (
    <section className="rounded-[1.5rem] border border-ink/10 bg-rice/80 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)]">
      <div className="flex items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brick text-2xl font-black text-primary-foreground">
          {(user.display_name || user.email || "AB").slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brick">
            Profil {roleLabel}
          </p>
          <h1 className="mt-2 truncate font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {user.display_name}
          </h1>
          <p className="mt-2 flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-muted-foreground/70">
            <Mail className="h-4 w-4 shrink-0" />
            {user.email}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-brick/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-brick">
          {roleLabel}
        </span>
        <span className="rounded-full bg-lontar px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
          {user.tier || "free"}
        </span>
      </div>
    </section>
  );
}

function StatCard({ label, value, meta }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-rice/80 p-5 shadow-[0_12px_34px_hsl(var(--foreground)/0.05)]">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground/55">{label}</p>
      <p className="mt-3 text-4xl font-black text-ink">{value}</p>
      <p className="mt-1 text-sm font-semibold text-brick">{meta}</p>
    </div>
  );
}

export default async function ProfilePage() {
  let user;
  let dashboard = null;
  let adminStats = null;
  let teacherStats = null;

  try {
    user = await getCurrentUser();
    if (!user) redirect("/login?next=/profile");

    if (user.role === "admin") {
      adminStats = await getAdminProfileStats();
    } else if (user.role === "pengajar") {
      teacherStats = await getTeacherProfileStats(user.id);
    } else {
      dashboard = await getDashboardData(user.id);
    }
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      return <ProductionSetupNotice message={error.message} />;
    }
    throw error;
  }

  const isAdmin = user.role === "admin";
  const isTeacher = user.role === "pengajar";

  return (
    <AppShell user={dashboard?.profile || user} subscription={dashboard?.subscription}>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[380px_1fr] lg:px-8">
        <IdentityCard user={dashboard?.profile || user} />

        <section className="rounded-[1.5rem] border border-ink/10 bg-rice/72 p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-brick">
                {isAdmin ? <ShieldCheck className="h-4 w-4" /> : isTeacher ? <GraduationCap className="h-4 w-4" /> : <BookOpenText className="h-4 w-4" />}
                {isAdmin ? "Ruang admin" : isTeacher ? "Ruang guru" : "Ruang siswa"}
              </p>
              <h2 className="mt-2 text-3xl font-black">
                {isAdmin ? "Kelola aplikasi dari satu tempat." : isTeacher ? "Kelola game kelas dari satu tempat." : "Pantau progres belajar kamu."}
              </h2>
              <p className="mt-2 max-w-2xl leading-7 text-muted-foreground/70">
                {isAdmin
                  ? "Akun admin fokus untuk konten, kategori, dan materi aksara. Area latihan siswa sengaja dipisah."
                  : isTeacher
                    ? "Akun guru fokus untuk membuat room Kahoot, mengatur sesi live, dan melihat aktivitas game kelas."
                  : "Akun siswa fokus untuk latihan nyurat, kuis, game kelas, dan progres belajar."}
              </p>
            </div>
            <Link
              href={isAdmin ? "/admin" : isTeacher ? "/guru" : "/dashboard"}
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-xl bg-brick px-5 text-sm font-black text-primary-foreground"
            >
              {isAdmin ? "Buka admin" : isTeacher ? "Buka ruang guru" : "Buka dashboard"}
            </Link>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {isAdmin ? (
              <>
                <StatCard label="Kategori" value={adminStats.categories} meta="konten aktif" />
                <StatCard label="Aksara" value={adminStats.aksara} meta="materi katalog" />
                <StatCard label="Siswa" value={adminStats.students} meta="akun belajar" />
              </>
            ) : isTeacher ? (
              <>
                <StatCard label="Room" value={teacherStats.sessions} meta="game dibuat" />
                <StatCard label="Pemain" value={teacherStats.players} meta="pernah join" />
                <StatCard label="Live" value={teacherStats.live} meta="sedang berjalan" />
              </>
            ) : (
              <>
                <StatCard label="Stroke" value={dashboard.stats.totalAttempts} meta="percobaan tersimpan" />
                <StatCard label="Skor rata-rata" value={dashboard.stats.averageScore} meta="latihan nyurat" />
                <StatCard label="Minggu ini" value={dashboard.stats.weeklyAttempts} meta={`${dashboard.stats.weeklyXp} XP`} />
              </>
            )}
          </div>

          <div className="mt-7 rounded-2xl bg-lontar p-5">
            <div className="flex items-start gap-3">
              {isTeacher ? <Gamepad2 className="mt-1 h-5 w-5 shrink-0 text-brick" /> : <Sparkles className="mt-1 h-5 w-5 shrink-0 text-brick" />}
              <div>
                <p className="font-black text-ink">
                  {isAdmin ? "Mode admin tidak membuka latihan siswa." : isTeacher ? "Mode guru menjadi host, bukan pemain." : "Mode siswa tidak membuka panel admin."}
                </p>
                <p className="mt-1 leading-7 text-muted-foreground/70">
                  {isAdmin
                    ? "Kalau butuh mencoba latihan sebagai siswa, gunakan akun siswa terpisah agar data progres tidak bercampur dengan akun admin."
                    : isTeacher
                      ? "Kalau ingin ikut bermain sebagai siswa, gunakan akun siswa terpisah agar skor kelas tetap jelas."
                    : "Kalau butuh akses kelola konten, masuk memakai akun admin yang memang disiapkan untuk pengelolaan."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
