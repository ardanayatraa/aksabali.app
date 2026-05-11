import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { jsonError, jsonOk } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SVG_BYTES = 512 * 1024;

function safeSegment(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function validateSvg(svg) {
  const text = String(svg || "").trim();
  if (!text.includes("<svg") || !text.includes("</svg>")) {
    const error = new Error("File harus SVG valid.");
    error.status = 400;
    throw error;
  }
  if (!/<path\b[^>]*\sd=["'][^"']+["'][^>]*>/i.test(text)) {
    const error = new Error("SVG referensi wajib punya minimal satu path stroke.");
    error.status = 400;
    throw error;
  }
  if (/<script\b/i.test(text) || /<foreignObject\b/i.test(text) || /\son[a-z]+\s*=/i.test(text) || /javascript:/i.test(text)) {
    const error = new Error("SVG mengandung elemen yang tidak aman.");
    error.status = 400;
    throw error;
  }
  return text;
}

function countSvgPaths(svg) {
  return [...String(svg || "").matchAll(/<path\b[^>]*\sd=["'][^"']+["'][^>]*>/gi)].length;
}

export async function POST(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return jsonError({ status: 400, message: "File SVG wajib diupload." }, "Invalid SVG upload");
    }
    if (file.size > MAX_SVG_BYTES) {
      return jsonError({ status: 413, message: "SVG maksimal 512KB." }, "SVG too large");
    }
    const fileName = String(file.name || "");
    const fileType = String(file.type || "");
    if (!fileName.toLowerCase().endsWith(".svg") && fileType !== "image/svg+xml") {
      return jsonError({ status: 400, message: "Format file harus .svg." }, "Invalid SVG type");
    }

    const [aksara] = await query(
      `SELECT id, category
       FROM aksara
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    if (!aksara) return jsonError({ status: 404, message: "Aksara tidak ditemukan." }, "Aksara not found");

    const svg = validateSvg(Buffer.from(await file.arrayBuffer()).toString("utf8"));
    const strokeCount = countSvgPaths(svg);
    const categorySegment = safeSegment(aksara.category) || "aksara";
    const fileSegment = safeSegment(aksara.id) || safeSegment(id);
    const publicUrl = `/aksara/${categorySegment}/${fileSegment}.svg`;
    const targetDir = path.join(process.cwd(), "public", "aksara", categorySegment);
    const targetFile = path.join(targetDir, `${fileSegment}.svg`);

    await mkdir(targetDir, { recursive: true });
    await writeFile(targetFile, svg, "utf8");
    await query("UPDATE aksara SET svg_url = ?, target_stroke_count = ?, updated_at = NOW() WHERE id = ?", [
      publicUrl,
      strokeCount,
      aksara.id
    ]);

    const [updated] = await query(
      `SELECT id, name, \`char\` AS glyph, latin, category, \`order\`, is_premium, svg_url, image_url, target_stroke_count, audio_url, notes
       FROM aksara
       WHERE id = ?
       LIMIT 1`,
      [aksara.id]
    );

    return jsonOk({ svgUrl: publicUrl, strokeCount, aksara: { ...updated, is_premium: Boolean(updated?.is_premium) } });
  } catch (error) {
    return jsonError(error, "Failed to upload SVG");
  }
}
