"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Eye, GripVertical, Lightbulb, RotateCcw, Sparkles, X } from "lucide-react";
import { useStrokeRecognizer } from "../hooks/useStrokeRecognizer";
import { anacaraka, angka, gabunganVokal, kataAksara, quizBank, swara } from "../lib/quiz-data";

export const quizModes = [
  {
    id: "nyurat",
    title: "Kuis Nyurat",
    description: "Tulis aksara di kanvas, lalu recognition menilai stroke.",
    badge: "Stroke"
  },
  {
    id: "kata",
    title: "Tebak Kata Bolak Balik",
    description: "Aksara ke Latin, lalu Latin ke aksara.",
    badge: "Kata"
  },
  {
    id: "huruf",
    title: "Tebak Huruf Bolak Balik",
    description: "Latih anacaraka, swara, dan angka dua arah.",
    badge: "Huruf"
  },
  {
    id: "match",
    title: "Pencocokan Kata",
    description: "Drag kata Latin ke kartu aksara yang cocok.",
    badge: "Drag & drop"
  },
  {
    id: "maca",
    title: "Kuis Membaca Aksara Bali",
    description: "Baca aksara Bali, ketik jawabannya.",
    badge: "Maca"
  },
  {
    id: "acak",
    title: "Mode Acak",
    description: "Soal acak dari semua bank kuis.",
    badge: "Acak"
  }
];

const allLetters = [...anacaraka, ...swara, ...angka];
const writingPool = [...anacaraka.slice(0, 12), ...swara, ...gabunganVokal.slice(0, 12)];
const strokeMetricLabels = [
  ["shapeScore", "Bentuk"],
  ["directionScore", "Arah"],
  ["positionScore", "Posisi"],
  ["lengthScore", "Panjang"],
  ["smoothnessScore", "Halus"]
];

function strokeClass(status) {
  if (status === "wrong") return "wrong-stroke-fade";
  if (status === "hint") return "hint-stroke animate-draw";
  if (status === "correctAfterMiss") return "correct-stroke opacity-75";
  return "correct-stroke";
}

function normalize(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, "");
}

function rotateOptions(pool, answer, answerKey, optionKey, index) {
  const others = pool.filter((item) => item[answerKey] !== answer).slice(index % 4, index % 4 + 8);
  const options = [answer, ...others.map((item) => item[optionKey])].slice(0, 4);
  return options.sort((a, b) => String(a).localeCompare(String(b), "id"));
}

function choiceQuestion(item, pool, direction, index, modeId) {
  const latinToGlyph = direction === "latin-glyph";
  const answer = latinToGlyph ? item.glyph : item.latin;
  return {
    id: `${modeId}-${item.id}-${direction}`,
    modeId,
    kind: "choice",
    prompt: latinToGlyph ? "Pilih aksara yang cocok" : "Pilih bacaan yang benar",
    display: latinToGlyph ? item.latin : item.glyph,
    displayType: latinToGlyph ? "latin" : "glyph",
    answer,
    options: rotateOptions(pool, answer, latinToGlyph ? "glyph" : "latin", latinToGlyph ? "glyph" : "latin", index),
    helper: item.group
  };
}

function inputQuestion(item, index) {
  return {
    id: `maca-${item.id}-${index}`,
    modeId: "maca",
    kind: "input",
    prompt: "Baca aksara ini",
    display: item.glyph,
    answer: item.latin,
    helper: "Ketik Latin tanpa spasi"
  };
}

function buildQuestions(modeId) {
  if (modeId === "nyurat") {
    return writingPool.slice(0, 12).map((item, index) => choiceQuestion(item, writingPool, "latin-glyph", index, modeId));
  }

  if (modeId === "kata") {
    return kataAksara.slice(0, 10).map((item, index) =>
      choiceQuestion(item, kataAksara, index % 2 ? "latin-glyph" : "glyph-latin", index, modeId)
    );
  }

  if (modeId === "huruf") {
    return allLetters.slice(0, 18).map((item, index) =>
      choiceQuestion(item, allLetters, index % 2 ? "latin-glyph" : "glyph-latin", index, modeId)
    );
  }

  if (modeId === "maca") {
    return kataAksara.slice(0, 8).map(inputQuestion);
  }

  return [];
}

