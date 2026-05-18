// Bootstrap migration endpoint — dipakai saat deploy ke hosting yang tidak
// trigger `npm start` (mis. Hostinger, shared hosting Phusion Passenger, dll).
//
// Idempotent: aman dipanggil berkali-kali. Tetap pakai MySQL advisory lock
// dari migrate.cjs supaya multi-instance safe.
//
// Auth: butuh header X-Setup-Key yang match env SETUP_KEY.
// (Admin session juga diterima — tapi pas first-time migration belum bisa
// karena tabel profiles belum ada, jadi SETUP_KEY adalah fallback.)
//
// Usage:
//   curl -X POST https://aksabali.app/api/setup/migrate \
//     -H "X-Setup-Key: $SETUP_KEY"

import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { requireAdmin } from "../../../../lib/server/auth";
import { jsonError, jsonOk } from "../../../../lib/server/http";

const execFileAsync = promisify(execFile);

export const dynamic = "force-dynamic";

async function authorize(request) {
  // Coba admin session dulu (kalau tabel sudah ada).
  try {
    const admin = await requireAdmin(request);
    return { ok: true, via: `admin:${admin.email}` };
  } catch {
    // Fallback ke SETUP_KEY — wajib untuk first-time migration sebelum tabel ada.
  }

  const setupKey = process.env.SETUP_KEY;
  if (!setupKey) {
    return { ok: false, reason: "SETUP_KEY tidak diset di env server." };
  }
  const provided = request.headers.get("x-setup-key") || "";
  if (provided !== setupKey) {
    return { ok: false, reason: "Setup key tidak valid." };
  }
  return { ok: true, via: "setup-key" };
}

export async function GET() {
  // Help message — kalau orang buka URL langsung di browser.
  return jsonOk({
    method: "POST",
    description: "Trigger DB migration. Idempotent. Bisa dipanggil berulang.",
    auth: [
      "Header `X-Setup-Key: <SETUP_KEY env>` — fallback untuk bootstrap pertama",
      "ATAU admin session cookie (setelah tabel profiles ada + akun admin ada)"
    ],
    example_curl: `curl -X POST <origin>/api/setup/migrate -H "X-Setup-Key: <SETUP_KEY>"`
  });
}

export async function POST(request) {
  try {
    const auth = await authorize(request);
    if (!auth.ok) {
      return jsonError(
        { status: 401, message: `Unauthorized. ${auth.reason || "Cek X-Setup-Key atau login admin."}` },
        "Unauthorized"
      );
    }

    const startedAt = Date.now();
    const scriptPath = path.join(process.cwd(), "scripts", "migrate.cjs");

    let stdout = "";
    let stderr = "";
    try {
      const result = await execFileAsync("node", [scriptPath], {
        cwd: process.cwd(),
        env: { ...process.env },
        timeout: 120_000,
        maxBuffer: 4 * 1024 * 1024
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (execError) {
      // execFile errors expose stdout/stderr — sertakan untuk debugging.
      return jsonError(
        {
          status: 500,
          message: `Migration script gagal: ${execError.message}`
        },
        "Migration failed"
      );
    }

    const elapsedSeconds = Number(((Date.now() - startedAt) / 1000).toFixed(2));

    return jsonOk({
      ok: true,
      via: auth.via,
      elapsed_seconds: elapsedSeconds,
      stdout: stdout.trim() ? stdout.trim().split("\n") : [],
      stderr: stderr.trim() ? stderr.trim().split("\n") : []
    });
  } catch (error) {
    return jsonError(error, "Migration endpoint error");
  }
}
