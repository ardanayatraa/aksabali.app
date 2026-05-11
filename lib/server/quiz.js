import { randomUUID } from "node:crypto";
import { anacaraka, angka, gabunganVokal, kataAksara, quizBank, swara } from "../quiz-data";

export const quizModes = [
  {
    id: "nyurat",
    title: "Kuis Nyurat",
    description: "Lihat bacaan Latin, pilih aksara Balinya.",
    answerType: "choice"
  },
  {
    id: "kata",
    title: "Tebak Kata Bolak Balik",
    description: "Aksara ke Latin, lalu Latin ke aksara.",
    answerType: "choice"
  },
  {
    id: "huruf",
    title: "Tebak Huruf Bolak Balik",
    description: "Latih anacaraka, swara, dan angka dua arah.",
    answerType: "choice"
  },
  {
    id: "match",
    title: "Kuis Pencocokan Kata",
    description: "Pasangkan kata Latin dengan aksara Bali.",
    answerType: "matching"
  },
  {
    id: "maca",
    title: "Kuis Membaca Aksara Bali",
    description: "Baca aksara Bali, ketik jawabannya.",
    answerType: "input"
  },
  {
    id: "kahoot",
    title: "Mode Kahoot",
    description: "Soal acak dari seluruh bank kuis.",
    answerType: "choice"
  }
];

const allLetters = [...anacaraka, ...swara, ...angka];
const writingPool = [...anacaraka.slice(0, 12), ...swara, ...gabunganVokal.slice(0, 12)];
const categoryDefinitions = [
  {
    id: "semua",
    name: "Semua Aksara",
    description: "Campuran anacaraka, swara, angka, gabungan vokal, dan kata.",
    groups: ["Anacaraka", "Swara", "Angka", "Gabungan", "Kata"]
  },
  {
    id: "anacaraka",
    name: "Anacaraka",
    description: "Aksara dasar hanacaraka untuk latihan awal.",
    groups: ["Anacaraka"]
  },
  {
    id: "swara",
    name: "Swara AIUEO",
    description: "Aksara suara a, i, u, e, o.",
    groups: ["Swara"]
  },
  {
    id: "angka",
    name: "Angka Bali",
    description: "Simbol angka Bali 0 sampai 9.",
    groups: ["Angka"]
  },
  {
    id: "gabungan-vokal",
    name: "Gabungan Huruf + Vokal",
    description: "Suku kata gabungan anacaraka dengan sandangan vokal.",
    groups: ["Gabungan"]
  },
  {
    id: "kata",
    name: "Kata Aksara",
    description: "Kata pendek untuk latihan baca cepat.",
    groups: ["Kata"]
  },
  {
    id: "dasar-campur",
    name: "Dasar Campur",
    description: "Dummy paket kelas: anacaraka, swara, dan angka.",
    groups: ["Anacaraka", "Swara", "Angka"]
  }
];

function countItemsForGroups(groups) {
  if (!groups?.length) return quizBank.length;
  return quizBank.filter((item) => groups.includes(item.group)).length;
}

export function getQuestionCategories() {
  return categoryDefinitions.map((category) => ({
    ...category,
    count: category.id === "semua" ? quizBank.length : countItemsForGroups(category.groups)
  }));
}

function getCategory(categoryId) {
  return categoryDefinitions.find((category) => category.id === categoryId) || categoryDefinitions[0];
}

function normalizeCategoryIds(category) {
  const raw = Array.isArray(category) ? category : String(category || "semua").split(",");
  const ids = raw.map((item) => String(item).trim()).filter(Boolean);
  return ids.length ? ids : ["semua"];
}

function selectedGroupsForCategory(category) {
  const categoryIds = normalizeCategoryIds(category);
  if (categoryIds.includes("semua")) return [];
  return [
    ...new Set(
      categoryIds
        .map(getCategory)
        .filter((item) => item.id !== "semua")
        .flatMap((item) => item.groups || [])
    )
  ];
}

function filterItemsByCategory(items, category) {
  const groups = selectedGroupsForCategory(category);
  if (!groups.length) return items;
  const filtered = items.filter((item) => groups.includes(item.group));
  return filtered;
}

