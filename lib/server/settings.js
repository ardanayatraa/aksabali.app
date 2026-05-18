import { query } from "./db";

export const SITE_MODES = ["live", "coming_soon", "maintenance", "development"];
const DEFAULT_MODE = "live";
const DEFAULT_LAUNCH_AT = "2026-06-30T00:00:00Z";

// In-memory cache shared across requests in the same Node process.
// TTL super pendek (1 detik) supaya toggle dari admin instant kerasanya di public
// route — middleware re-fetch /api/site-mode setiap request. 1s cukup buat hindari
// hammering DB pas burst traffic tapi gak bikin lag waktu admin ganti-ganti mode.
let cache = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 1_000;

async function readAllSettings() {
  const rows = await query("SELECT setting_key, setting_value FROM app_settings");
  const map = {};
  for (const row of rows) map[row.setting_key] = row.setting_value;
  return map;
}

function normalizeSettings(raw) {
  const mode = SITE_MODES.includes(raw.site_mode) ? raw.site_mode : DEFAULT_MODE;
  const launchAt = raw.launch_at && !Number.isNaN(new Date(raw.launch_at).getTime())
    ? new Date(raw.launch_at).toISOString()
    : DEFAULT_LAUNCH_AT;
  return { mode, launchAt };
}

export async function getSiteSettings({ skipCache = false } = {}) {
  const now = Date.now();
  if (!skipCache && cache && now < cacheExpiresAt) return cache;
  try {
    const raw = await readAllSettings();
    cache = normalizeSettings(raw);
    cacheExpiresAt = now + CACHE_TTL_MS;
    return cache;
  } catch {
    // Fail-safe: kalau DB belum ada / tabel belum dimigrate, default ke live.
    return { mode: DEFAULT_MODE, launchAt: DEFAULT_LAUNCH_AT };
  }
}

export function invalidateSettingsCache() {
  cache = null;
  cacheExpiresAt = 0;
}

async function upsertSetting(key, value, userId) {
  await query(
    `INSERT INTO app_settings (setting_key, setting_value, updated_by)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
    [key, value, userId || null]
  );
}

export async function setSiteMode(mode, userId) {
  if (!SITE_MODES.includes(mode)) {
    const error = new Error(`Mode tidak valid. Pilih: ${SITE_MODES.join(", ")}.`);
    error.status = 400;
    throw error;
  }
  await upsertSetting("site_mode", mode, userId);
  invalidateSettingsCache();
}

export async function setLaunchAt(iso, userId) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    const error = new Error("Tanggal launch tidak valid.");
    error.status = 400;
    throw error;
  }
  await upsertSetting("launch_at", d.toISOString(), userId);
  invalidateSettingsCache();
}
