import { NextResponse } from "next/server";
import { readJson, jsonError } from "../../../../lib/server/http";
import { JWT_EXPIRES_SECONDS, registerUser, sessionCookieOptions, signToken, SESSION_COOKIE_NAME } from "../../../../lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await readJson(request);
    const user = await registerUser({
      email: body.email,
      password: body.password,
      displayName: body.displayName,
      role: body.role,
      adminKey: body.adminKey
    });
    const token = signToken(user);
    const response = NextResponse.json(
      { data: { user, token, tokenType: "Bearer", expiresIn: JWT_EXPIRES_SECONDS } },
      { status: 201 }
    );
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } catch (error) {
    return jsonError(error, "Registration failed");
  }
}
