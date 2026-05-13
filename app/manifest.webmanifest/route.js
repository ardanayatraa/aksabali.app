export const dynamic = "force-static";

export function GET() {
  const manifest = {
    name: "Aksa Bali — Belajar Nyurat Aksara Bali",
    short_name: "Aksa Bali",
    description:
      "Platform belajar Aksara Bali: latihan nyurat dengan stroke recognition, kuis anacaraka, swara, angka, dan game kelas.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAFAFA",
    theme_color: "#B91C1C",
    lang: "id-ID",
    categories: ["education", "books"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ]
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
