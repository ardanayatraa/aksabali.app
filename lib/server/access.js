import { redirect } from "next/navigation";

export function isAdminUser(user) {
  return user?.role === "admin";
}

export function isTeacherUser(user) {
  return user?.role === "pengajar";
}

export function isStudentUser(user) {
  return user?.role === "siswa" || user?.role === "user" || !user?.role;
}

export function redirectAdminFromStudentArea(user) {
  if (isAdminUser(user)) redirect("/admin");
}

export function redirectNonStudentFromStudentArea(user) {
  if (isAdminUser(user)) redirect("/admin");
  if (isTeacherUser(user)) redirect("/guru");
}

export function redirectAdminFromGameArea(user) {
  if (isAdminUser(user)) redirect("/admin");
}

// Entitlement: apakah user berhak akses konten premium (svg_url premium, dll).
// Admin & pengajar selalu berhak (untuk preview konten). Siswa harus tier !== 'free'.
export function isEntitledToPremium(user) {
  if (!user) return false;
  if (user.role === "admin" || user.role === "pengajar") return true;
  return user.tier === "premium" || user.tier === "lite";
}

// Strip field-field premium dari aksara entry kalau user nggak berhak.
// Mengembalikan entry baru — tidak memodifikasi argumen.
export function gateAksaraEntry(entry, user) {
  if (!entry?.is_premium) return entry;
  if (isEntitledToPremium(user)) return entry;
  return { ...entry, svg_url: null, audio_url: null };
}
