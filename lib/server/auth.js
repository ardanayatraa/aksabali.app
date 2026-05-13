import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { assertJwtSecret, getAppUrl } from "./env";
import { query } from "./db";

const COOKIE_NAME = "aksara_session";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const JWT_EXPIRES_SECONDS = 60 * 60 * 24 * 7;

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role || "siswa"
    },
    assertJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, assertJwtSecret());
  } catch {
    return null;
  }
}

async function getTokenFromRequest(request) {
  const authorization =
    request?.headers?.get?.("authorization") || request?.headers?.get?.("Authorization") || "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  if (!request) {
    const headerStore = await headers();
    const headerAuthorization = headerStore.get("authorization") || "";
    if (headerAuthorization.toLowerCase().startsWith("bearer ")) {
      return headerAuthorization.slice(7).trim();
    }
  }

  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

export function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    role: user.role,
    tier: user.tier,
    status: user.status || "active",
    email_verified_at: user.email_verified_at || null
  };
}

function assertActive(user) {
  if (user?.status === "suspended") {
    const error = new Error("Akun ini di-suspend admin. Hubungi tim Aksa Bali kalau ada yang perlu dibahas.");
    error.status = 403;
    throw error;
  }
  return user;
}

export async function getProfileById(userId) {
  const rows = await query(
    `SELECT id, email, role, tier, status, display_name, email_verified_at
     FROM profiles
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );
  return sanitizeUser(rows[0] || null);
}

export async function getCurrentUser(request) {
  const token = await getTokenFromRequest(request);
  const decoded = verifyToken(token);
  if (!decoded?.sub) return null;
  return getProfileById(decoded.sub);
}

export async function requireCurrentUser(request) {
  const user = await getCurrentUser(request);
  if (!user) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  assertActive(user);
  return user;
}

export async function requireAdmin(request) {
  const user = await requireCurrentUser(request);
  if (user.role !== "admin") {
    const error = new Error("Admin access required");
    error.status = 403;
    throw error;
  }
  return user;
}

export async function requireTeacher(request) {
  const user = await requireCurrentUser(request);
  if (user.role !== "pengajar") {
    const error = new Error("Akun guru diperlukan untuk membuat atau mengatur sesi.");
    error.status = 403;
    throw error;
  }
  return user;
}

export async function requireStudent(request) {
  const user = await requireCurrentUser(request);
  if (user.role === "admin") {
    const error = new Error("Akun admin hanya untuk kelola konten.");
    error.status = 403;
    throw error;
  }
  if (user.role === "pengajar") {
    const error = new Error("Akun guru tidak bisa bermain sebagai siswa.");
    error.status = 403;
    throw error;
  }
  return user;
}

export function assertLearnerAccess(user) {
  if (user?.role === "admin") {
    const error = new Error("Akun admin hanya untuk kelola konten.");
    error.status = 403;
    throw error;
  }
  if (user?.role === "pengajar") {
    const error = new Error("Akun guru memakai ruang guru, bukan area latihan siswa.");
    error.status = 403;
    throw error;
  }
  return user;
}

export async function requireLearner(request) {
  const user = await requireCurrentUser(request);
  return assertLearnerAccess(user);
}

async function resolveRegistrationRole({ role, adminKey }) {
  if (role === "pengajar") return "pengajar";
  if (role !== "admin") return "siswa";

  const configuredKey = process.env.ADMIN_REGISTRATION_KEY || "";
  if (configuredKey && String(adminKey || "") === configuredKey) return "admin";

  const [summary] = await query("SELECT COUNT(*) AS total FROM profiles");
  if (Number(summary?.total || 0) === 0) return "admin";

  const error = new Error("Kode admin tidak valid.");
  error.status = 403;
  throw error;
}

export async function registerUser({ email, password, displayName, role = "siswa", adminKey = "" }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !String(password || "").trim()) {
    const error = new Error("Email dan password wajib diisi.");
    error.status = 400;
    throw error;
  }
  if (String(password).length < 8) {
    const error = new Error("Password minimal 8 karakter.");
    error.status = 400;
    throw error;
  }

  const existing = await query("SELECT id FROM profiles WHERE email = ? LIMIT 1", [normalizedEmail]);
  if (existing.length) {
    const error = new Error("Email sudah terdaftar.");
    error.status = 409;
    throw error;
  }

  const id = randomUUID();
  const name = String(displayName || normalizedEmail.split("@")[0]).trim();
  const passwordHash = await bcrypt.hash(String(password), 12);
  const registrationRole = await resolveRegistrationRole({ role, adminKey });

  await query(
    `INSERT INTO profiles (id, email, display_name, role, tier, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'free', NOW(), NOW())`,
    [id, normalizedEmail, name, registrationRole]
  );
  await query(
    `INSERT INTO user_credentials (user_id, password_hash, created_at, updated_at)
     VALUES (?, ?, NOW(), NOW())`,
    [id, passwordHash]
  );

  return getProfileById(id);
}

// Cari atau bikin akun siswa berdasarkan email dari Google. Tidak butuh password
// karena auth-nya via provider. Kalau user belum ada -> dibuat sebagai siswa free,
// password_hash di-fill placeholder acak (user nggak akan login pakai password).
export async function findOrCreateGoogleUser({ email, displayName, emailVerified = true }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    const error = new Error("Email Google tidak valid.");
    error.status = 400;
    throw error;
  }

  const existing = await query(
    `SELECT id, email, display_name, role, tier, status, email_verified_at
     FROM profiles
     WHERE email = ?
     LIMIT 1`,
    [normalizedEmail]
  );
  if (existing.length) {
    const user = existing[0];
    assertActive(user);
    if (emailVerified && !user.email_verified_at) {
      await query("UPDATE profiles SET email_verified_at = NOW() WHERE id = ?", [user.id]).catch(() => {});
    }
    return sanitizeUser(user);
  }

  const id = randomUUID();
  const name = String(displayName || normalizedEmail.split("@")[0]).trim();
  const placeholderHash = await bcrypt.hash(randomUUID(), 12);

  await query(
    `INSERT INTO profiles (id, email, display_name, role, tier, email_verified_at, created_at, updated_at)
     VALUES (?, ?, ?, 'siswa', 'free', ${emailVerified ? "NOW()" : "NULL"}, NOW(), NOW())`,
    [id, normalizedEmail, name]
  );
  await query(
    `INSERT INTO user_credentials (user_id, password_hash, created_at, updated_at)
     VALUES (?, ?, NOW(), NOW())`,
    [id, placeholderHash]
  );

  return getProfileById(id);
}

export async function loginUser({ email, password }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const rows = await query(
    `SELECT p.id, p.email, p.display_name, p.role, p.tier, p.status, p.email_verified_at, uc.password_hash
     FROM profiles p
     JOIN user_credentials uc ON uc.user_id = p.id
     WHERE p.email = ?
     LIMIT 1`,
    [normalizedEmail]
  );

  const user = rows[0];
  if (!user || !(await bcrypt.compare(String(password || ""), user.password_hash))) {
    const error = new Error("Email atau password salah.");
    error.status = 401;
    throw error;
  }
  assertActive(user);

  return sanitizeUser(user);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: getAppUrl().startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
