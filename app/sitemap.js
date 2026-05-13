// Halaman public yang prioritas di-crawl. Private/auth pages (dashboard, profile,
// game/live) sengaja nggak masuk supaya bot fokus ke landing + materi.
const publicRoutes = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/latihan", priority: 0.9, changeFrequency: "weekly" },
  { path: "/latihan/nyurat", priority: 0.85, changeFrequency: "weekly" },
  { path: "/latihan/huruf", priority: 0.85, changeFrequency: "weekly" },
  { path: "/latihan/swara", priority: 0.85, changeFrequency: "weekly" },
  { path: "/latihan/angka", priority: 0.85, changeFrequency: "weekly" },
  { path: "/latihan/kata", priority: 0.8, changeFrequency: "weekly" },
  { path: "/latihan/membaca", priority: 0.8, changeFrequency: "weekly" },
  { path: "/quiz", priority: 0.85, changeFrequency: "weekly" },
  { path: "/quiz/nyurat", priority: 0.8, changeFrequency: "weekly" },
  { path: "/quiz/kata", priority: 0.8, changeFrequency: "weekly" },
  { path: "/quiz/huruf", priority: 0.8, changeFrequency: "weekly" },
  { path: "/quiz/match", priority: 0.7, changeFrequency: "weekly" },
  { path: "/quiz/maca", priority: 0.7, changeFrequency: "weekly" },
  { path: "/quiz/acak", priority: 0.7, changeFrequency: "weekly" },
  { path: "/login", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" }
];

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aksabali.app";
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
