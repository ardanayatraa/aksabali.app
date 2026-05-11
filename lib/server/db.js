import mysql from "mysql2/promise";
import { assertDatabaseConfig } from "./env";

let pool;

export function getPool() {
  if (!pool) {
    const config = assertDatabaseConfig();
    pool = config.uri ? mysql.createPool(config.uri) : mysql.createPool(config);
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export function toJsonValue(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function normalizeRows(rows) {
  return rows.map((row) => ({ ...row }));
}
