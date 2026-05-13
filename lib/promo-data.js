// Promo "Only25k" — 200 orang pertama dapet Premium Rp 25rb.
// Sumber dummy untuk banner di landing + halaman /only25k.
// Nanti pas DB siap, ganti getter di sini ke query ke tabel promo_claims.

export const promoConfig = {
  slug: "only25k",
  total: 200,
  price: 25000,
  originalPrice: 49000,
  validUntil: "2026-06-30"
};

export const promoSlots = [
  { id: 1, name: "I Made Wirawan", claimedAt: "2026-04-08T08:15:00Z", city: "Denpasar" },
  { id: 2, name: "Ni Putu Ayu Lestari", claimedAt: "2026-04-08T09:02:00Z", city: "Gianyar" },
  { id: 3, name: "I Nyoman Bagus Surya", claimedAt: "2026-04-08T11:38:00Z", city: "Tabanan" },
  { id: 4, name: "Ni Kadek Diah Pertiwi", claimedAt: "2026-04-09T07:21:00Z", city: "Klungkung" },
  { id: 5, name: "I Wayan Adi Saputra", claimedAt: "2026-04-09T08:05:00Z", city: "Singaraja" },
  { id: 6, name: "Ni Komang Indah Sari", claimedAt: "2026-04-09T10:44:00Z", city: "Denpasar" },
  { id: 7, name: "I Ketut Darma Yuda", claimedAt: "2026-04-09T14:12:00Z", city: "Bangli" },
  { id: 8, name: "Ni Wayan Sri Utari", claimedAt: "2026-04-10T06:58:00Z", city: "Karangasem" },
  { id: 9, name: "I Putu Eka Pranata", claimedAt: "2026-04-10T09:30:00Z", city: "Denpasar" },
  { id: 10, name: "Ni Made Ratna Dewi", claimedAt: "2026-04-10T12:15:00Z", city: "Ubud" },
  { id: 11, name: "I Gusti Ngurah Bagus", claimedAt: "2026-04-11T08:42:00Z", city: "Denpasar" },
  { id: 12, name: "Ni Luh Putu Cahaya", claimedAt: "2026-04-11T11:20:00Z", city: "Gianyar" },
  { id: 13, name: "I Made Krisna Arya", claimedAt: "2026-04-11T15:50:00Z", city: "Tabanan" },
  { id: 14, name: "Ni Putu Maharani", claimedAt: "2026-04-12T07:14:00Z", city: "Klungkung" },
  { id: 15, name: "I Ketut Gede Pratama", claimedAt: "2026-04-12T09:08:00Z", city: "Singaraja" },
  { id: 16, name: "Ni Kadek Sinta Maharani", claimedAt: "2026-04-12T13:35:00Z", city: "Denpasar" },
  { id: 17, name: "I Wayan Yoga Bagaskara", claimedAt: "2026-04-13T08:20:00Z", city: "Negara" },
  { id: 18, name: "Ni Komang Tirta Sari", claimedAt: "2026-04-13T10:55:00Z", city: "Bangli" },
  { id: 19, name: "I Nyoman Rai Wibawa", claimedAt: "2026-04-13T14:18:00Z", city: "Karangasem" },
  { id: 20, name: "Ni Made Trisna Wati", claimedAt: "2026-04-14T07:42:00Z", city: "Denpasar" },
  { id: 21, name: "I Putu Surya Negara", claimedAt: "2026-04-14T09:25:00Z", city: "Ubud" },
  { id: 22, name: "Ni Wayan Asri Pratiwi", claimedAt: "2026-04-14T11:48:00Z", city: "Gianyar" },
  { id: 23, name: "I Kadek Bayu Pradnyana", claimedAt: "2026-04-15T08:10:00Z", city: "Tabanan" },
  { id: 24, name: "Ni Luh De Kartika", claimedAt: "2026-04-15T12:33:00Z", city: "Klungkung" },
  { id: 25, name: "I Made Yudistira", claimedAt: "2026-04-16T07:55:00Z", city: "Singaraja" },
  { id: 26, name: "Ni Putu Bunga Cempaka", claimedAt: "2026-04-16T10:18:00Z", city: "Denpasar" },
  { id: 27, name: "I Nyoman Pasek Wirawan", claimedAt: "2026-04-16T14:40:00Z", city: "Bangli" },
  { id: 28, name: "Ni Kadek Wulan Suryani", claimedAt: "2026-04-17T08:25:00Z", city: "Negara" },
  { id: 29, name: "I Wayan Adi Wiguna", claimedAt: "2026-04-17T11:02:00Z", city: "Denpasar" },
  { id: 30, name: "Ni Komang Ratih Pradnya", claimedAt: "2026-04-18T07:48:00Z", city: "Karangasem" },
  { id: 31, name: "I Gede Putra Manuaba", claimedAt: "2026-04-18T09:35:00Z", city: "Gianyar" },
  { id: 32, name: "Ni Made Sri Wahyuni", claimedAt: "2026-04-19T08:12:00Z", city: "Tabanan" },
  { id: 33, name: "I Putu Aditya Pranata", claimedAt: "2026-04-19T13:22:00Z", city: "Klungkung" },
  { id: 34, name: "Ni Luh Eka Cahyani", claimedAt: "2026-04-20T07:30:00Z", city: "Denpasar" },
  { id: 35, name: "I Ketut Hendra Wijaya", claimedAt: "2026-04-20T10:08:00Z", city: "Ubud" },
  { id: 36, name: "Ni Wayan Diah Permata", claimedAt: "2026-04-21T09:18:00Z", city: "Singaraja" },
  { id: 37, name: "I Kadek Mahendra Putra", claimedAt: "2026-04-21T12:45:00Z", city: "Bangli" },
  { id: 38, name: "Ni Komang Ayu Lestari", claimedAt: "2026-04-22T08:32:00Z", city: "Denpasar" }
];

export function getInitials(name) {
  return name
    .split(/\s+/)
    .filter((part) => part.length > 1)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function maskName(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  const initials = parts.slice(0, -1).join(" ");
  return `${initials} ${last[0]}***`;
}
