import { requireAdmin } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { jsonError, jsonOk, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const VALID_ROLES = ["siswa", "pengajar", "admin"];
const VALID_STATUSES = ["active", "suspended"];

export async function PATCH(request, { params }) {
  try {
    const actor = await requireAdmin(request);
    const { id } = await params;
    const targetId = String(id || "").trim();
    if (!targetId) {
      return jsonError({ status: 400, message: "ID user wajib." }, "Bad request");
    }

    const body = await readJson(request);
    const updates = [];
    const values = [];

    if (body.role !== undefined) {
      if (!VALID_ROLES.includes(body.role)) {
        return jsonError({ status: 400, message: `Role tidak valid. Pilih: ${VALID_ROLES.join(", ")}.` }, "Bad request");
      }
      // Self-protection: admin nggak boleh demote dirinya sendiri (cegah lockout).
      if (targetId === actor.id && body.role !== "admin") {
        return jsonError(
          { status: 400, message: "Nggak bisa ganti role akun sendiri. Minta admin lain yang lakuin." },
          "Bad request"
        );
      }
      updates.push("role = ?");
      values.push(body.role);
    }

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return jsonError({ status: 400, message: `Status tidak valid. Pilih: ${VALID_STATUSES.join(", ")}.` }, "Bad request");
      }
      // Self-protection: admin nggak boleh suspend dirinya sendiri.
      if (targetId === actor.id && body.status === "suspended") {
        return jsonError(
          { status: 400, message: "Nggak bisa suspend akun sendiri. Minta admin lain yang lakuin." },
          "Bad request"
        );
      }
      updates.push("status = ?");
      values.push(body.status);
    }

    if (!updates.length) {
      return jsonError({ status: 400, message: "Tidak ada perubahan." }, "Bad request");
    }

    updates.push("updated_at = NOW()");
    values.push(targetId);

    const result = await query(
      `UPDATE profiles SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (!result?.affectedRows) {
      return jsonError({ status: 404, message: "User tidak ditemukan." }, "Not found");
    }

    const rows = await query(
      `SELECT id, email, display_name, role, tier, status, email_verified_at, created_at, updated_at
       FROM profiles
       WHERE id = ?
       LIMIT 1`,
      [targetId]
    );

    return jsonOk({ user: rows[0] || null });
  } catch (error) {
    return jsonError(error, "Failed to update user");
  }
}
