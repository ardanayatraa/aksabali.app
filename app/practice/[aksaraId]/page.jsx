import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PracticeAksaraPage({ params }) {
  const { aksaraId } = await params;
  redirect(`/latihan/${aksaraId}`);
}
