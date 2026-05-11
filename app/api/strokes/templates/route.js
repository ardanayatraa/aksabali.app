import { NextResponse } from "next/server";
import { requireLearner } from "../../../../lib/server/auth";
import { query, toJsonValue } from "../../../../lib/server/db";
import { jsonError } from "../../../../lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await requireLearner();
    const { searchParams } = new URL(request.url);
    const aksaraId = searchParams.get("aksaraId");
    if (!aksaraId) {
      return NextResponse.json({ error: "aksaraId wajib diisi" }, { status: 400 });
    }

    const ownRows = await query(
      `SELECT id, aksara_id, score, normalized_strokes, created_at
       FROM stroke_attempts
       WHERE user_id = ? AND aksara_id = ? AND passed = 1 AND score >= 78
       ORDER BY score DESC, created_at DESC
       LIMIT 5`,
      [user.id, aksaraId]
    );

    const globalRows = await query(
      `SELECT id, aksara_id, score, normalized_strokes, created_at
       FROM stroke_attempts
       WHERE aksara_id = ? AND passed = 1 AND score >= 88
       ORDER BY score DESC, created_at DESC
       LIMIT 8`,
      [aksaraId]
    );

    const seen = new Set();
    const templates = [...ownRows, ...globalRows]
      .filter((row) => {
        if (seen.has(row.id)) return false;
        seen.add(row.id);
        return true;
      })
      .map((row) => ({
        id: row.id,
        aksara_id: row.aksara_id,
        score: Number(row.score || 0),
        normalized_strokes: toJsonValue(row.normalized_strokes, []),
        created_at: row.created_at
      }))
      .filter((row) => Array.isArray(row.normalized_strokes) && row.normalized_strokes.length > 0);

    return NextResponse.json({ data: templates });
  } catch (error) {
    return jsonError(error, "Failed to load stroke templates");
  }
}
