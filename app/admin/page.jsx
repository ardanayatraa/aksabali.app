import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AdminContentManager } from "../../components/admin/AdminContentManager";
import { AppShell } from "../../components/AppShell";
import { ProductionSetupNotice } from "../../components/ProductionSetupNotice";
import { quizMaterials } from "../../lib/quiz-data";
import { getCurrentUser } from "../../lib/server/auth";
import { query } from "../../lib/server/db";
import { ProductionConfigError } from "../../lib/server/env";

export const dynamic = "force-dynamic";

const adminSections = new Set(["overview", "content", "quiz", "users", "activity", "game", "payments"]);
const sectionMeta = {
  overview: {
    title: "Ringkasan admin",
    description: "Pantau status konten, pengguna, aktivitas belajar, game kelas, dan pembayaran."
  },
  content: {
    title: "Konten aksara",
    description: "Kelola katalog aksara, SVG referensi, urutan materi, dan metadata latihan."
  },
  quiz: {
    title: "Bank kuis",
    description: "Review sumber soal untuk kuis nyurat, membaca, tebak huruf, dan game kelas."
  },
  users: {
    title: "Pengguna",
    description: "Pantau akun admin, guru, siswa, tier, dan aktivitas pendaftaran."
  },
  activity: {
    title: "Aktivitas belajar",
    description: "Lihat upaya stroke dan kuis terbaru untuk mengecek pemakaian aplikasi."
  },
  game: {
    title: "Game kelas",
    description: "Pantau sesi Kahoot, host, PIN, jumlah soal, dan pemain."
  },
  payments: {
    title: "Pembayaran",
    description: "Pantau transaksi paket premium dan status pembayaran pengguna."
  }
};

function serializeValue(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return Number(value);
  return value;
}

function serializeRows(rows) {
  return rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, serializeValue(value)]))
  );
}

function buildQuizGroups() {
  const labels = {
    anacaraka: "Aksara Anacaraka",
    swara: "Swara AIUEO",
    angka: "Angka Bali",
    gabunganVokal: "Gabungan Vokal",
    kataAksara: "Kata Aksara"
  };

  return Object.entries(quizMaterials).map(([id, items]) => ({
    id,
    name: labels[id] || id,
    count: items.length,
    items
  }));
}

export default async function AdminPage({ searchParams }) {
  let user;
  let categories = [];
  let aksara = [];
  let users = [];
  let strokeAttempts = [];
  let quizAttempts = [];
  let gameSessions = [];
  let payments = [];
  const params = await searchParams;
  const requestedSection = params?.section || "overview";
  const initialSection = adminSections.has(requestedSection) ? requestedSection : "overview";

  try {
    user = await getCurrentUser();
    if (!user) redirect("/login?next=/admin");
    if (user.role !== "admin") redirect("/dashboard");

    categories = await query(
      `SELECT id, name, description, \`order\`, created_at, updated_at
       FROM categories
       ORDER BY \`order\` ASC, name ASC`
    );
    aksara = await query(
      `SELECT id, name, \`char\` AS glyph, latin, category, \`order\`, is_premium, svg_url, image_url, target_stroke_count, audio_url, notes, created_at, updated_at
       FROM aksara
       ORDER BY category ASC, \`order\` ASC, name ASC`
    );
    users = await query(
      `SELECT id, email, display_name, role, tier, created_at, updated_at
       FROM profiles
       ORDER BY created_at DESC
       LIMIT 100`
    );
    strokeAttempts = await query(
      `SELECT sa.id, sa.user_id, p.display_name, p.email, sa.aksara_id, a.name AS aksara_name,
              sa.mode, sa.score, sa.passed, sa.created_at
       FROM stroke_attempts sa
       LEFT JOIN profiles p ON p.id = sa.user_id
       LEFT JOIN aksara a ON a.id = sa.aksara_id
       ORDER BY sa.created_at DESC
       LIMIT 30`
    );
    quizAttempts = await query(
      `SELECT qa.id, qa.user_id, p.display_name, p.email, qa.mode, qa.score,
              qa.correct_count, qa.total_count, qa.passed, qa.created_at
       FROM quiz_attempts qa
       LEFT JOIN profiles p ON p.id = qa.user_id
       ORDER BY qa.created_at DESC
       LIMIT 30`
    );
    gameSessions = await query(
      `SELECT gs.id, gs.pin, gs.title, gs.status, gs.question_count, gs.seconds_per_question,
              gs.current_question_index, gs.created_at, p.display_name AS host_name,
              COUNT(gp.id) AS player_count
       FROM game_sessions gs
       LEFT JOIN profiles p ON p.id = gs.host_id
       LEFT JOIN game_players gp ON gp.session_id = gs.id
       GROUP BY gs.id, gs.pin, gs.title, gs.status, gs.question_count, gs.seconds_per_question,
                gs.current_question_index, gs.created_at, p.display_name
       ORDER BY gs.created_at DESC
       LIMIT 30`
    );
    payments = await query(
      `SELECT pt.id, pt.order_id, pt.amount, pt.plan, pt.status, pt.payment_type,
              pt.created_at, p.display_name, p.email
       FROM payment_transactions pt
       LEFT JOIN profiles p ON p.id = pt.user_id
       ORDER BY pt.created_at DESC
       LIMIT 30`
    );
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      return <ProductionSetupNotice message={error.message} />;
    }
    throw error;
  }
  const pageMeta = sectionMeta[initialSection] || sectionMeta.overview;

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-5 flex flex-col gap-4 border-b border-ink/10 pb-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brick">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-normal text-ink">
              {pageMeta.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-muted-foreground">
              {pageMeta.description}
            </p>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded border border-ink/10 bg-rice text-sm shadow-[0_8px_22px_hsl(var(--foreground)/0.04)]">
            <div className="border-r border-ink/10 px-4 py-3">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-muted-foreground/70">Kategori</p>
              <p className="mt-1 text-xl font-black text-ink">{categories.length}</p>
            </div>
            <div className="border-r border-ink/10 px-4 py-3">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-muted-foreground/70">Aksara</p>
              <p className="mt-1 text-xl font-black text-ink">{aksara.length}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-muted-foreground/70">Akun</p>
              <p className="mt-1 text-xl font-black text-ink">{users.length}</p>
            </div>
          </div>
        </section>

        <AdminContentManager
          key={initialSection}
          initialSection={initialSection}
          initialCategories={serializeRows(categories)}
          initialAksara={serializeRows(aksara).map((item) => ({ ...item, is_premium: Boolean(item.is_premium) }))}
          initialQuizGroups={buildQuizGroups()}
          initialUsers={serializeRows(users)}
          initialStrokeAttempts={serializeRows(strokeAttempts).map((item) => ({ ...item, passed: Boolean(item.passed) }))}
          initialQuizAttempts={serializeRows(quizAttempts).map((item) => ({ ...item, passed: Boolean(item.passed) }))}
          initialGameSessions={serializeRows(gameSessions)}
          initialPayments={serializeRows(payments)}
        />
      </div>
    </AppShell>
  );
}
