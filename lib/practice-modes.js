import { anacaraka, angka, gabunganVokal, kataAksara, swara } from "./quiz-data";

export const practiceModeData = {
  huruf: {
    title: "Latihan Huruf",
    eyebrow: "Anacaraka",
    description: "Latih bentuk dan bacaan aksara dasar satu per satu.",
    items: anacaraka
  },
  swara: {
    title: "Latihan Swara AIUEO",
    eyebrow: "Swara",
    description: "Kenali aksara suara a, i, u, e, dan o.",
    items: swara
  },
  angka: {
    title: "Latihan Angka Bali",
    eyebrow: "Angka",
    description: "Latih angka Bali dari nol sampai sembilan.",
    items: angka
  },
  kata: {
    title: "Latihan Kata",
    eyebrow: "Kata",
    description: "Bandingkan kata Latin dengan bentuk aksara Balinya.",
    items: kataAksara
  },
  membaca: {
    title: "Latihan Membaca",
    eyebrow: "Maca Aksara",
    description: "Baca aksara terlebih dulu, lalu buka bacaan Latinnya.",
    items: [...kataAksara, ...gabunganVokal]
  }
};
