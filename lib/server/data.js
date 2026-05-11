import { query, toJsonValue } from "./db";

export async function getDashboardData(userId) {
  const [profile] = await query(
    `SELECT id, email, display_name, role, tier
     FROM profiles
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  const [strokeSummary] = await query(
    `SELECT
       COUNT(*) AS total_attempts,
       COALESCE(ROUND(AVG(score)), 0) AS avg_score,
       COALESCE(SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END), 0) AS passed_attempts,
       COUNT(DISTINCT CASE WHEN passed = 1 THEN aksara_id ELSE NULL END) AS mastered_aksara
     FROM stroke_attempts
     WHERE user_id = ?`,
    [userId]
  ).catch(() => [{ total_attempts: 0, avg_score: 0, passed_attempts: 0, mastered_aksara: 0 }]);

  const [weekSummary] = await query(
    `SELECT COUNT(*) AS weekly_attempts, COALESCE(SUM(score), 0) AS weekly_xp
     FROM stroke_attempts
     WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [userId]
  ).catch(() => [{ weekly_attempts: 0, weekly_xp: 0 }]);

  const catalog = await query(
    `SELECT id, name, \`char\` AS glyph, latin, category, \`order\`, is_premium, svg_url, image_url, target_stroke_count, notes
     FROM aksara
     ORDER BY category ASC, \`order\` ASC
     LIMIT 180`
  ).catch(() => []);

  const recentAttempts = await query(
    `SELECT sa.id, sa.aksara_id, sa.score, sa.passed, sa.created_at, a.name AS aksara_name, a.latin, a.\`char\` AS glyph
     FROM stroke_attempts sa
     LEFT JOIN aksara a ON a.id = sa.aksara_id
     WHERE sa.user_id = ?
     ORDER BY sa.created_at DESC
     LIMIT 8`,
    [userId]
  ).catch(() => []);

  const [subscription] = await query(
    `SELECT plan, status, start_date, end_date, source_order_id
     FROM subscriptions
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  ).catch(() => [null]);

  return {
    profile,
    subscription: subscription || null,
    stats: {
      totalAttempts: Number(strokeSummary.total_attempts || 0),
      averageScore: Number(strokeSummary.avg_score || 0),
      passedAttempts: Number(strokeSummary.passed_attempts || 0),
      masteredAksara: Number(strokeSummary.mastered_aksara || 0),
      weeklyAttempts: Number(weekSummary.weekly_attempts || 0),
      weeklyXp: Number(weekSummary.weekly_xp || 0),
      catalogCount: catalog.length
    },
    catalog: catalog.map((item) => ({
      ...item,
      is_premium: Boolean(item.is_premium)
    })),
    recentAttempts: recentAttempts.map((attempt) => ({
      ...attempt,
      score: Number(attempt.score || 0),
      passed: Boolean(attempt.passed)
    }))
  };
}

export async function getPracticeAksara(aksaraId) {
  const params = [];
  let where = "svg_url IS NOT NULL AND svg_url <> ''";
  if (aksaraId) {
    where = "id = ?";
    params.push(aksaraId);
  }

  const rows = await query(
    `SELECT id, name, \`char\` AS glyph, latin, category, is_premium, svg_url, image_url, target_stroke_count, notes
     FROM aksara
     WHERE ${where}
     ORDER BY \`order\` ASC
     LIMIT 1`,
    params
  );

  return rows[0] || null;
}

export async function getPracticeCatalog() {
  const rows = await query(
    `SELECT a.id, a.name, a.\`char\` AS glyph, a.latin, a.category, a.is_premium, a.svg_url, a.image_url, a.target_stroke_count, a.notes
     FROM aksara a
     LEFT JOIN categories c ON c.id = a.category
     ORDER BY COALESCE(c.\`order\`, 999) ASC, a.category ASC, a.\`order\` ASC, a.name ASC
     LIMIT 240`
  );

  return rows.map((item) => ({
    ...item,
    is_premium: Boolean(item.is_premium)
  }));
}

export function normalizeAttempt(row) {
  return {
    ...row,
    score: Number(row.score || 0),
    passed: Boolean(row.passed),
    mistakes: Number(row.mistakes || 0),
    duration_seconds: Number(row.duration_seconds || 0),
    stroke_count: Number(row.stroke_count || 0),
    metrics: toJsonValue(row.metrics, []),
    raw_strokes: toJsonValue(row.raw_strokes, []),
    normalized_strokes: toJsonValue(row.normalized_strokes, [])
  };
}
