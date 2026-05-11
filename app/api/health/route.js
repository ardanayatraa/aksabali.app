import { NextResponse } from "next/server";
import { productionStatus } from "../../../lib/server/env";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "aksara-bali-platform",
    version: process.env.npm_package_version || "0.1.0",
    production: productionStatus()
  });
}
