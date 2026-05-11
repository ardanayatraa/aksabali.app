import { AppShell } from "../../../components/AppShell";
import { PracticeDrill } from "../../../components/PracticeDrill";
import { practiceModeData } from "../../../lib/practice-modes";
import { redirectNonStudentFromStudentArea } from "../../../lib/server/access";
import { getCurrentUser } from "../../../lib/server/auth";

export const dynamic = "force-dynamic";

export default async function LatihanSwaraPage() {
  let user = null;

  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }
  redirectNonStudentFromStudentArea(user);

  return (
    <AppShell user={user || { display_name: "Siswa", email: "", tier: "free" }}>
      <PracticeDrill {...practiceModeData.swara} />
    </AppShell>
  );
}
