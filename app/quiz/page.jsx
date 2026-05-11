import { AppShell } from "../../components/AppShell";
import { QuizIndex } from "../../components/QuizIndex";
import { redirectNonStudentFromStudentArea } from "../../lib/server/access";
import { getCurrentUser } from "../../lib/server/auth";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  let user = null;

  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }
  redirectNonStudentFromStudentArea(user);

  return (
    <AppShell user={user || { display_name: "Siswa", email: "", tier: "free" }}>
      <QuizIndex />
    </AppShell>
  );
}
