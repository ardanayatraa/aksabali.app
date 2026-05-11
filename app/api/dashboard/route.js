import { NextResponse } from "next/server";
import { requireLearner } from "../../../lib/server/auth";
import { getDashboardData } from "../../../lib/server/data";
import { jsonError } from "../../../lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireLearner();
    const data = await getDashboardData(user.id);
    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error, "Failed to load dashboard");
  }
}
