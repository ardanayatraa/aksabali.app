"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Brush, Check, Code2, Eye, Image as ImageIcon, PenTool, Play, Plus, Save, Trash2, Undo2, X } from "lucide-react";

const VIEWBOX_SIZE = 109;
const DRAW_MARGIN = 6;
const GLYPH_FONT_SIZE = 76;
const MIN_POINT_DISTANCE = 0.35;
const SMOOTHING_WINDOW = 3;
const SIMPLIFY_TOLERANCE = 0.42;
const CURVE_TENSION = 0.72;
const CHAIKIN_PASSES = 2;
const MAX_RENDER_POINTS = 120;

function round(value) {
  return Number(value).toFixed(1);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min = 0, max = VIEWBOX_SIZE) {
  return Math.max(min, Math.min(max, value));
}

function perpendicularDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) return distance(point, start);
  return Math.abs(dy * point.x - dx * point.y + end.x * start.y - end.y * start.x) / Math.hypot(dx, dy);
}

function simplifyPoints(points, tolerance = SIMPLIFY_TOLERANCE) {
  if (points.length <= 3) return points;

  let maxDistance = 0;
  let maxIndex = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let index = 1; index < points.length - 1; index += 1) {
    const pointDistance = perpendicularDistance(points[index], first, last);
    if (pointDistance > maxDistance) {
      maxDistance = pointDistance;
      maxIndex = index;
    }
  }

  if (maxDistance <= tolerance) return [first, last];
  const left = simplifyPoints(points.slice(0, maxIndex + 1), tolerance);
  const right = simplifyPoints(points.slice(maxIndex), tolerance);
  return [...left.slice(0, -1), ...right];
}

function smoothPoints(points, windowSize = SMOOTHING_WINDOW) {
  if (points.length <= 4) return points;
  return points.map((point, index) => {
    if (index === 0 || index === points.length - 1) return point;
    const start = Math.max(0, index - windowSize);
    const end = Math.min(points.length - 1, index + windowSize);
    const slice = points.slice(start, end + 1);
    const total = slice.reduce((sum, current) => ({ x: sum.x + current.x, y: sum.y + current.y }), { x: 0, y: 0 });
    return {
      x: total.x / slice.length,
      y: total.y / slice.length
    };
  });
}

function chaikinSmoothPoints(points, passes = CHAIKIN_PASSES) {
  if (points.length <= 2 || passes <= 0) return points;
  let current = points;

  for (let pass = 0; pass < passes; pass += 1) {
    const next = [current[0]];
    for (let index = 0; index < current.length - 1; index += 1) {
      const start = current[index];
      const end = current[index + 1];
      next.push(
        {
          x: start.x * 0.75 + end.x * 0.25,
          y: start.y * 0.75 + end.y * 0.25
        },
        {
          x: start.x * 0.25 + end.x * 0.75,
          y: start.y * 0.25 + end.y * 0.75
        }
      );
    }
    next.push(current[current.length - 1]);
    current = next;
  }

  return current;
}

function limitPointCount(points, maxPoints = MAX_RENDER_POINTS) {
  if (points.length <= maxPoints) return points;
  const limited = [];
  const lastIndex = points.length - 1;
  for (let index = 0; index < maxPoints; index += 1) {
    const sourceIndex = Math.round((index / (maxPoints - 1)) * lastIndex);
    limited.push(points[sourceIndex]);
  }
  return limited;
}

function preparedPoints(points) {
  const smoothed = smoothPoints(points);
  const simplified = simplifyPoints(smoothed);
  const polished = chaikinSmoothPoints(simplified);
  return limitPointCount(polished).filter((point, index, current) => {
    if (index === 0) return true;
    return distance(point, current[index - 1]) > 0.08;
  });
}

function dedupePoints(points, minDistance = 0.08) {
  return points.filter((point, index, current) => {
    if (index === 0) return true;
    return distance(point, current[index - 1]) > minDistance;
  });
}

