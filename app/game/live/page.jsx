import { redirect } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { GameLiveClient } from "../../../components/GameLiveClient";
import { ProductionSetupNotice } from "../../../components/ProductionSetupNotice";
import { getCurrentUser } from "../../../lib/server/auth";
import { ProductionConfigError } from "../../../lib/server/env";
import { getGameSessionByPin } from "../../../lib/server/game";

export const dynamic = "force-dynamic";

export default async function LiveQuestionPage({ searchParams }) {
  let user;
  let session = null;
  const params = await searchParams;
  const pin = params?.pin?.replace(/\s+/g, "") || "";

  try {
    user = await getCurrentUser();
    if (!user) redirect(`/login?next=${encodeURIComponent(`/game/live${pin ? `?pin=${pin}` : ""}`)}`);
    if (user.role === "admin") redirect("/admin");
    if (pin) session = await getGameSessionByPin(pin);
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      return <ProductionSetupNotice message={error.message} />;
    }
    throw error;
  }

  return (
    <AppShell user={user}>
      <GameLiveClient initialSession={session} user={user} />
    </AppShell>
  );
}