function seededShuffle(items, seed = "aksabali") {
  const arr = [...items];
  let hash = 0;
  for (const char of String(seed)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const j = hash % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function optionsFor(pool, answer, key, seed) {
  const choices = seededShuffle(
    pool.filter((item) => item[key] !== answer).map((item) => item[key]),
    seed
  );
  return seededShuffle([answer, ...choices.slice(0, 3)], `${seed}-${answer}`);
}

function choiceQuestion(item, pool, direction, seed, modeId) {
  const latinToGlyph = direction === "latin-glyph";
  const answer = latinToGlyph ? item.glyph : item.latin;
  return {
    id: `${modeId}-${item.id}-${direction}`,
    modeId,
    type: "choice",
    prompt: latinToGlyph ? "Pilih aksara yang cocok" : "Pilih bacaan yang benar",
    display: latinToGlyph ? item.latin : item.glyph,
    displayType: latinToGlyph ? "latin" : "glyph",
    answer,
    options: optionsFor(pool, answer, latinToGlyph ? "glyph" : "latin", seed),
    material: {
      id: item.id,
      latin: item.latin,
      glyph: item.glyph,
      group: item.group
    }
  };
}

function inputQuestion(item, index) {
  return {
    id: `maca-${item.id}-${index}`,
    modeId: "maca",
    type: "input",
    prompt: "Baca aksara ini",
    display: item.glyph,
    displayType: "glyph",
    answer: item.latin,
    material: item
  };
}

function matchQuestions() {
  const pairs = [...kataAksara.slice(0, 6), ...gabunganVokal.slice(0, 2)];
  return [
    {
      id: "match-kata-1",
      modeId: "match",
      type: "matching",
      prompt: "Pasangkan kata Latin dengan aksaranya",
      pairs: pairs.map((item) => ({
        id: item.id,
        latin: item.latin,
        glyph: item.glyph,
        group: item.group
      }))
    }
  ];
}

export function getQuizMaterials() {
  return {
    anacaraka,
    swara,
    angka,
    gabunganVokal,
    kataAksara,
    questionCategories: getQuestionCategories(),
    totals: {
      anacaraka: anacaraka.length,
      swara: swara.length,
      angka: angka.length,
      gabunganVokal: gabunganVokal.length,
      kataAksara: kataAksara.length,
      all: quizBank.length,
      categories: getQuestionCategories().length
    }
  };
}

function filterQuestionsByCategory(questions, categoryId) {
  const categoryIds = normalizeCategoryIds(categoryId);
  if (categoryIds.includes("semua")) return questions;
  const selectedCategories = categoryIds.map(getCategory).filter((category) => category.id !== "semua");
  const selectedGroups = [...new Set(selectedCategories.flatMap((category) => category.groups || []))];
  if (!selectedGroups.length) return questions;

  const filtered = questions.filter((question) => {
    if (question.type === "matching") {
      return question.pairs?.some((pair) => selectedGroups.includes(pair.group));
    }
    return selectedGroups.includes(question.material?.group);
  });

  return filtered.length ? filtered : questions;
}

export function buildQuizQuestions({ mode = "nyurat", limit = 12, seed = randomUUID(), category = "semua", includeAnswers = false } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit || 12), 50));
  const writingItems = filterItemsByCategory(writingPool, category);
  const kataItems = filterItemsByCategory(kataAksara, category);
  const letterItems = filterItemsByCategory(allLetters, category);
  let questions;

  if (mode === "nyurat") {
    questions = writingItems.map((item, index) => choiceQuestion(item, writingItems, "latin-glyph", `${seed}-${index}`, mode));
  } else if (mode === "kata") {
    questions = kataItems.map((item, index) =>
      choiceQuestion(item, kataItems, index % 2 ? "latin-glyph" : "glyph-latin", `${seed}-${index}`, mode)
    );
  } else if (mode === "huruf") {
    questions = letterItems.map((item, index) =>
      choiceQuestion(item, letterItems, index % 2 ? "latin-glyph" : "glyph-latin", `${seed}-${index}`, mode)
    );
  } else if (mode === "maca") {
    questions = kataItems.map(inputQuestion);
  } else if (mode === "match") {
    questions = matchQuestions();
  } else if (mode === "kahoot") {
    questions = [
      ...writingItems.map((item, index) => choiceQuestion(item, writingItems, "latin-glyph", `${seed}-w-${index}`, mode)),
      ...kataItems.map((item, index) => choiceQuestion(item, kataItems, "glyph-latin", `${seed}-k-${index}`, mode)),
      ...letterItems.map((item, index) =>
        choiceQuestion(item, letterItems, index % 2 ? "latin-glyph" : "glyph-latin", `${seed}-h-${index}`, mode)
      )
    ];
  } else {
    const error = new Error("Mode kuis tidak valid.");
    error.status = 400;
    throw error;
  }

  if (!questions.length) {
    const error = new Error("Kategori soal tidak cocok dengan mode kuis.");
    error.status = 400;
    throw error;
  }

  const categorized = filterQuestionsByCategory(questions, category);
  const selected = mode === "match" ? categorized : seededShuffle(categorized, seed).slice(0, safeLimit);
  if (includeAnswers) return selected;
  return selected.map(({ answer, ...question }) => question);
}

export function gradeQuizAttempt({ mode, answers = [], questions = [] }) {
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const details = answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      return { questionId: answer.questionId, correct: false, expected: null, answer: answer.answer ?? null };
    }
    if (question.type === "matching") {
      const expected = new Map(question.pairs.map((pair) => [pair.id, pair.id]));
      const submitted = answer.matches || {};
      const correctPairs = question.pairs.filter((pair) => submitted[pair.id] === expected.get(pair.id)).length;
      return {
        questionId: question.id,
        correct: correctPairs === question.pairs.length,
        correctPairs,
        totalPairs: question.pairs.length,
        answer: submitted
      };
    }
    const expected = String(question.answer || "").trim().toLowerCase().replace(/\s+/g, "");
    const submitted = String(answer.answer || "").trim().toLowerCase().replace(/\s+/g, "");
    return {
      questionId: question.id,
      correct: expected === submitted,
      expected: question.answer,
      answer: answer.answer ?? null
    };
  });

  const correctCount = details.filter((item) => item.correct).length;
  const total = Math.max(details.length, 1);
  return {
    mode,
    correct: correctCount,
    total: details.length,
    score: Math.round((correctCount / total) * 100),
    passed: correctCount / total >= 0.75,
    details
  };
}
