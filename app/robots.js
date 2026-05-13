export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aksabali.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/guru",
          "/guru/",
          "/profile",
          "/profile/",
          "/game/host",
          "/game/live",
          "/game/podium"
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
