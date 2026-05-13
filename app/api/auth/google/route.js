import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ProductionConfigError } from "@/lib/server/env";
import {
  OAUTH_MOBILE_COOKIE,
  OAUTH_REDIRECT_COOKIE,
  OAUTH_STATE_COOKIE,
  buildAuthorizationUrl
} from "@/lib/server/google-auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const next = searchParams.get("next") || "/dashboard";
    const isMobile = searchParams.get("mobile") === "1";
    const state = randomUUID();
    const authorizationUrl = buildAuthorizationUrl(state);

    const response = NextResponse.redirect(authorizationUrl);
    const secure = (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https://");
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 10 * 60
    };
    response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions);
    response.cookies.set(OAUTH_REDIRECT_COOKIE, next.startsWith("/") ? next : "/dashboard", cookieOptions);
    response.cookies.set(OAUTH_MOBILE_COOKIE, isMobile ? "1" : "0", cookieOptions);
    return response;
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 503 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Gagal mulai login Google." },
      { status: 500 }
    );
  }
}
