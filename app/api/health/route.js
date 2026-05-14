import { NextResponse } from "next/server";
import { query } from "../../../lib/server/db";
import { ProductionConfigError, productionStatus } from "../../../lib/server/env";

export const dynamic = "force-dynamic";

function maskSensitiveText(value) {
  return String(value || "")
    .replace(/mysql:\/\/[^@\s]+@/gi, "mysql://***@")
    .replace(/(password|passwd|pwd)=([^;&\s]+)/gi, "$1=***");
}

function normalizeDatabaseError(error) {
  const message = error instanceof Error ? error.message : "Database check failed";
  return {
    code: error instanceof ProductionConfigError ? "CONFIG_ERROR" : error?.code || "DB_ERROR",
    errno: error?.errno || null,
    sqlState: error?.sqlState || null,
    message: maskSensitiveText(error?.sqlMessage || message)
  };
}

async function checkDatabase() {
  const startedAt = Date.now();
  try {
    await query("SELECT 1 AS ok");
    return {
      connected: true,
      latencyMs: Date.now() - startedAt,
      error: null
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - startedAt,
      error: normalizeDatabaseError(error)
    };
  }
}

export async function GET() {
  const database = await checkDatabase();
  const ok = database.connected;

  return NextResponse.json({
    ok,
    service: "aksara-bali-platform",
    version: process.env.npm_package_version || "0.1.0",
    database,
    production: productionStatus()
  }, { status: ok ? 200 : 503 });
}
