import { Suspense } from "react";
import { AuthForm } from "../../components/AuthForm";
import { AuthShell } from "../../components/AuthShell";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Daftar"
      title="Buat akun."
      subtitle="Simpan progres latihanmu di sini."
      switchText="Sudah punya akun?"
      switchHref="/login"
      switchLabel="Masuk"
    >
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </AuthShell>
  );
}
