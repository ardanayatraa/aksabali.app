import { notFound } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { QuizStudio } from "../../../components/QuizStudio";
import { redirectNonStudentFromStudentArea } from "../../../lib/server/access";
import { getCurrentUser } from "../../../lib/server/auth";
import { getPracticeAksara } from "../../../lib/server/data";
import { loadPublicSvgPaths } from "../../../lib/server/svg";
import { CP, glyph } from "../../../lib/aksara-codepoints";

export const dynamic = "force-dynamic";

const validModes = new Set(["nyurat", "kata", "huruf", "match", "maca", "acak"]);
const fallbackStrokeQuiz = {
  aksaraId: "gabungan-vokal-ki-1B13-1B36",
  name: "Ki",
  latin: "ki",
  glyph: glyph(CP.ka, CP.ulu),
  category: "gabungan-vokal",
  svgUrl: "/aksara/strokes/gabungan-vokal/ki-1B13-1B36.svg"
};

export default async function QuizModePage({ params }) {
  const { mode } = await params;
  if (!validModes.has(mode)) notFound();

  let user = null;
  let strokeQuiz = null;

  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }
  redirectNonStudentFromStudentArea(user);

  try {
    const aksara = await getPracticeAksara();
    const referencePaths = aksara?.svg_url?.startsWith("/") ? await loadPublicSvgPaths(aksara.svg_url) : [];
    if (aksara && referencePaths.length) {
      strokeQuiz = {
        aksaraId: aksara.id,
        name: aksara.name,
        latin: aksara.latin,
        glyph: aksara.glyph,
        category: aksara.category,
        referencePaths
      };
    }
  } catch {
    const referencePaths = await loadPublicSvgPaths(fallbackStrokeQuiz.svgUrl).catch(() => []);
    if (referencePaths.length) {
      strokeQuiz = {
        ...fallbackStrokeQuiz,
        referencePaths
      };
    }
  }

  return (
    <AppShell user={user || { display_name: "Siswa", email: "", tier: "free" }}>
      <QuizStudio key={mode} initialMode={mode} strokeQuiz={strokeQuiz} canSaveStroke={Boolean(user?.id)} showOverview={false} />
    </AppShell>
  );
}