function pointsToPath(points, normalize = true) {
  const smoothed = normalize ? preparedPoints(points) : points;
  if (!smoothed.length) return "";
  const [first] = smoothed;
  if (smoothed.length === 1) return `M ${round(first.x)} ${round(first.y)}`;
  if (smoothed.length === 2) {
    return `M ${round(smoothed[0].x)} ${round(smoothed[0].y)} L ${round(smoothed[1].x)} ${round(smoothed[1].y)}`;
  }

  const commands = [`M ${round(first.x)} ${round(first.y)}`];
  for (let index = 0; index < smoothed.length - 1; index += 1) {
    const p0 = smoothed[index - 1] || smoothed[index];
    const p1 = smoothed[index];
    const p2 = smoothed[index + 1];
    const p3 = smoothed[index + 2] || p2;
    const cp1 = {
      x: p1.x + ((p2.x - p0.x) / 6) * CURVE_TENSION,
      y: p1.y + ((p2.y - p0.y) / 6) * CURVE_TENSION
    };
    const cp2 = {
      x: p2.x - ((p3.x - p1.x) / 6) * CURVE_TENSION,
      y: p2.y - ((p3.y - p1.y) / 6) * CURVE_TENSION
    };
    commands.push(`C ${round(cp1.x)} ${round(cp1.y)} ${round(cp2.x)} ${round(cp2.y)} ${round(p2.x)} ${round(p2.y)}`);
  }
  return commands.join(" ");
}

function normalizePathData(pathData) {
  return String(pathData || "").replace(/\s+/g, " ").trim();
}

function strokePath(stroke, normalize = false) {
  if (stroke?.path) return normalizePathData(stroke.path);
  return pointsToPath(stroke?.points || [], normalize);
}

function svgTextToStrokes(svgText) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  if (doc.querySelector("parsererror")) return [];
  return Array.from(doc.querySelectorAll("path[d]"))
    .map((path, index) => ({
      id: `loaded-${index}-${crypto.randomUUID()}`,
      path: normalizePathData(path.getAttribute("d")),
      points: []
    }))
    .filter((stroke) => stroke.path);
}

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const DEFAULT_STROKE_WIDTH = 4.8;

function buildSvg(strokes, aksara, strokeWidth = DEFAULT_STROKE_WIDTH) {
  const width = Number(strokeWidth) || DEFAULT_STROKE_WIDTH;
  const paths = strokes
    .map((stroke, index) => {
      const d = strokePath(stroke, false);
      return `  <path id="stroke-${index + 1}" d="${xmlEscape(d)}" fill="none" stroke="black" stroke-width="${width.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" />`;
    })
    .join("\n");

  const title = xmlEscape(aksara?.latin || aksara?.name || aksara?.id || "aksara");
  return `<svg viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}" shape-rendering="geometricPrecision" xmlns="http://www.w3.org/2000/svg">
  <title>${title} stroke reference</title>
${paths}
</svg>`;
}

function calculateFitTransform(box) {
  const safeMin = DRAW_MARGIN;
  const safeMax = VIEWBOX_SIZE - DRAW_MARGIN;
  const safeSize = safeMax - safeMin;
  const targetCenter = VIEWBOX_SIZE / 2;
  const scale = Math.min(1, safeSize / Math.max(box.width, 1), safeSize / Math.max(box.height, 1));
  const scaledBox = {
    x: targetCenter + (box.x - targetCenter) * scale,
    y: targetCenter + (box.y - targetCenter) * scale,
    width: box.width * scale,
    height: box.height * scale
  };

  function axisShift(start, size) {
    const centerShift = targetCenter - (start + size / 2);
    let nextShift = centerShift;
    const shiftedStart = start + nextShift;
    const shiftedEnd = start + size + nextShift;
    if (shiftedStart < safeMin) nextShift += safeMin - shiftedStart;
    if (shiftedEnd > safeMax) nextShift -= shiftedEnd - safeMax;
    return nextShift;
  }

  return {
    scale,
    x: axisShift(scaledBox.x, scaledBox.width),
    y: axisShift(scaledBox.y, scaledBox.height)
  };
}