function randomize(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildAcakQuestions() {
  // Mode Acak — Quiz Global: tarik dari SEMUA kategori materi, full set (bukan slice).
  // Pool digabung lalu di-shuffle, ambil 15 soal random.
  const base = [
    ...anacaraka.map((item, index) => choiceQuestion(item, anacaraka, index % 2 ? "latin-glyph" : "glyph-latin", index, "acak")),
    ...swara.map((item, index) => choiceQuestion(item, swara, index % 2 ? "latin-glyph" : "glyph-latin", index, "acak")),
    ...angka.map((item, index) => choiceQuestion(item, angka, index % 2 ? "latin-glyph" : "glyph-latin", index, "acak")),
    ...gabunganVokal.map((item, index) => choiceQuestion(item, gabunganVokal, index % 2 ? "latin-glyph" : "glyph-latin", index, "acak")),
    ...kataAksara.map((item, index) => choiceQuestion(item, kataAksara, index % 2 ? "latin-glyph" : "glyph-latin", index, "acak"))
  ];
  return randomize(base).slice(0, 15);
}

function ScoreBadge({ score, total }) {
  return (
    <div className="rounded-full border border-[#2A2520]/10 bg-white/75 px-4 py-2 text-sm font-black text-[#8B1F18]">
      Skor {score}/{total}
    </div>
  );
}

function ChoiceQuiz({ questions, score, setScore, onRestart }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const question = questions[index];
  const total = questions.length;
  const correct = selected === question?.answer;

  function submit() {
    if (!selected || submitted) return;
    if (correct) setScore((value) => value + 1);
    setSubmitted(true);
  }

  function next() {
    if (index + 1 >= total) return;
    setIndex((value) => value + 1);
    setSelected("");
    setSubmitted(false);
  }

  if (!question) return null;

  return (
    <div className="rounded-[28px] border border-[#2A2520]/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(42,37,32,0.08)] backdrop-blur sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9A227]">
            Soal {index + 1} dari {total}
          </p>
          <h2 className="mt-2 text-2xl font-black">{question.prompt}</h2>
        </div>
        <ScoreBadge score={score} total={total} />
      </div>

      <div className="mt-7 grid place-items-center rounded-[24px] bg-[#FBF7EE] p-8 text-center screen-grid">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4A3F37]/60">{question.helper}</p>
        <p className={`${question.displayType === "glyph" ? "bali-text text-[7rem]" : "font-display text-6xl"} mt-3 leading-none text-[#4A0F0A]`}>
          {question.display}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const isSelected = selected === option;
          const isAnswer = option === question.answer;
          const stateClass = submitted
            ? isAnswer
              ? "border-[#4A7C59] bg-[#4A7C59]/10 text-[#2A2520]"
              : isSelected
                ? "border-[#BA1A1A] bg-[#BA1A1A]/10 text-[#2A2520]"
                : "border-[#2A2520]/10 bg-white text-[#4A3F37]"
            : isSelected
              ? "border-[#8B1F18] bg-[#8B1F18]/10 text-[#2A2520]"
              : "border-[#2A2520]/10 bg-white text-[#2A2520] hover:border-[#8B1F18]/40";

          return (
            <button
              key={option}
              type="button"
              onClick={() => !submitted && setSelected(option)}
              className={`flex min-h-16 items-center justify-between rounded-2xl border px-4 py-3 text-left text-lg font-black transition ${stateClass}`}
            >
              <span className={/[\u1B00-\u1B7F]/.test(option) ? "bali-text text-4xl" : ""}>{option}</span>
              {submitted && isAnswer && <Check className="h-5 w-5 text-[#4A7C59]" />}
              {submitted && isSelected && !isAnswer && <X className="h-5 w-5 text-[#BA1A1A]" />}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full border border-[#2A2520]/12 bg-white px-5 py-3 text-sm font-black text-[#4A3F37]"
        >
          <RotateCcw className="h-4 w-4" />
          Ulangi
        </button>
        {submitted ? (
          index + 1 >= total ? (
            <div className="rounded-full bg-[#8B1F18] px-5 py-3 text-sm font-black text-white">
              Selesai, skor {score}/{total}
            </div>
          ) : (
            <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-[#8B1F18] px-5 py-3 text-sm font-black text-white">
              Soal berikutnya
              <ArrowRight className="h-4 w-4" />
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!selected}
            className="rounded-full bg-[#8B1F18] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            Cek jawaban
          </button>
        )}
      </div>
    </div>
  );
}

function InputQuiz({ questions, score, setScore, onRestart }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const question = questions[index];
  const total = questions.length;
  const correct = normalize(answer) === normalize(question?.answer);

  function submit() {
    if (!answer || submitted) return;
    if (correct) setScore((value) => value + 1);
    setSubmitted(true);
  }

  function next() {
    setIndex((value) => value + 1);
    setAnswer("");
    setSubmitted(false);
  }

  return (
    <div className="rounded-[28px] border border-[#2A2520]/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(42,37,32,0.08)] backdrop-blur sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9A227]">
            Soal {index + 1} dari {total}
          </p>
          <h2 className="mt-2 text-2xl font-black">{question.prompt}</h2>
        </div>
        <ScoreBadge score={score} total={total} />
      </div>

      <div className="mt-7 grid place-items-center rounded-[24px] bg-[#FBF7EE] p-8 text-center screen-grid">
        <p className="bali-text text-[8rem] leading-none text-[#4A0F0A]">{question.display}</p>
      </div>

      <label className="mt-6 grid gap-2">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#4A3F37]/65">Jawaban Latin</span>
        <input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={submitted}
          placeholder="contoh: bali"
          className="h-14 rounded-2xl border border-[#2A2520]/12 bg-white px-4 text-lg font-black outline-none focus:border-[#8B1F18]"
        />
      </label>

      {submitted && (
        <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ${correct ? "bg-[#4A7C59]/10 text-[#2A2520]" : "bg-[#BA1A1A]/10 text-[#2A2520]"}`}>
          {correct ? "Benar." : `Jawaban benar: ${question.answer}`}
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 rounded-full border border-[#2A2520]/12 bg-white px-5 py-3 text-sm font-black text-[#4A3F37]">
          <RotateCcw className="h-4 w-4" />
          Ulangi
        </button>
        {submitted ? (
          index + 1 >= total ? (
            <div className="rounded-full bg-[#8B1F18] px-5 py-3 text-sm font-black text-white">
              Selesai, skor {score}/{total}
            </div>
          ) : (
            <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-[#8B1F18] px-5 py-3 text-sm font-black text-white">
              Soal berikutnya
              <ArrowRight className="h-4 w-4" />
            </button>
          )
        ) : (
          <button type="button" onClick={submit} disabled={!answer} className="rounded-full bg-[#8B1F18] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45">
            Cek jawaban
          </button>
        )}
      </div>
    </div>
  );
}

function StrokeWritingQuiz({ strokeQuiz, setScore, onRestart, canSave }) {
  const [saveStatus, setSaveStatus] = useState("");
  const [finalScore, setFinalScore] = useState(null);
  const referencePaths = strokeQuiz?.referencePaths || [];
  const {
    currentStrokeIdx,
    userStrokes,
    feedback,
    feedbackMessage,
    mistakes,
    lastMetric,
    averageScore,
    svgRef,
    activeStrokeRef,
    handlers,
    reset,
    triggerHint,
    triggerShow,
    isDemoing
  } = useStrokeRecognizer({
    referencePaths,
    strokeTemplates: [],
    minScore: 70,
    onComplete: async (result) => {
      if (result.isDemo) return;
      setFinalScore(result.score);
      setScore(result.score);
      if (!canSave || !strokeQuiz?.aksaraId) {
        setSaveStatus("Skor selesai dihitung. Masuk akun untuk menyimpan progres.");
        return;
      }

      setSaveStatus("Menyimpan skor kuis nyurat...");
      try {
        const response = await fetch("/api/strokes/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aksaraId: strokeQuiz.aksaraId,
            mode: "nyurat",
            score: result.score,
            passed: result.passed,
            mistakes: result.mistakes,
            durationSeconds: result.durationSeconds,
            metrics: result.metrics,
            rawStrokes: result.rawStrokes,
            normalizedStrokes: result.normalizedStrokes
          })
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Skor belum tersimpan.");
        }
        setSaveStatus("Skor kuis nyurat tersimpan.");
      } catch (error) {
        setSaveStatus(error instanceof Error ? error.message : "Skor belum tersimpan.");
      }
    }
  });

  const isFinished = currentStrokeIdx >= referencePaths.length;
  const activeStroke = Math.min(currentStrokeIdx + 1, referencePaths.length);
  const shownScore = finalScore ?? averageScore ?? 0;

  useEffect(() => {
    if (feedback !== "threeWrong") return;
    const timeout = setTimeout(() => triggerHint(), 500);
    return () => clearTimeout(timeout);
  }, [feedback, triggerHint]);

  function restartAll() {
    setFinalScore(null);
    setSaveStatus("");
    reset();
    onRestart();
  }

  if (!referencePaths.length) {
    return (
      <div className="rounded-[28px] border border-[#2A2520]/10 bg-white/82 p-7 shadow-[0_18px_50px_rgba(42,37,32,0.08)] backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8B1F18]">Kuis Nyurat</p>
        <h2 className="mt-2 text-2xl font-black">Pola stroke belum tersedia.</h2>
        <p className="mt-3 leading-7 text-[#4A3F37]">
          Tambahkan SVG stroke lewat admin supaya mode nyurat bisa menilai goresan secara langsung.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-[#2A2520]/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(42,37,32,0.08)] backdrop-blur sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9A227]">
            Kuis Nyurat
          </p>
          <h2 className="mt-2 text-2xl font-black">Tulis {strokeQuiz?.latin || strokeQuiz?.name || "aksara"} di kanvas.</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#4A3F37]/70">
            Recognition menilai bentuk, arah, posisi, panjang, dan kehalusan stroke.
          </p>
        </div>
        <div className="rounded-full border border-[#2A2520]/10 bg-white/75 px-4 py-2 text-sm font-black text-[#8B1F18]">
          Skor {shownScore}/100
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="relative overflow-hidden rounded-[1.2rem] border border-[#2A2520]/10 bg-white">
          <svg
            ref={svgRef}
            viewBox="0 0 109 109"
            className="block aspect-square w-full touch-none select-none bg-[#fffaf0]"
            style={{ touchAction: "none" }}
            aria-label={`Kanvas kuis nyurat ${strokeQuiz?.latin || strokeQuiz?.name || "aksara"}`}
            {...handlers}
          >
            <rect width="109" height="109" fill="#fffaf0" />
            <g className="screen-grid-svg opacity-100">
              <line x1="36.33" y1="0" x2="36.33" y2="109" />
              <line x1="72.66" y1="0" x2="72.66" y2="109" />
              <line x1="0" y1="36.33" x2="109" y2="36.33" />
              <line x1="0" y1="72.66" x2="109" y2="72.66" />
            </g>
            <text x="54.5" y="72" textAnchor="middle" className="bali-text fill-ink/[0.055] text-[4rem]">
              {strokeQuiz?.glyph || ""}
            </text>
            <g pointerEvents="none">
              {referencePaths.map((d, index) => {
                const shouldShow = isDemoing || isFinished || index === currentStrokeIdx;
                return shouldShow ? (
                  <path
                    key={`quiz-ref-${d}`}
                    d={d}
                    stroke={index === currentStrokeIdx ? "#d89a2b" : "#241917"}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={index === currentStrokeIdx ? "0.45" : "0.12"}
                  />
                ) : null;
              })}
            </g>
            <g pointerEvents="none">
              {userStrokes.map((stroke, index) => (
                <path
                  key={`${stroke.d}-${index}`}
                  d={stroke.d}
                  className={strokeClass(stroke.status)}
                  pathLength="1"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
            </g>
            <path
              ref={activeStrokeRef}
              d=""
              stroke="#15616d"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              pointerEvents="none"
            />
          </svg>

          {feedbackMessage && (
            <div className="absolute left-3 right-3 top-3 rounded-2xl border border-[#2A2520]/10 bg-[#FBF7EE]/92 px-4 py-3 text-sm font-bold text-[#2A2520] shadow-[0_12px_34px_rgba(42,37,32,0.08)] backdrop-blur">
              {feedbackMessage}
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl bg-[#FBF7EE] p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#4A3F37]/55">Target</p>
            <p className="bali-text mt-2 text-6xl leading-none text-[#8B1F18]">{strokeQuiz?.glyph}</p>
            <p className="mt-2 text-lg font-black">{strokeQuiz?.latin || strokeQuiz?.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-[#8B1F18]/10 px-3 py-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8B1F18]">Stroke</p>
              <p className="mt-1 text-xl font-black">{activeStroke}/{referencePaths.length}</p>
            </div>
            <div className="rounded-2xl bg-[#8B1F18]/10 px-3 py-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8B1F18]">Salah</p>
              <p className="mt-1 text-xl font-black">{mistakes}</p>
            </div>
          </div>

          <div className="grid gap-2">
            {strokeMetricLabels.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl bg-[#FBF7EE] px-3 py-2">
                <span className="text-xs font-black uppercase tracking-[0.1em] text-[#4A3F37]/55">{label}</span>
                <span className="font-black">{lastMetric?.[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#4A3F37]/50">
          Stroke recognition aktif di kuis
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={restartAll} className="inline-flex items-center gap-2 rounded-full border border-[#2A2520]/12 bg-white px-4 py-2 text-sm font-black text-[#4A3F37]">
            <RotateCcw className="h-4 w-4" />
            Ulangi
          </button>
          <button type="button" onClick={triggerHint} disabled={isFinished || isDemoing} className="inline-flex items-center gap-2 rounded-full border border-[#2A2520]/12 bg-white px-4 py-2 text-sm font-black text-[#4A3F37] disabled:opacity-45">
            <Lightbulb className="h-4 w-4" />
            Petunjuk
          </button>
          <button type="button" onClick={triggerShow} disabled={isFinished || isDemoing} className="inline-flex items-center gap-2 rounded-full bg-[#8B1F18] px-4 py-2 text-sm font-black text-white disabled:opacity-45">
            <Eye className="h-4 w-4" />
            Urutan
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="mt-4 rounded-2xl border border-[#2A2520]/10 bg-[#FBF7EE] px-4 py-3 text-sm font-bold text-[#4A3F37]">
          {saveStatus}
        </div>
      )}
    </div>
  );
}

function MatchingQuiz({ onRestart }) {
  const pairs = useMemo(() => [...kataAksara.slice(0, 6), ...gabunganVokal.slice(0, 2)], []);
  const labels = useMemo(() => pairs.map((item) => ({ id: item.id, latin: item.latin })), [pairs]);
  const [matches, setMatches] = useState({});
  const [activeLabel, setActiveLabel] = useState("");
  const score = pairs.filter((pair) => matches[pair.id] === pair.id).length;

  function reset() {
    setMatches({});
    setActiveLabel("");
    onRestart();
  }

  function setMatch(targetId, labelId) {
    setMatches((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => {
        if (next[key] === labelId) delete next[key];
      });
      next[targetId] = labelId;
      return next;
    });
    setActiveLabel("");
  }

  return (
    <div className="rounded-[28px] border border-[#2A2520]/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(42,37,32,0.08)] backdrop-blur sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9A227]">Drag & drop</p>
          <h2 className="mt-2 text-2xl font-black">Pasangkan kata dengan aksaranya.</h2>
        </div>
        <ScoreBadge score={score} total={pairs.length} />
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[24px] bg-[#FBF7EE] p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#4A3F37]/60">Kata Latin</p>
          <div className="grid gap-2">
            {labels.map((label) => {
              const used = Object.values(matches).includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", label.id)}
                  onClick={() => setActiveLabel(label.id)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left font-black transition ${
                    activeLabel === label.id ? "border-[#8B1F18] bg-white text-[#8B1F18]" : used ? "border-[#2A2520]/8 bg-white/55 text-[#4A3F37]/50" : "border-[#2A2520]/10 bg-white text-[#2A2520]"
                  }`}
                >
                  {label.latin}
                  <GripVertical className="h-4 w-4 text-[#4A3F37]/50" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {pairs.map((pair) => {
            const matchedLabel = labels.find((label) => label.id === matches[pair.id]);
            const isCorrect = matches[pair.id] === pair.id;
            return (
              <button
                key={pair.id}
                type="button"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => setMatch(pair.id, event.dataTransfer.getData("text/plain"))}
                onClick={() => activeLabel && setMatch(pair.id, activeLabel)}
                className={`min-h-36 rounded-[22px] border p-4 text-left transition ${
                  matchedLabel ? (isCorrect ? "border-[#4A7C59] bg-[#4A7C59]/10" : "border-[#BA1A1A] bg-[#BA1A1A]/10") : "border-[#2A2520]/10 bg-white hover:border-[#8B1F18]/40"
                }`}
              >
                <span className="bali-text block text-6xl leading-none text-[#4A0F0A]">{pair.glyph}</span>
                <span className="mt-4 block text-sm font-black text-[#4A3F37]">
                  {matchedLabel ? matchedLabel.latin : "Taruh kata di sini"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button type="button" onClick={reset} className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#2A2520]/12 bg-white px-5 py-3 text-sm font-black text-[#4A3F37]">
        <RotateCcw className="h-4 w-4" />
        Ulangi pencocokan
      </button>
    </div>
  );
}

export function QuizStudio({ initialMode = "nyurat", strokeQuiz = null, canSaveStroke = false, showOverview = true }) {
  const safeInitialMode = quizModes.some((mode) => mode.id === initialMode) ? initialMode : "nyurat";
  const activeMode = safeInitialMode;
  const activeModeMeta = quizModes.find((mode) => mode.id === activeMode) || quizModes[0];
  const [score, setScore] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const [acakQuestions, setAcakQuestions] = useState([]);
  const questions = useMemo(() => {
    if (activeMode === "acak") return acakQuestions;
    return buildQuestions(activeMode);
  }, [activeMode, acakQuestions]);

  function restart() {
    setScore(0);
    setRestartKey((value) => value + 1);
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] overflow-hidden px-4 py-8 sm:px-6 lg:py-10">
      {showOverview ? (
        <section className="grid min-w-0 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8B1F18]">Kuis Aksa Bali</p>
            <h1 className="mt-3 max-w-[342px] break-words font-display text-[clamp(40px,11vw,76px)] font-semibold leading-[0.95] tracking-[-0.025em] sm:max-w-none">
              Latihan aksara, <em className="italic text-[#8B1F18]">lebih cepat paham.</em>
            </h1>
            <p className="mt-5 max-w-[342px] text-base leading-7 text-[#4A3F37] sm:max-w-xl sm:text-lg sm:leading-8">
              Pilih mode kuis untuk anacaraka, pangangge suara, angka Bali, gabungan huruf-vokal, dan latihan baca kata.
            </p>
          </div>
          <div className="grid w-full max-w-[342px] grid-cols-2 gap-3 rounded-[28px] border border-[#2A2520]/10 bg-white/75 p-4 shadow-[0_18px_50px_rgba(42,37,32,0.07)] backdrop-blur sm:max-w-none sm:grid-cols-3">
            {[
              ["Anacaraka", anacaraka.length],
              ["Pangangge", swara.length],
              ["Angka", angka.length],
              ["Gabungan", gabunganVokal.length],
              ["Kata", kataAksara.length],
              ["Bank soal", quizBank.length]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#FBF7EE] p-4">
                <p className="text-2xl font-black text-[#8B1F18]">{value}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#4A3F37]/60">{label}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-[28px] border border-[#2A2520]/10 bg-white/76 p-5 shadow-[0_18px_50px_rgba(42,37,32,0.07)] backdrop-blur sm:p-7">
          <Link href="/quiz" className="text-sm font-black text-[#8B1F18] hover:text-[#2A2520]">
            Semua kuis
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9A227]">{activeModeMeta.badge}</p>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-[#2A2520] sm:text-5xl">
                {activeModeMeta.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#4A3F37]">{activeModeMeta.description}</p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {quizModes.map((mode) => (
                <Link
                  key={mode.id}
                  href={`/quiz/${mode.id}`}
                  className={`rounded-full px-4 py-2 text-sm font-black ${
                    activeMode === mode.id ? "bg-[#8B1F18] text-white" : "border border-[#2A2520]/10 bg-[#FBF7EE] text-[#4A3F37]"
                  }`}
                >
                  {mode.title}
                </Link>
              ))}
            </nav>
          </div>
        </section>
      )}

      <section className="mt-8 max-w-[342px] sm:max-w-none" key={`${activeMode}-${restartKey}`}>
        {activeMode === "nyurat" ? (
          <StrokeWritingQuiz strokeQuiz={strokeQuiz} setScore={setScore} onRestart={restart} canSave={canSaveStroke} />
        ) : activeMode === "match" ? (
          <MatchingQuiz onRestart={restart} />
        ) : activeMode === "maca" ? (
          <InputQuiz questions={questions} score={score} setScore={setScore} onRestart={restart} />
        ) : activeMode === "acak" && !acakQuestions.length ? (
          <div className="rounded-[28px] border border-[#2A2520]/10 bg-white/82 p-7 text-center shadow-[0_18px_50px_rgba(42,37,32,0.08)] backdrop-blur">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#8B1F18] text-white">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="mt-5 font-display text-4xl font-semibold">Mode Acak.</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-[#4A3F37]">
              Sistem mengambil soal dari semua mode kuis: huruf, kata, angka, swara, dan gabungan vokal.
            </p>
            <button
              type="button"
              onClick={() => {
                setScore(0);
                setAcakQuestions(buildAcakQuestions());
              }}
              className="mt-6 rounded-full bg-[#8B1F18] px-6 py-3 text-sm font-black text-white"
            >
              Mulai mode acak
            </button>
          </div>
        ) : (
          <ChoiceQuiz questions={questions} score={score} setScore={setScore} onRestart={restart} />
        )}
      </section>
    </div>
  );
}
