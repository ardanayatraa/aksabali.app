import { redirect } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { GameHostConsole } from "../../../components/GameHostConsole";
import { ProductionSetupNotice } from "../../../components/ProductionSetupNotice";
import { getCurrentUser } from "../../../lib/server/auth";
import { ProductionConfigError } from "../../../lib/server/env";
import { getGameSessionByPin } from "../../../lib/server/game";

export const dynamic = "force-dynamic";

export default async function GameHostPage({ searchParams }) {
  let user;
  let session = null;
  const params = await searchParams;
  const pin = params?.pin?.replace(/\s+/g, "") || "";

  try {
    user = await getCurrentUser();
    if (!user) redirect("/login?next=/game/host&role=pengajar");
    if (user.role === "admin") redirect("/admin");
    if (user.role !== "pengajar") redirect("/game/lobby");
    if (pin) {
      const found = await getGameSessionByPin(pin);
      session = found?.host_id === user.id ? found : null;
    }
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      return <ProductionSetupNotice message={error.message} />;
    }
    throw error;
  }

  return (
    <AppShell user={user}>
      <GameHostConsole initialSession={session} />
    </AppShell>
  );
}
