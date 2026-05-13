import { Suspense } from "react";
import { AuthShell } from "../../components/AuthShell";
import { GoogleLoginButton } from "../../components/GoogleLoginButton";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Masuk"
      title="Masuk."
      subtitle="Khusus siswa & pelajar. Login pakai akun Google — akun baru otomatis dibuat."
    >
      <Suspense>
        <GoogleLoginButton next="/dashboard" />
      </Suspense>
    </AuthShell>
  );
}
