import { OAuth2Client } from "google-auth-library";
import { ProductionConfigError } from "./env";

export const OAUTH_STATE_COOKIE = "aksara_oauth_state";
export const OAUTH_REDIRECT_COOKIE = "aksara_oauth_next";
export const OAUTH_MOBILE_COOKIE = "aksara_oauth_mobile";
export const MOBILE_DEEP_LINK_SCHEME = "aksabali://auth";

function assertGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new ProductionConfigError(
      "GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET belum diisi di environment."
    );
  }
  return { clientId, clientSecret };
}

export function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function buildAuthorizationUrl(state) {
  const { clientId } = assertGoogleConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account"
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code) {
  const { clientId, clientSecret } = assertGoogleConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code"
    })
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Gagal exchange code Google: ${response.status} ${text}`);
  }
  return response.json();
}

export async function verifyIdToken(idToken) {
  const { clientId } = assertGoogleConfig();
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error("Token Google tidak mengandung email.");
  return {
    email: payload.email,
    emailVerified: Boolean(payload.email_verified),
    name: payload.name || payload.given_name || payload.email.split("@")[0],
    picture: payload.picture || null,
    sub: payload.sub
  };
}
