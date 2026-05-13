import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Register manual dimatikan — semua jalur daftar/masuk pakai Google di /login.
// Query param dilanjut biar konteks (mis. ?promo=only25k) tetap nyampai.
export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v));
    } else if (value != null) {
      qs.set(key, String(value));
    }
  }
  const query = qs.toString();
  redirect(query ? `/login?${query}` : "/login");
}
