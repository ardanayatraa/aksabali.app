import { redirect } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { GameJoinClient } from "../../../components/GameJoinClient";
import { ProductionSetupNotice } from "../../../components/ProductionSetupNotice";
import { getCurrentUser } from "../../../lib/server/auth";
import { ProductionConfigError } from "../../../lib/server/env";
import { getGameSessionByPin } from "../../../lib/server/game";

export const dynamic = "force-dynamic";

export default async function LobbyPage({ searchParams }) {
  let user;
  let session = null;
  const params = await searchParams;
  const pin = params?.pin?.replace(/\s+/g, "") || "";

  try {
    user = await getCurrentUser();
    if (!user) redirect("/login?next=/game/lobby");
    if (user.role === "admin") redirect("/admin");
    if (user.role === "pengajar") redirect(pin ? `/game/host?pin=${pin}` : "/game/host");
    if (pin) session = await getGameSessionByPin(pin);
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      return <ProductionSetupNotice message={error.message} />;
    }
    throw error;
  }

  return (
    <AppShell user={user}>
      <GameJoinClient initialPin={pin} initialSession={session} user={user} />
    </AppShell>
  );
}
