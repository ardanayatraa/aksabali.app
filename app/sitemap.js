const routes = [
  "",
  "/dashboard",
  "/guru",
  "/profile",
  "/latihan",
  "/latihan/nyurat",
  "/latihan/huruf",
  "/latihan/swara",
  "/latihan/angka",
  "/latihan/kata",
  "/latihan/membaca",
  "/quiz",
  "/quiz/nyurat",
  "/quiz/kata",
  "/quiz/huruf",
  "/quiz/match",
  "/quiz/maca",
  "/quiz/kahoot",
  "/game/host",
  "/game/lobby",
  "/game/live",
  "/game/podium"
];

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aksabali.app";
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
