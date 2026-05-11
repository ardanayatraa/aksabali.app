import { NextResponse } from "next/server";
import { ProductionConfigError } from "./env";

export function jsonOk(data = {}, init = {}) {
  return NextResponse.json(
    {
      success: true,
      data
    },
    init
  );
}

export function jsonError(error, fallback = "Request failed") {
  const status = error?.status || (error instanceof ProductionConfigError ? 503 : 500);
  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : fallback
    },
    { status }
  );
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
