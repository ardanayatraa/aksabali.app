import { readFile } from "node:fs/promises";
import path from "node:path";

function normalizePathData(pathData) {
  return String(pathData || "").replace(/\s+/g, " ").trim();
}

export async function loadPublicSvgPaths(svgUrl) {
  if (!svgUrl || !svgUrl.startsWith("/")) return [];
  const cleanPath = svgUrl.split("?")[0].replace(/^\/+/, "");
  const publicDir = path.resolve(process.cwd(), "public");
  const absolutePath = path.resolve(publicDir, cleanPath);
  if (!absolutePath.startsWith(publicDir)) return [];
  const svg = await readFile(absolutePath, "utf8");
  return [...svg.matchAll(/<path\b[^>]*\sd=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => normalizePathData(match[1]))
    .filter(Boolean);
}
