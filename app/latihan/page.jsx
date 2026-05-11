import { AppShell } from "../../components/AppShell";
import { PracticeIndex } from "../../components/PracticeIndex";
import { redirectNonStudentFromStudentArea } from "../../lib/server/access";
import { getCurrentUser } from "../../lib/server/auth";
import { getPracticeCatalog } from "../../lib/server/data";
import { ProductionConfigError } from "../../lib/server/env";

export const dynamic = "force-dynamic";

const fallbackCatalog = [
  {
    id: "gabungan-vokal-ki-1B13-1B36",
    name: "Ki",
    glyph: "ᬓᬶ",
    latin: "ki",
    category: "gabungan-vokal",
    is_premium: false,
    svg_url: "/aksara/strokes/gabungan-vokal/ki-1B13-1B36.svg",
    image_url: "/aksara/cards/gabungan-vokal/ki-1B13-1B36.noto.png",
    target_stroke_count: 2,
    notes: "Materi Ki. Ulu memakai U+1B36, sehingga bacaan yang benar adalah ki."
  }
];

export default async function LatihanPage() {
  let user = null;
  let catalog = fallbackCatalog;

  try {
    user = await getCurrentUser();
    redirectNonStudentFromStudentArea(user);
    catalog = await getPracticeCatalog();
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      catalog = fallbackCatalog;
    } else {
      throw error;
    }
  }

  return (
    <AppShell user={user || { display_name: "Siswa", email: "", tier: "free" }}>
      <PracticeIndex catalog={catalog} basePath="/latihan" />
    </AppShell>
  );
}
