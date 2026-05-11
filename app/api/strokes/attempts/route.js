import { NextResponse } from "next/server";
import { requireLearner } from "../../../../lib/server/auth";
import { normalizeAttempt } from "../../../../lib/server/data";
import { jsonError, readJson } from "../../../../lib/server/http";
import { query } from "../../../../lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await requireLearner();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
    const params = [user.id];
    let where = "sa.user_id = ?";
    const aksaraId = searchParams.get("aksaraId");
    if (aksaraId) {
      where += " AND sa.aksara_id = ?";
      params.push(aksaraId);
    }

    const rows = await query(
      `SELECT sa.id, sa.user_id, sa.aksara_id, sa.mode, sa.score, sa.passed, sa.mistakes,
              sa.duration_seconds, sa.stroke_count, sa.metrics, sa.raw_strokes, sa.normalized_strokes,
              sa.created_at, a.name AS aksara_name, a.\`char\` AS aksara_char
       FROM stroke_attempts sa
       LEFT JOIN aksara a ON a.id = sa.aksara_id
       WHERE ${where}
       ORDER BY sa.created_at DESC
       LIMIT ${limit}`,
      params
    );

    return NextResponse.json({ data: rows.map(normalizeAttempt) });
  } catch (error) {
    return jsonError(error, "Failed to load stroke attempts");
  }
}

export async function POST(request) {
  try {
    const user = await requireLearner();
    const body = await readJson(request);
    const {
      aksaraId = null,
      mode = "practice",
      score = 0,
      passed = false,
      mistakes = 0,
      durationSeconds = 0,
      metrics = [],
      rawStrokes = [],
      normalizedStrokes = []
    } = body;
    const strokeCount = Array.isArray(rawStrokes) ? rawStrokes.length : 0;
    const normalizedScore = Math.max(0, Math.min(100, Math.round(Number(score || 0))));
    const safeMode = ["practice", "test", "nyurat"].includes(mode) ? mode : "practice";

    const result = await query(
      `INSERT INTO stroke_attempts
        (user_id, aksara_id, mode, score, passed, mistakes, duration_seconds, stroke_count, metrics, raw_strokes, normalized_strokes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        user.id,
        aksaraId || null,
        safeMode,
        normalizedScore,
        passed ? 1 : 0,
        Math.max(0, Math.round(Number(mistakes || 0))),
        Math.max(0, Math.round(Number(durationSeconds || 0))),
        strokeCount,
        JSON.stringify(metrics || []),
        JSON.stringify(rawStrokes || []),
        JSON.stringify(normalizedStrokes || [])
      ]
    );

    await query(
      `INSERT INTO progress (user_id, aksara_id, activity_type, score, completed, metadata, created_at, updated_at)
       VALUES (?, ?, 'stroke', ?, ?, ?, NOW(), NOW())`,
      [
        user.id,
        aksaraId || null,
        normalizedScore,
        passed ? 1 : 0,
        JSON.stringify({ strokeAttemptId: result.insertId || null, mode: safeMode })
      ]
    ).catch(() => {});

    await query(
      `INSERT INTO analytics_events (user_id, event_name, event_payload)
       VALUES (?, 'stroke_attempt_submitted', ?)`,
      [user.id, JSON.stringify({ aksaraId, mode: safeMode, score: normalizedScore, passed, mistakes, strokeCount })]
    ).catch(() => {});

    return NextResponse.json(
      { data: { id: result.insertId || null, score: normalizedScore, passed: Boolean(passed) } },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error, "Failed to save stroke attempt");
  }
}
