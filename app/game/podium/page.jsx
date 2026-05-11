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

  return (
    <AppShell user={user}>
      <div className="min-h-[calc(100vh-64px)] px-4 py-8 text-ink sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href={`/game/lobby${pin ? `?pin=${pin}` : ""}`} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-brick">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke lobby
          </Link>

          <header className="mt-6 text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-brick">
              Peringkat kelas
            </p>
            <h1 className="mt-3 font-display text-6xl font-semibold sm:text-8xl">
              {top[0] ? `Selamat, ${top[0].display_name}!` : "Belum ada podium"}
            </h1>
            <p className="mt-3 text-muted-foreground">{session?.title || "Tidak ada sesi aktif"}</p>
          </header>

          {top.length ? (
            <>
              <section className="mt-10 grid items-end gap-5 md:grid-cols-3">
                {[top[1], top[0], top[2]].filter(Boolean).map((player, index) => {
                  const isWinner = index === 1 || player.id === top[0].id;
                  return (
                    <div
                      key={player.id}
                      className={`rounded-[1.7rem] border border-ink/10 bg-rice p-6 text-center text-ink shadow-[0_18px_50px_hsl(var(--foreground)/0.08)] ${
                        isWinner ? "md:min-h-[380px]" : "md:min-h-[310px]"
                      }`}
                    >
                      <div className={`mx-auto grid place-items-center rounded-full ${isWinner ? "h-24 w-24 bg-brick" : "h-20 w-20 bg-lontar"}`}>
                        <Medal className={`${isWinner ? "h-11 w-11 text-primary-foreground" : "h-9 w-9 text-brick"}`} />
                      </div>
                      <p className="mt-6 text-3xl font-black">{player.display_name}</p>
                      <p className="mt-2 text-5xl font-black text-brick">{Number(player.score || 0).toLocaleString("id-ID")}</p>
                    </div>
                  );
                })}
              </section>

              <section className="mt-8 rounded-[1.7rem] border border-ink/10 bg-rice p-6 shadow-[0_18px_50px_hsl(var(--foreground)/0.06)]">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-saffron">
                  Peringkat lanjutan
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  {rest.map((player, index) => (
                    <div key={player.id} className="rounded-2xl bg-lontar px-5 py-4 text-ink">
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/55">#{index + 4}</p>
                      <p className="mt-2 text-xl font-black">{player.display_name}</p>
                      <p className="mt-1 font-bold text-brick">{Number(player.score || 0).toLocaleString("id-ID")}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="mt-10 rounded-[1.7rem] border border-ink/10 bg-rice p-6 text-ink shadow-[0_18px_50px_hsl(var(--foreground)/0.08)]">
              <p className="text-xl font-black">Podium belum tersedia.</p>
              <p className="mt-2 leading-7 text-muted-foreground">
                Selesaikan satu sesi game lebih dulu untuk menampilkan peringkat.
              </p>
            </section>
          )}

          <div className="mt-8 flex justify-center">
            <Link href="/game/lobby" className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-brick px-6 py-3 font-black text-primary-foreground">
              <RotateCcw className="h-4 w-4" />
              Buka lobby
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
