import { jsonError, jsonOk } from "../../../lib/server/http";
import { getSiteSettings } from "../../../lib/server/settings";

export const dynamic = "force-dynamic";

// Public endpoint — dipakai middleware untuk decide redirect, dan client-side
// untuk render countdown di /coming-soon. Tidak butuh auth.
export async function GET() {
  try {
    const settings = await getSiteSettings();
    return jsonOk(settings, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
