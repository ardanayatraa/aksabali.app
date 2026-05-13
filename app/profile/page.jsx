import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenText, Gamepad2, GraduationCap, Mail, ShieldCheck, Sparkles } from "lucide-react";
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
  const profile = dashboard?.profile || user;
  const roleLabel = roleLabelFor(profile);

  const stats = isAdmin
    ? [
        { label: "Kategori", value: adminStats.categories, meta: "konten aktif" },
        { label: "Aksara", value: adminStats.aksara, meta: "materi katalog" },
        { label: "Siswa", value: adminStats.students, meta: "akun belajar" }
      ]
    : isTeacher
      ? [
          { label: "Room", value: teacherStats.sessions, meta: "game dibuat" },
          { label: "Pemain", value: teacherStats.players, meta: "pernah join" },
          { label: "Live", value: teacherStats.live, meta: "sedang berjalan" }
        ]
      : [
          { label: "Stroke", value: dashboard.stats.totalAttempts, meta: "percobaan tersimpan" },
          { label: "Skor rata-rata", value: dashboard.stats.averageScore, meta: "latihan nyurat" },
          { label: "Minggu ini", value: dashboard.stats.weeklyAttempts, meta: `${dashboard.stats.weeklyXp} XP` }
        ];

  const heroEyebrow = `Profil ${roleLabel.toLowerCase()}`;
  const heroDescription = isAdmin
    ? "Kelola konten, kategori, materi aksara, dan pengguna dari satu tempat."
    : isTeacher
      ? "Buat room game, jalankan sesi live, dan pantau aktivitas kelas."
      : "Latihan nyurat, kerjain kuis, dan gabung game kelas — semua progresmu tersimpan otomatis.";

  return (
    <AppShell user={profile} subscription={dashboard?.subscription}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero flat */}
        <section>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brick">{heroEyebrow}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {profile.display_name}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{heroDescription}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-ink/70">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1">
              <Mail className="h-3.5 w-3.5 text-brick" />
              {profile.email}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1 uppercase tracking-widest">
              Paket · {(profile.tier || "free").toLowerCase()}
            </span>
          </div>
        </section>

        {/* Stats 1 card dgn divider */}
        <section className="mt-10 rounded-2xl border border-ink/[0.08] bg-rice">
          <div className="grid divide-ink/[0.08] sm:grid-cols-3 sm:divide-x">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`px-6 py-5 ${i < stats.length - 1 ? "border-b border-ink/[0.08] sm:border-b-0" : ""}`}
              >
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-ink/45">{stat.label}</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold text-ink/55">{stat.meta}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main action + reminder */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-ink/[0.08] bg-rice p-7">
            <p className="inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-brick">
              {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : isTeacher ? <GraduationCap className="h-3.5 w-3.5" /> : <BookOpenText className="h-3.5 w-3.5" />}
              {isAdmin ? "Ruang admin" : isTeacher ? "Ruang guru" : "Ruang siswa"}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight">
              {isAdmin ? "Kelola semua dari sini." : isTeacher ? "Atur kelasmu di sini." : "Cek progres belajarmu."}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-ink/65">
              {isAdmin
                ? "Konten, kategori, aksara, dan pengguna semuanya di admin panel."
                : isTeacher
                  ? "Buat room, share PIN, lalu kontrol soal dari layar guru."
                  : "Lanjut latihan nyurat atau kerjain kuis dari dashboard."}
            </p>
            <div className="mt-6">
              <Link
                href={isAdmin ? "/admin" : isTeacher ? "/guru" : "/dashboard"}
                className="inline-flex items-center gap-2 rounded-full bg-brick px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-brick/90"
              >
                {isAdmin ? "Buka admin" : isTeacher ? "Buka ruang guru" : "Buka dashboard"}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/[0.08] bg-rice p-7">
            <p className="inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-brick">
              {isTeacher ? <Gamepad2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              Catatan akun
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-tight tracking-tight">
              {isAdmin
                ? "Akun admin khusus kelola konten."
                : isTeacher
                  ? "Akun guru jadi host, bukan pemain."
                  : "Akun siswa fokus belajar."}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              {isAdmin
                ? "Mau coba latihan? Pakai akun siswa terpisah biar progres nggak nyampur."
                : isTeacher
                  ? "Mau ikut main? Bikin akun siswa terpisah biar skor kelas tetap bersih."
                  : "Butuh akses kelola konten? Login pakai akun admin."}
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
