// Quiz materials — semua glyph aksara Bali di-construct dari codepoint Unicode
// via helper di lib/aksara-codepoints.js. TIDAK ada character literal aksara
// di file ini.

import { CP, glyph, pangangge } from "./aksara-codepoints";

export const anacaraka = [
  { id: "ha",  latin: "ha",  glyph: glyph(CP.ha),  group: "Anacaraka" },
  { id: "na",  latin: "na",  glyph: glyph(CP.na),  group: "Anacaraka" },
  { id: "ca",  latin: "ca",  glyph: glyph(CP.ca),  group: "Anacaraka" },
  { id: "ra",  latin: "ra",  glyph: glyph(CP.ra),  group: "Anacaraka" },
  { id: "ka",  latin: "ka",  glyph: glyph(CP.ka),  group: "Anacaraka" },
  { id: "da",  latin: "da",  glyph: glyph(CP.da),  group: "Anacaraka" },
  { id: "ta",  latin: "ta",  glyph: glyph(CP.ta),  group: "Anacaraka" },
  { id: "sa",  latin: "sa",  glyph: glyph(CP.sa),  group: "Anacaraka" },
  { id: "wa",  latin: "wa",  glyph: glyph(CP.wa),  group: "Anacaraka" },
  { id: "la",  latin: "la",  glyph: glyph(CP.la),  group: "Anacaraka" },
  { id: "ma",  latin: "ma",  glyph: glyph(CP.ma),  group: "Anacaraka" },
  { id: "ga",  latin: "ga",  glyph: glyph(CP.ga),  group: "Anacaraka" },
  { id: "ba",  latin: "ba",  glyph: glyph(CP.ba),  group: "Anacaraka" },
  { id: "nga", latin: "nga", glyph: glyph(CP.nga), group: "Anacaraka" },
  { id: "pa",  latin: "pa",  glyph: glyph(CP.pa),  group: "Anacaraka" },
  { id: "ja",  latin: "ja",  glyph: glyph(CP.ja),  group: "Anacaraka" },
  { id: "ya",  latin: "ya",  glyph: glyph(CP.ya),  group: "Anacaraka" },
  { id: "nya", latin: "nya", glyph: glyph(CP.nya), group: "Anacaraka" }
];

export const swara = [
  { id: "ulu",           latin: "ulu (i)",            glyph: pangangge(CP.ulu),          group: "Swara" },
  { id: "suku",          latin: "suku (u)",           glyph: pangangge(CP.suku),         group: "Swara" },
  { id: "taleng",        latin: "taleng (é)",         glyph: pangangge(CP.taleng),       group: "Swara" },
  { id: "pepet",         latin: "pepet (ě)",          glyph: pangangge(CP.pepet),        group: "Swara" },
  { id: "tedung",        latin: "tedung (aa)",        glyph: pangangge(CP.tedung),       group: "Swara" },
  { id: "taleng-tedung", latin: "taleng tedung (o)",  glyph: pangangge(CP.talingTedung), group: "Swara" }
];

export const angka = [
  { id: "0", latin: "0", glyph: glyph(CP.digit0), group: "Angka" },
  { id: "1", latin: "1", glyph: glyph(CP.digit1), group: "Angka" },
  { id: "2", latin: "2", glyph: glyph(CP.digit2), group: "Angka" },
  { id: "3", latin: "3", glyph: glyph(CP.digit3), group: "Angka" },
  { id: "4", latin: "4", glyph: glyph(CP.digit4), group: "Angka" },
  { id: "5", latin: "5", glyph: glyph(CP.digit5), group: "Angka" },
  { id: "6", latin: "6", glyph: glyph(CP.digit6), group: "Angka" },
  { id: "7", latin: "7", glyph: glyph(CP.digit7), group: "Angka" },
  { id: "8", latin: "8", glyph: glyph(CP.digit8), group: "Angka" },
  { id: "9", latin: "9", glyph: glyph(CP.digit9), group: "Angka" }
];

export const gabunganVokal = [
  { id: "ki", latin: "ki", glyph: glyph(CP.ka, CP.ulu),          group: "Gabungan" },
  { id: "ku", latin: "ku", glyph: glyph(CP.ka, CP.suku),         group: "Gabungan" },
  { id: "ke", latin: "ke", glyph: glyph(CP.ka, CP.taleng),       group: "Gabungan" },
  { id: "ko", latin: "ko", glyph: glyph(CP.ka, CP.talingTedung), group: "Gabungan" },
  { id: "bi", latin: "bi", glyph: glyph(CP.ba, CP.ulu),          group: "Gabungan" },
  { id: "bu", latin: "bu", glyph: glyph(CP.ba, CP.suku),         group: "Gabungan" },
  { id: "be", latin: "be", glyph: glyph(CP.ba, CP.taleng),       group: "Gabungan" },
  { id: "bo", latin: "bo", glyph: glyph(CP.ba, CP.talingTedung), group: "Gabungan" },
  { id: "si", latin: "si", glyph: glyph(CP.sa, CP.ulu),          group: "Gabungan" },
  { id: "su", latin: "su", glyph: glyph(CP.sa, CP.suku),         group: "Gabungan" },
  { id: "se", latin: "se", glyph: glyph(CP.sa, CP.taleng),       group: "Gabungan" },
  { id: "so", latin: "so", glyph: glyph(CP.sa, CP.talingTedung), group: "Gabungan" },
  { id: "li", latin: "li", glyph: glyph(CP.la, CP.ulu),          group: "Gabungan" },
  { id: "lu", latin: "lu", glyph: glyph(CP.la, CP.suku),         group: "Gabungan" },
  { id: "le", latin: "le", glyph: glyph(CP.la, CP.taleng),       group: "Gabungan" },
  { id: "lo", latin: "lo", glyph: glyph(CP.la, CP.talingTedung), group: "Gabungan" }
];

export const kataAksara = [
  { id: "bali", latin: "bali", glyph: glyph(CP.ba, CP.la, CP.ulu),         group: "Kata" },
  { id: "sari", latin: "sari", glyph: glyph(CP.sa, CP.ra, CP.ulu),         group: "Kata" },
  { id: "nusa", latin: "nusa", glyph: glyph(CP.na, CP.suku, CP.sa),        group: "Kata" },
  { id: "pura", latin: "pura", glyph: glyph(CP.pa, CP.suku, CP.ra),        group: "Kata" },
  { id: "kala", latin: "kala", glyph: glyph(CP.ka, CP.la),                 group: "Kata" },
  { id: "basa", latin: "basa", glyph: glyph(CP.ba, CP.sa),                 group: "Kata" },
  { id: "guru", latin: "guru", glyph: glyph(CP.ga, CP.suku, CP.ra, CP.suku), group: "Kata" },
  { id: "suka", latin: "suka", glyph: glyph(CP.sa, CP.suku, CP.ka),        group: "Kata" },
  { id: "nadi", latin: "nadi", glyph: glyph(CP.na, CP.da, CP.ulu),         group: "Kata" },
  { id: "dasa", latin: "dasa", glyph: glyph(CP.da, CP.sa),                 group: "Kata" }
];

export const quizMaterials = {
  anacaraka,
  swara,
  angka,
  gabunganVokal,
  kataAksara
};

export const quizBank = [...anacaraka, ...swara, ...angka, ...gabunganVokal, ...kataAksara];
