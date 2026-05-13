import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Medal, RotateCcw } from "lucide-react";
import { AppShell } from "../../../components/AppShell";
import { ProductionSetupNotice } from "../../../components/ProductionSetupNotice";
import { redirectAdminFromStudentArea } from "../../../lib/server/access";
import { getCurrentUser } from "../../../lib/server/auth";
import { ProductionConfigError } from "../../../lib/server/env";
import { getGameLeaderboard } from "../../../lib/server/game";

export const dynamic = "force-dynamic";

export default async function PodiumPage({ searchParams }) {
  let user;
  let session = null;
  const params = await searchParams;
  const pin = params?.pin?.replace(/\s+/g, "") || "";

  try {
    user = await getCurrentUser();
    if (!user) redirect("/login?next=/game/podium");
    redirectAdminFromStudentArea(user);
    if (pin) session = await getGameLeaderboard(pin);
  } catch (error) {
    if (error instanceof ProductionConfigError) {
      return <ProductionSetupNotice message={error.message} />;
    }
    throw error;
  }

  const top = session?.players?.slice(0, 3) || [];
  const rest = session?.players?.slice(3, 8) || [];
  const podiumOrder = [top[1], top[0], top[2]].filter(Boolean);
  const winnerId = top[0]?.id;

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href={`/game/lobby${pin ? `?pin=${pin}` : ""}`}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/55 hover:text-brick"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke lobby
        </Link>

        {/* Hero flat */}
        <section className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brick">Peringkat kelas</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {top[0] ? `Selamat, ${top[0].display_name}.` : "Belum ada podium."}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            {session?.title || "Selesaikan satu sesi game lebih dulu untuk menampilkan peringkat."}
          </p>
        </section>

        {top.length ? (
          <>
            {/* Top 3 */}
            <section className="mt-10 grid items-end gap-3 sm:grid-cols-3">
              {podiumOrder.map((player) => {
                const isWinner = player.id === winnerId;
                return (
                  <div
                    key={player.id}
                    className={`rounded-2xl border bg-rice p-6 text-center text-ink ${
                      isWinner
                        ? "border-brick/40 sm:min-h-[300px] sm:order-2"
                        : "border-ink/[0.08] sm:min-h-[240px]"
                    }`}
                  >
                    <div
                      className={`mx-auto grid place-items-center rounded-2xl ${
                        isWinner ? "h-16 w-16 bg-brick text-primary-foreground" : "h-14 w-14 bg-brick/10 text-brick"
                      }`}
                    >
                      <Medal className={isWinner ? "h-8 w-8" : "h-7 w-7"} />
                    </div>
                    <p className="mt-5 truncate text-lg font-extrabold tracking-tight">{player.display_name}</p>
                    <p className="mt-1 text-3xl font-extrabold text-brick">
                      {Number(player.score || 0).toLocaleString("id-ID")}
                    </p>
                    <p className="mt-1 text-[0.65rem] font-black uppercase tracking-widest text-ink/45">poin</p>
                  </div>
                );
              })}
            </section>

            {/* Rest as flat list with dividers */}
            {rest.length > 0 && (
              <section className="mt-6 rounded-2xl border border-ink/[0.08] bg-rice">
                <p className="px-6 pt-5 text-[0.68rem] font-black uppercase tracking-[0.18em] text-ink/45">
                  Peringkat lanjutan
                </p>
                <ul className="mt-3 divide-y divide-ink/[0.08]">
                  {rest.map((player, index) => (
                    <li key={player.id} className="flex items-center justify-between gap-4 px-6 py-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-widest text-ink/45">
                          #{index + 4}
                        </span>
                        <p className="min-w-0 truncate text-base font-bold">{player.display_name}</p>
                      </div>
                      <p className="text-lg font-extrabold text-brick">
                        {Number(player.score || 0).toLocaleString("id-ID")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Link
            href="/game/lobby"
            className="inline-flex items-center gap-2 rounded-full bg-brick px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-brick/90"
          >
            <RotateCcw className="h-4 w-4" />
            Buka lobby
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold text-ink/80 transition hover:border-ink/40 hover:text-ink"
          >
            Kembali ke dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
