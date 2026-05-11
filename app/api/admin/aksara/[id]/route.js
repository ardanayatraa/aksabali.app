import { requireAdmin } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { jsonError, jsonOk, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

function stringOrNull(value) {
  const text = String(value || "").trim();
  return text || null;
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await readJson(request);
    const name = String(body.name || "").trim();
    const glyph = String(body.glyph || body.char || "").trim();
    const category = String(body.category || "").trim();
    if (!name || !glyph || !category) {
      return jsonError({ status: 400, message: "Nama, aksara, dan kategori wajib diisi." }, "Invalid aksara");
    }

    await query(
      `INSERT INTO categories (id, name, \`order\`, created_at, updated_at)
       VALUES (?, ?, 999, NOW(), NOW())
       ON DUPLICATE KEY UPDATE updated_at = updated_at`,
      [category, category]
    );

    await query(
      `UPDATE aksara
       SET name = ?, \`char\` = ?, latin = ?, category = ?, \`order\` = ?, is_premium = ?,
           svg_url = ?, image_url = ?, target_stroke_count = ?, audio_url = ?, notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        glyph,
        stringOrNull(body.latin),
        category,
        Number(body.order || 0),
        body.isPremium || body.is_premium ? 1 : 0,
        stringOrNull(body.svgUrl || body.svg_url),
        stringOrNull(body.imageUrl || body.image_url),
        Math.max(0, Number(body.targetStrokeCount || body.target_stroke_count || 0)),
        stringOrNull(body.audioUrl || body.audio_url),
        stringOrNull(body.notes),
        id
      ]
    );

    const [item] = await query(
      `SELECT id, name, \`char\` AS glyph, latin, category, \`order\`, is_premium, svg_url, image_url, target_stroke_count, audio_url, notes
       FROM aksara
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    if (!item) return jsonError({ status: 404, message: "Aksara tidak ditemukan." }, "Aksara not found");
    return jsonOk({ aksara: { ...item, is_premium: Boolean(item.is_premium) } });
  } catch (error) {
    return jsonError(error, "Failed to update aksara");
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    await query("DELETE FROM aksara WHERE id = ?", [id]);
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return jsonError(error, "Failed to delete aksara");
  }
}
