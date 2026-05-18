import { NextResponse } from "next/server";

// Path prefix yang SELALU lolos middleware (admin tetap bisa kerja, auth tetap jalan,
// dan halaman target mode tetap accessible supaya tidak loop redirect).
const ALWAYS_ALLOW_PREFIXES = [
  "/api/",
  "/admin",
  "/login",
  "/coming-soon",
  "/maintenance",
  "/development",
  "/_next/",
  "/aksara/",
  "/og-image.png",
  "/icon",
  "/apple-touch-icon",
  "/favicon",
  "/manifest",
  "/robots",
  "/sitemap"
];

export const config = {
  // Eksklusi asset statis biar middleware tidak jalan di setiap file.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|css|js|map)).*)"]
};

function isAlwaysAllowed(pathname) {
  for (const prefix of ALWAYS_ALLOW_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix)) return true;
  }
  return false;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (isAlwaysAllowed(pathname)) return NextResponse.next();

  try {
    const apiUrl = new URL("/api/site-mode", request.url);
    const res = await fetch(apiUrl.toString(), {
      cache: "no-store",
      headers: { "x-middleware-source": "site-mode" }
    });
    if (!res.ok) return NextResponse.next();
    const json = await res.json();
    const mode = json?.data?.mode || "live";

    if (mode === "coming_soon") {
      // rewrite (bukan redirect) — URL di browser tetap, content dari /coming-soon.
      return NextResponse.rewrite(new URL("/coming-soon", request.url));
    }
    if (mode === "maintenance") {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
    if (mode === "development") {
      // Internal staging — guest (no session cookie) di-rewrite ke /development
      // (dedicated landing yg jelas nampilin "DEVELOPMENT MODE" + tombol login tim
      // + tombol admin). User yg udah login lolos normal.
      const hasSession = Boolean(request.cookies.get("aksara_session")?.value);
      if (!hasSession) {
        return NextResponse.rewrite(new URL("/development", request.url));
      }
    }
  } catch {
    // Fail open — kalau site-mode API mati, jangan blok user.
  }

  return NextResponse.next();
}