function FittedGlyphText({ glyph, fontSize = GLYPH_FONT_SIZE, fill = "#8B1F18", onFitChange }) {
  const textRef = useRef(null);
  const [fit, setFit] = useState({ x: 0, y: 0, scale: 1 });
  const matrixX = Number((VIEWBOX_SIZE / 2) * (1 - fit.scale) + fit.x).toFixed(2);
  const matrixY = Number((VIEWBOX_SIZE / 2) * (1 - fit.scale) + fit.y).toFixed(2);

  useEffect(() => {
    if (!textRef.current) return;
    try {
      const box = textRef.current.getBBox();
      const nextFit = calculateFitTransform(box);
      const roundedFit = {
        x: Number(nextFit.x.toFixed(2)),
        y: Number(nextFit.y.toFixed(2)),
        scale: Number(nextFit.scale.toFixed(3))
      };
      setFit(roundedFit);
      onFitChange?.(roundedFit);
    } catch {
      const fallbackFit = { x: 0, y: 0, scale: 1 };
      setFit(fallbackFit);
      onFitChange?.(fallbackFit);
    }
  }, [glyph, fontSize, onFitChange]);

  return (
    <text
      ref={textRef}
      x="54.5"
      y="54.5"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={fontSize}
      transform={`matrix(${fit.scale} 0 0 ${fit.scale} ${matrixX} ${matrixY})`}
      fill={fill}
      className="bali-text"
    >
      {glyph}
    </text>
  );
}

function GlyphReference({ glyph, className = "" }) {
  return (
    <svg viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} className={className} aria-hidden="true">
      <FittedGlyphText glyph={glyph} />
    </svg>
  );
}

