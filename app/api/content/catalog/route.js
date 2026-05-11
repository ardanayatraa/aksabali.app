import { NextResponse } from "next/server";
import { query } from "../../../../lib/server/db";
import { jsonError } from "../../../../lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query(
      `SELECT id, name, \`char\` AS glyph, latin, category, \`order\`, is_premium, svg_url, image_url, target_stroke_count, notes
       FROM aksara
       ORDER BY category ASC, \`order\` ASC`
    );
    return NextResponse.json({
      data: rows.map((row) => ({ ...row, is_premium: Boolean(row.is_premium) }))
    });
  } catch (error) {
    return jsonError(error, "Failed to load catalog");
  }
}
