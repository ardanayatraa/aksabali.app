import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/server/auth";
import { jsonError } from "../../../../lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ data: { user } });
  } catch (error) {
    return jsonError(error, "Failed to load profile");
  }
}
