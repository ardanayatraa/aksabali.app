import { NextResponse } from "next/server";
import { findOrCreateGoogleUser, sessionCookieOptions, SESSION_COOKIE_NAME, signToken } from "@/lib/server/auth";
import { getAppUrl, ProductionConfigError } from "@/lib/server/env";
import {
  MOBILE_DEEP_LINK_SCHEME,
  OAUTH_MOBILE_COOKIE,
  OAUTH_REDIRECT_COOKIE,
  OAUTH_STATE_COOKIE,
  exchangeCodeForTokens,
  verifyIdToken
} from "@/lib/server/google-auth";

export const dynamic = "force-dynamic";

function homePathForRole(role) {
  if (role === "admin") return "/admin";
  if (role === "pengajar") return "/guru";
  return "/dashboard";
}

function errorRedirect(message, isMobile = false) {
  if (isMobile) {
    return NextResponse.redirect(`${MOBILE_DEEP_LINK_SCHEME}?error=${encodeURIComponent(message)}`);
  }
  const base = getAppUrl().replace(/\/$/, "");
  return NextResponse.redirect(`${base}/login?error=${encodeURIComponent(message)}`);
}

function clearOauthCookies(response) {
  response.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(OAUTH_REDIRECT_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(OAUTH_MOBILE_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function GET(request) {
  const cookies = request.cookies;
  const isMobile = cookies.get(OAUTH_MOBILE_COOKIE)?.value === "1";

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) return errorRedirect(`Login Google dibatalkan: ${error}`, isMobile);
    if (!code || !state) return errorRedirect("Parameter Google tidak lengkap.", isMobile);

    const expectedState = cookies.get(OAUTH_STATE_COOKIE)?.value;
    const next = cookies.get(OAUTH_REDIRECT_COOKIE)?.value || "/dashboard";
    if (!expectedState || state !== expectedState) {
      return errorRedirect("State tidak cocok. Coba lagi.", isMobile);
    }

    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.id_token) return errorRedirect("Token Google tidak diterima.", isMobile);

    const profile = await verifyIdToken(tokens.id_token);
    const user = await findOrCreateGoogleUser({
      email: profile.email,
      displayName: profile.name,
      emailVerified: profile.emailVerified
    });
    if (!user) return errorRedirect("Akun tidak bisa dibuat.", isMobile);

    const token = signToken(user);

    // Mobile branch: redirect ke deep link aksabali://auth?token=<JWT>
    if (isMobile) {
      const deepLink = `${MOBILE_DEEP_LINK_SCHEME}?token=${encodeURIComponent(token)}&role=${encodeURIComponent(user.role)}`;
      const response = NextResponse.redirect(deepLink);
      clearOauthCookies(response);
      return response;
    }

    // Web branch (default): set cookie + redirect ke dashboard/guru/admin
    const finalNext = next.startsWith("/") ? next : homePathForRole(user.role);
    const base = getAppUrl().replace(/\/$/, "");
    const response = NextResponse.redirect(
      `${base}${finalNext === "/dashboard" ? homePathForRole(user.role) : finalNext}`
    );
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    clearOauthCookies(response);
    return response;
  } catch (err) {
    if (err instanceof ProductionConfigError) {
      return errorRedirect(err.message, isMobile);
    }
    return errorRedirect(err instanceof Error ? err.message : "Login Google gagal.", isMobile);
  }
}
