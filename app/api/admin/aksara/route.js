import { requireAdmin } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { jsonError, jsonOk, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function normalizeBody(body) {
  const name = String(body.name || "").trim();
  const latin = String(body.latin || "").trim();
  const category = String(body.category || "").trim();
  const glyph = String(body.glyph || body.char || "").trim();
  const id = slugify(body.id || `${category}-${latin || name || Date.now()}`);
  return {
    id,
    name,
    glyph,
    latin: latin || null,
    category,
    order: Number(body.order || 0),
    isPremium: Boolean(body.isPremium || body.is_premium),
    svgUrl: body.svgUrl || body.svg_url || null,
    imageUrl: body.imageUrl || body.image_url || null,
    targetStrokeCount: Math.max(0, Number(body.targetStrokeCount || body.target_stroke_count || 0)),
    audioUrl: body.audioUrl || body.audio_url || null,
    notes: body.notes || null
  };
}

export async function GET(request) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const params = [];
    let where = "1 = 1";
    if (category) {
      where += " AND a.category = ?";
      params.push(category);
    }

    const aksara = await query(
      `SELECT a.id, a.name, a.\`char\` AS glyph, a.latin, a.category, c.name AS category_name,
              a.\`order\`, a.is_premium, a.svg_url, a.image_url, a.target_stroke_count,
              a.audio_url, a.notes, a.created_at, a.updated_at
       FROM aksara a
       LEFT JOIN categories c ON c.id = a.category
       WHERE ${where}
       ORDER BY a.category ASC, a.\`order\` ASC, a.name ASC`,
      params
    );

    return jsonOk({
      aksara: aksara.map((item) => ({ ...item, is_premium: Boolean(item.is_premium) }))
    });
  } catch (error) {
    return jsonError(error, "Failed to load aksara");
  }
}

export async function POST(request) {
  try {
    await requireAdmin(request);
    const body = normalizeBody(await readJson(request));
    if (!body.id || !body.name || !body.category || !body.glyph) {
      return jsonError({ status: 400, message: "Nama, aksara, dan kategori wajib diisi." }, "Invalid aksara");
    }

    await query(
      `INSERT INTO categories (id, name, \`order\`, created_at, updated_at)
       VALUES (?, ?, 999, NOW(), NOW())
       ON DUPLICATE KEY UPDATE updated_at = updated_at`,
      [body.category, body.category]
    );

    await query(
      `INSERT INTO aksara
        (id, name, \`char\`, latin, category, \`order\`, is_premium, svg_url, image_url, target_stroke_count, audio_url, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         \`char\` = VALUES(\`char\`),
         latin = VALUES(latin),
         category = VALUES(category),
         \`order\` = VALUES(\`order\`),
         is_premium = VALUES(is_premium),
         svg_url = VALUES(svg_url),
         image_url = VALUES(image_url),
         target_stroke_count = VALUES(target_stroke_count),
         audio_url = VALUES(audio_url),
         notes = VALUES(notes),
         updated_at = NOW()`,
      [
        body.id,
        body.name,
        body.glyph,
        body.latin,
        body.category,
        body.order,
        body.isPremium ? 1 : 0,
        body.svgUrl,
        body.imageUrl,
        body.targetStrokeCount,
        body.audioUrl,
        body.notes
      ]
    );

    const [item] = await query(
      `SELECT id, name, \`char\` AS glyph, latin, category, \`order\`, is_premium, svg_url, image_url, target_stroke_count, audio_url, notes
       FROM aksara
       WHERE id = ?
       LIMIT 1`,
      [body.id]
    );
    return jsonOk({ aksara: { ...item, is_premium: Boolean(item.is_premium) } }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Failed to save aksara");
  }
}
