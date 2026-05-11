import { Suspense } from "react";
import { AuthForm } from "../../components/AuthForm";
import { AuthShell } from "../../components/AuthShell";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Masuk"
      title="Masuk."
      subtitle="Lanjutkan latihan dari akunmu."
      switchText="Belum punya akun?"
      switchHref="/register"
      switchLabel="Buat akun"
    >
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
