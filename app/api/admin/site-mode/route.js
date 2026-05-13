import { requireAdmin } from "../../../../lib/server/auth";
import { jsonError, jsonOk, readJson } from "../../../../lib/server/http";
import {
  getSiteSettings,
  setLaunchAt,
  setSiteMode,
  SITE_MODES
} from "../../../../lib/server/settings";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await requireAdmin(request);
    const settings = await getSiteSettings({ skipCache: true });
    return jsonOk({ ...settings, validModes: SITE_MODES });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    const user = await requireAdmin(request);
    const body = await readJson(request);
    if (body.mode !== undefined) {
      await setSiteMode(body.mode, user.id);
    }
    if (body.launchAt !== undefined) {
      await setLaunchAt(body.launchAt, user.id);
    }
    const settings = await getSiteSettings({ skipCache: true });
    return jsonOk({ ...settings, validModes: SITE_MODES });
  } catch (error) {
    return jsonError(error);
  }
}
