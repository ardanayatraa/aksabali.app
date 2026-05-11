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
    .slice(0, 80);
}

export async function GET(request) {
  try {
    await requireAdmin(request);
    const categories = await query(
      `SELECT id, name, description, \`order\`, created_at, updated_at
       FROM categories
       ORDER BY \`order\` ASC, name ASC`
    );
    return jsonOk({ categories });
  } catch (error) {
    return jsonError(error, "Failed to load categories");
  }
}

export async function POST(request) {
  try {
    await requireAdmin(request);
    const body = await readJson(request);
    const id = slugify(body.id || body.name);
    const name = String(body.name || "").trim();
    if (!id || !name) {
      return jsonError({ status: 400, message: "ID dan nama kategori wajib diisi." }, "Invalid category");
    }

    await query(
      `INSERT INTO categories (id, name, description, \`order\`, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         description = VALUES(description),
         \`order\` = VALUES(\`order\`),
         updated_at = NOW()`,
      [id, name, body.description || null, Number(body.order || 0)]
    );

    const [category] = await query(
      `SELECT id, name, description, \`order\`, created_at, updated_at
       FROM categories
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return jsonOk({ category }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Failed to save category");
  }
}