export function SvgStrokeTool({ aksara, disabled = false, saving = false, onSave }) {
  const svgRef = useRef(null);
  const activePointerId = useRef(null);
  const activeDraftPoints = useRef([]);
  const animationTimeout = useRef(null);
  const [referenceOpacity, setReferenceOpacity] = useState(0.22);
  const [strokeWidth, setStrokeWidth] = useState(DEFAULT_STROKE_WIDTH);
  const [toolMode, setToolMode] = useState("free");
  const [strokes, setStrokes] = useState([]);
  const [activePoints, setActivePoints] = useState([]);
  const [penPoints, setPenPoints] = useState([]);
  const [penHoverPoint, setPenHoverPoint] = useState(null);
  const [animationStrokes, setAnimationStrokes] = useState([]);
  const [animationKey, setAnimationKey] = useState(0);
  const [isTestingAnimation, setIsTestingAnimation] = useState(false);
  const [message, setMessage] = useState("");

  const generatedSvg = useMemo(
    () => buildSvg(strokes, aksara, strokeWidth),
    [aksara, strokes, strokeWidth]
  );
  const generatedSvgPreviewUrl = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generatedSvg)}`,
    [generatedSvg]
  );
  const canDraw = Boolean(aksara?.id) && !disabled && !saving && !isTestingAnimation;
  const activeToolLabel = toolMode === "pen" ? "Pen tool" : "Pena bebas";
  const referenceGlyph = aksara?.glyph || aksara?.char || "";

  useEffect(() => {
    if (animationTimeout.current) window.clearTimeout(animationTimeout.current);
    activePointerId.current = null;
    activeDraftPoints.current = [];
    const controller = new AbortController();
    const resetTimer = window.setTimeout(() => {
      setActivePoints([]);
      setPenPoints([]);
      setPenHoverPoint(null);
      setAnimationStrokes([]);
      setIsTestingAnimation(false);
    }, 0);

    if (!aksara?.svg_url) {
      const emptyTimer = window.setTimeout(() => {
        setStrokes([]);
        setMessage("");
      }, 0);
      return () => {
        controller.abort();
        window.clearTimeout(resetTimer);
        window.clearTimeout(emptyTimer);
      };
    }

    async function loadExistingSvg() {
      try {
        const response = await fetch(aksara.svg_url, {
          cache: "no-store",
          signal: controller.signal
        });
        if (!response.ok) throw new Error("SVG tidak ditemukan.");
        const svgText = await response.text();
        const loadedStrokes = svgTextToStrokes(svgText);
        if (!loadedStrokes.length) {
          setStrokes([]);
          setMessage("SVG lama belum punya path stroke yang bisa dimuat.");
          return;
        }
        setStrokes(loadedStrokes);
        setMessage(`${loadedStrokes.length} path SVG lama sudah masuk ke kanvas.`);
      } catch (error) {
        if (controller.signal.aborted) return;
        setStrokes([]);
        setMessage(error instanceof Error ? error.message : "SVG lama belum bisa dimuat ke kanvas.");
      }
    }

    loadExistingSvg();
    return () => {
      controller.abort();
      window.clearTimeout(resetTimer);
    };
  }, [aksara?.id, aksara?.svg_url]);

  function playAnimation(strokeList = strokes) {
    if (!strokeList.length) {
      setMessage("Gambar minimal satu goresan dulu untuk test animasi.");
      return;
    }
    if (animationTimeout.current) window.clearTimeout(animationTimeout.current);
    setAnimationStrokes(strokeList);
    setAnimationKey((value) => value + 1);
    setIsTestingAnimation(true);
    animationTimeout.current = window.setTimeout(() => {
      setIsTestingAnimation(false);
    }, Math.max(1300, strokeList.length * 620 + 720));
  }

  function getSvgPoint(event) {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const transformed = point.matrixTransform(ctm.inverse());
    return {
      x: clamp(transformed.x),
      y: clamp(transformed.y)
    };
  }

  function startStroke(event) {
    if (!canDraw) return;
    event.preventDefault();
    activePointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const startPoint = getSvgPoint(event);
    activeDraftPoints.current = [startPoint];
    setActivePoints(activeDraftPoints.current);
    setMessage("");
  }

  function selectToolMode(nextMode) {
    activePointerId.current = null;
    activeDraftPoints.current = [];
    setActivePoints([]);
    setPenHoverPoint(null);
    if (nextMode === "free") setPenPoints([]);
    setToolMode(nextMode);
    setMessage("");
  }

  function moveStroke(event) {
    if (!canDraw || activePointerId.current !== event.pointerId) return;
    event.preventDefault();
    const nextPoint = getSvgPoint(event);
    const current = activeDraftPoints.current;
    if (!current.length) {
      activeDraftPoints.current = [nextPoint];
      setActivePoints(activeDraftPoints.current);
      return;
    }
    const previous = current[current.length - 1];
    if (previous && distance(previous, nextPoint) < MIN_POINT_DISTANCE) return;
    activeDraftPoints.current = [...current, nextPoint];
    setActivePoints(activeDraftPoints.current);
  }

  function finishStroke(event) {
    if (activePointerId.current !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    activePointerId.current = null;
    const completedPoints = preparedPoints(activeDraftPoints.current);
    activeDraftPoints.current = [];
    setActivePoints([]);
    if (completedPoints.length < 2) return;
    const nextStroke = { id: crypto.randomUUID(), points: completedPoints };
    const nextStrokes = [...strokes, nextStroke];
    setStrokes(nextStrokes);
    window.setTimeout(() => playAnimation(nextStrokes), 80);
  }

  function addPenPoint(event) {
    if (!canDraw) return;
    event.preventDefault();
    const nextPoint = getSvgPoint(event);
    setPenPoints((current) => {
      const previous = current[current.length - 1];
      if (previous && distance(previous, nextPoint) < 0.7) return current;
      return [...current, nextPoint];
    });
    setPenHoverPoint(null);
    setMessage("");
  }

  function movePenPointer(event) {
    if (!canDraw || !penPoints.length) return;
    event.preventDefault();
    setPenHoverPoint(getSvgPoint(event));
  }

  function finishPenPath() {
    const completedPoints = dedupePoints(penPoints);
    if (completedPoints.length < 2) {
      setMessage("Pen tool butuh minimal dua titik untuk jadi satu path.");
      return;
    }
    const nextStroke = { id: crypto.randomUUID(), points: completedPoints };
    const nextStrokes = [...strokes, nextStroke];
    setStrokes(nextStrokes);
    setPenPoints([]);
    setPenHoverPoint(null);
    window.setTimeout(() => playAnimation(nextStrokes), 80);
  }

  function cancelPenPath() {
    setPenPoints([]);
    setPenHoverPoint(null);
    setMessage("");
  }

  function undoPenPoint() {
    setPenPoints((current) => current.slice(0, -1));
    setPenHoverPoint(null);
  }

  function handlePointerDown(event) {
    if (toolMode === "pen") {
      addPenPoint(event);
      return;
    }
    startStroke(event);
  }

  function handlePointerMove(event) {
    if (toolMode === "pen") {
      movePenPointer(event);
      return;
    }
    moveStroke(event);
  }

  function handlePointerUp(event) {
    if (toolMode === "pen") return;
    finishStroke(event);
  }

  function handlePointerEnd(event) {
    if (toolMode === "pen") {
      setPenHoverPoint(null);
      return;
    }
    finishStroke(event);
  }

  async function saveSvg() {
    if (!aksara?.id) {
      setMessage("Pilih aksara dulu sebelum membuat SVG.");
      return;
    }
    if (!strokes.length) {
      setMessage("Gambar minimal satu goresan dulu.");
      return;
    }
    setMessage("Menyimpan SVG stroke...");
    try {
      await onSave?.(generatedSvg, strokes.length);
      setMessage(`SVG tersimpan. ${strokes.length} goresan siap dipakai latihan.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "SVG belum bisa disimpan.");
    }
  }

  function undoStroke() {
    if (toolMode === "pen" && penPoints.length) {
      undoPenPoint();
      return;
    }
    if (animationTimeout.current) window.clearTimeout(animationTimeout.current);
    setIsTestingAnimation(false);
    setAnimationStrokes([]);
    setStrokes((current) => current.slice(0, -1));
  }

  function clearStrokes() {
    if (animationTimeout.current) window.clearTimeout(animationTimeout.current);
    setStrokes([]);
    setActivePoints([]);
    setPenPoints([]);
    setPenHoverPoint(null);
    activeDraftPoints.current = [];
    setAnimationStrokes([]);
    setIsTestingAnimation(false);
    setMessage("");
  }

  return (
    <section className="mt-5 rounded-2xl border border-[#2A2520]/10 bg-[#FBF7EE] p-4">
      <div className="sticky top-2 z-10 -mx-4 -mt-4 mb-4 rounded-t-2xl border-b border-[#2A2520]/10 bg-[#FBF7EE]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[0.66rem] font-black uppercase tracking-[0.16em] text-[#8B1F18]">SVG stroke tool</p>
            <h3 className="mt-0.5 truncate text-base font-black text-[#2A2520]">
              {aksara?.latin || aksara?.name || "Gambar pola dari referensi"}
              <span className="ml-2 text-sm font-bold text-[#4A3F37]/55">
                · {strokes.length} goresan
              </span>
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={undoStroke}
              disabled={(!strokes.length && !penPoints.length) || saving}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#2A2520]/12 bg-white px-3 text-xs font-black text-[#4A3F37] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </button>
            <button
              type="button"
              onClick={clearStrokes}
              disabled={(!strokes.length && !penPoints.length) || saving}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#2A2520]/12 bg-white px-3 text-xs font-black text-[#4A3F37] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Bersihkan
            </button>
            <button
              type="button"
              onClick={() => playAnimation(strokes)}
              disabled={!strokes.length || saving || isTestingAnimation}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#8B1F18]/25 bg-white px-3 text-xs font-black text-[#8B1F18] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Play className="h-3.5 w-3.5" />
              {isTestingAnimation ? "Memutar…" : "Tes"}
            </button>
            <button
              type="button"
              onClick={saveSvg}
              disabled={!aksara?.id || !strokes.length || saving}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#8B1F18] px-4 text-xs font-black text-white shadow-[0_8px_18px_rgba(139,31,24,0.18)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Menyimpan…" : "Simpan SVG"}
            </button>
          </div>
        </div>
        {message && (
          <div className="mt-2 rounded-lg border border-[#2A2520]/10 bg-white px-3 py-1.5 text-xs font-bold text-[#4A3F37]">
            <span className="inline-flex items-center gap-2">
              {message.includes("tersimpan") ? <Check className="h-3.5 w-3.5 text-[#4A7C59]" /> : null}
              {message}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 rounded-2xl border border-[#2A2520]/10 bg-white p-3 shadow-[0_12px_34px_rgba(42,37,32,0.04)]">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            className="block aspect-square w-full touch-none select-none rounded-xl bg-[#fffaf0]"
            style={{ touchAction: "none" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerEnd}
            onPointerLeave={handlePointerEnd}
            aria-label={`Tool gambar SVG ${aksara?.latin || aksara?.name || "aksara"}`}
          >
            <rect width={VIEWBOX_SIZE} height={VIEWBOX_SIZE} fill="#fffaf0" />
            <g opacity="0.16">
              {Array.from({ length: 10 }, (_, index) => index * 12.111).map((value) => (
                <g key={value}>
                  <line x1={value} y1="0" x2={value} y2={VIEWBOX_SIZE} stroke="#8B1F18" strokeWidth="0.35" />
                  <line x1="0" y1={value} x2={VIEWBOX_SIZE} y2={value} stroke="#8B1F18" strokeWidth="0.35" />
                </g>
              ))}
            </g>
            <g pointerEvents="none" opacity={referenceOpacity}>
              <FittedGlyphText glyph={referenceGlyph} />
            </g>
            <g pointerEvents="none">
              {strokes.map((stroke) => (
                <path
                  key={stroke.id}
                  d={strokePath(stroke, false)}
                  fill="none"
                  stroke="#2A2520"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isTestingAnimation ? 0.18 : 0.88}
                />
              ))}
              {activePoints.length > 1 && (
                <path
                  d={pointsToPath(activePoints)}
                  fill="none"
                  stroke="#8B1F18"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {toolMode === "pen" && penPoints.length > 0 && (
                <path
                  d={pointsToPath(penHoverPoint ? [...penPoints, penHoverPoint] : penPoints, false)}
                  fill="none"
                  stroke="#8B1F18"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2.4 1.5"
                  opacity="0.86"
                />
              )}
              {toolMode === "pen" && penPoints.map((point, index) => (
                <g key={`${point.x}-${point.y}-${index}`}>
                  <circle cx={point.x} cy={point.y} r="1.9" fill="#fffaf0" stroke="#8B1F18" strokeWidth="0.9" />
                  <circle cx={point.x} cy={point.y} r="0.65" fill="#8B1F18" />
                </g>
              ))}
              {toolMode === "pen" && penHoverPoint && penPoints.length > 0 && (
                <circle cx={penHoverPoint.x} cy={penHoverPoint.y} r="1.3" fill="#8B1F18" opacity="0.38" />
              )}
              {isTestingAnimation && animationStrokes.map((stroke, index) => (
                <path
                  key={`animation-${animationKey}-${stroke.id}`}
                  d={strokePath(stroke, false)}
                  pathLength="1"
                  className="svg-tool-test-stroke"
                  fill="none"
                  stroke="#8B1F18"
                  strokeWidth={strokeWidth * 1.125}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animationDelay: `${index * 0.46}s` }}
                />
              ))}
            </g>
          </svg>
          {!aksara?.id && (
            <div className="mt-3 rounded-xl border border-[#8B1F18]/15 bg-[#8B1F18]/10 px-4 py-3 text-sm font-bold text-[#8B1F18]">
              Pilih kartu aksara dari daftar dulu, lalu tool ini akan menyimpan SVG ke aksara tersebut.
            </div>
          )}
        </div>

        <aside className="grid min-w-0 content-start gap-3">
          <div className="min-w-0 rounded-2xl border border-[#2A2520]/10 bg-white p-4 shadow-[0_12px_34px_rgba(42,37,32,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-sm font-black text-[#2A2520]">
                {toolMode === "pen" ? <PenTool className="h-4 w-4 shrink-0 text-[#8B1F18]" /> : <Brush className="h-4 w-4 shrink-0 text-[#8B1F18]" />}
                <span className="truncate">{activeToolLabel}</span>
              </div>
              <span className="rounded-full bg-[#8B1F18]/10 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[#8B1F18]">
                Auto smooth
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selectToolMode("free")}
                disabled={saving || isTestingAnimation}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  toolMode === "free" ? "bg-[#8B1F18] text-white shadow-[0_8px_18px_rgba(139,31,24,0.18)]" : "bg-[#FBF7EE] text-[#4A3F37] hover:text-[#8B1F18]"
                }`}
              >
                <Brush className="h-3.5 w-3.5" />
                Bebas
              </button>
              <button
                type="button"
                onClick={() => selectToolMode("pen")}
                disabled={saving || isTestingAnimation}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  toolMode === "pen" ? "bg-[#8B1F18] text-white shadow-[0_8px_18px_rgba(139,31,24,0.18)]" : "bg-[#FBF7EE] text-[#4A3F37] hover:text-[#8B1F18]"
                }`}
              >
                <PenTool className="h-3.5 w-3.5" />
                Pen tool
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#FBF7EE] px-3 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#4A3F37]/55">Path</p>
                <p className="mt-1 text-2xl font-black text-[#8B1F18]">{strokes.length}</p>
              </div>
              <div className="rounded-xl bg-[#FBF7EE] px-3 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#4A3F37]/55">Target</p>
                <p className="mt-1 text-2xl font-black text-[#8B1F18]">{aksara?.target_stroke_count || strokes.length || "-"}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#4A3F37]/60">
                  <Brush className="h-3.5 w-3.5" />
                  Ketebalan
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#8B1F18]">{strokeWidth.toFixed(1)}</span>
                  <button
                    type="button"
                    onClick={() => setStrokeWidth(DEFAULT_STROKE_WIDTH)}
                    disabled={strokeWidth === DEFAULT_STROKE_WIDTH}
                    className="text-[0.6rem] font-black uppercase tracking-widest text-[#4A3F37]/55 underline-offset-2 hover:text-[#8B1F18] hover:underline disabled:cursor-not-allowed disabled:opacity-30 disabled:no-underline"
                    title={`Reset ke default (${DEFAULT_STROKE_WIDTH})`}
                  >
                    Reset
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="1.5"
                max="10"
                step="0.2"
                value={strokeWidth}
                onChange={(event) => setStrokeWidth(Number(event.target.value))}
                className="w-full accent-[#8B1F18]"
              />
            </div>
            {toolMode === "pen" && (
              <div className="mt-3 rounded-xl border border-[#8B1F18]/12 bg-[#8B1F18]/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8B1F18]">{penPoints.length} titik</p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={undoPenPoint}
                      disabled={!penPoints.length || saving || isTestingAnimation}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#4A3F37] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Undo titik pen"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelPenPath}
                      disabled={!penPoints.length || saving || isTestingAnimation}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#4A3F37] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Batal path pen"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={finishPenPath}
                  disabled={penPoints.length < 2 || saving || isTestingAnimation}
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#8B1F18] px-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Selesai path
                </button>
              </div>
            )}
          </div>

          <div className="min-w-0 rounded-2xl border border-[#2A2520]/10 bg-white p-4 shadow-[0_12px_34px_rgba(42,37,32,0.04)]">
            <div className="flex min-w-0 items-center gap-2 text-sm font-black text-[#2A2520]">
              <ImageIcon className="h-4 w-4 shrink-0 text-[#8B1F18]" />
              <span className="truncate">Referensi Glyph</span>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl bg-[#FBF7EE] px-3 py-3 text-center">
              <GlyphReference glyph={referenceGlyph || "?"} className="mx-auto h-20 w-20 overflow-hidden" />
              <p className="mt-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#4A3F37]/50">
                Glyph aktif
              </p>
            </div>
            <label className="mt-4 grid gap-2">
              <span className="inline-flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#4A3F37]/60">
                <Eye className="h-3.5 w-3.5" />
                Opacity
              </span>
              <input
                type="range"
                min="0.06"
                max="0.55"
                step="0.01"
                value={referenceOpacity}
                onChange={(event) => setReferenceOpacity(Number(event.target.value))}
                className="w-full accent-[#8B1F18]"
              />
            </label>
          </div>

          <details className="group min-w-0 rounded-2xl border border-[#2A2520]/10 bg-white p-4 shadow-[0_12px_34px_rgba(42,37,32,0.04)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.14em] text-[#4A3F37]/60">
              <span className="inline-flex items-center gap-2">
                <Code2 className="h-4 w-4 text-[#8B1F18]" />
                SVG output
              </span>
              <span className="text-[#8B1F18] group-open:hidden">Lihat</span>
              <span className="hidden text-[#8B1F18] group-open:inline">Tutup</span>
            </summary>
            <div className="mt-3 overflow-hidden rounded-xl border border-[#2A2520]/10 bg-[#fffaf0]">
              {strokes.length ? (
                // eslint-disable-next-line @next/next/no-img-element -- Preview SVG dibuat dari output tool lokal agar admin bisa cek hasil sebelum simpan.
                <img
                  src={generatedSvgPreviewUrl}
                  alt={`Preview SVG ${aksara?.latin || aksara?.name || "aksara"}`}
                  className="mx-auto h-32 w-full object-contain p-4"
                />
              ) : (
                <div className="grid min-h-32 place-items-center px-4 py-6 text-center text-xs font-black uppercase tracking-[0.12em] text-[#4A3F37]/45">
                  Gores dulu untuk melihat preview SVG.
                </div>
              )}
            </div>
            <pre className="mt-3 max-h-44 max-w-full overflow-auto whitespace-pre-wrap break-all rounded-xl bg-[#2A2520] p-3 text-[0.66rem] leading-5 text-[#fffaf0]">
              {generatedSvg}
            </pre>
          </details>

        </aside>
      </div>
    </section>
  );
}
