import { redirect } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { PracticePageContent } from "../../../components/PracticePageContent";
import { ProductionSetupNotice } from "../../../components/ProductionSetupNotice";
import { redirectNonStudentFromStudentArea } from "../../../lib/server/access";
import { getCurrentUser } from "../../../lib/server/auth";
import { getPracticeAksara } from "../../../lib/server/data";
import { ProductionConfigError } from "../../../lib/server/env";
import { loadPublicSvgPaths } from "../../../lib/server/svg";

export const dynamic = "force-dynamic";

export default async function LatihanAksaraPage({ params }) {
  let user;
  let aksara;
  let referencePaths = [];

  try {
    user = await getCurrentUser();
    if (!user) redirect("/login?next=/latihan");
    redirectNonStudentFromStudentArea(user);
    const { aksaraId } = await params;
    aksara = await getPracticeAksara(aksaraId);
    if (!aksara) redirect("/latihan");
    if (aksara?.svg_url?.startsWith("/")) {
      referencePaths = await loadPublicSvgPaths(aksara.svg_url);
    }
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      return <ProductionSetupNotice message={error.message} />;
    }
    throw error;
  }

  return (
    <AppShell user={user}>
      <PracticePageContent aksara={aksara} referencePaths={referencePaths} basePath="/latihan" />
    </AppShell>
  );
}
