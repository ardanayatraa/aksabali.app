"use client";

import { useCallback, useRef, useState } from "react";
import { StrokeRecognition } from "../lib/strokeRecognition";

const averageScore = (metrics) => {
  if (!metrics.length) return 0;
  return Math.round(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length);
};

const HINT_DRAW_DURATION_MS = 1250;
const HINT_VISIBLE_MS = 1700;

export function useStrokeRecognizer({
  referencePaths,
  strokeTemplates = [],
  minScore = 64,
  onComplete,
  onStrokeComplete
}) {
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [userStrokes, setUserStrokes] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [strokeMetrics, setStrokeMetrics] = useState([]);
  const [lastMetric, setLastMetric] = useState(null);
  const [isDemoing, setIsDemoing] = useState(false);

  const isDrawing = useRef(false);
  const svgRef = useRef(null);
  const activeStrokeRef = useRef(null);
  const activePathData = useRef("");
  const activePoints = useRef([]);
  const activePointerId = useRef(null);
  const strokeMissed = useRef(false);
  const consecutiveWrong = useRef(0);
  const startTimeRef = useRef(null);
  const metricsRef = useRef([]);
  const mistakesRef = useRef(0);
  const rawStrokesRef = useRef([]);
  const normalizedStrokesRef = useRef([]);

  const buildResult = useCallback(
    (isDemo = false) => {
      const score = isDemo ? 100 : averageScore(metricsRef.current);
      const durationSeconds = startTimeRef.current
        ? Math.max(0, Math.round((Date.now() - startTimeRef.current) / 1000))
        : 0;

      return {
        score,
        passed: score >= minScore,
        mistakes: mistakesRef.current,
        durationSeconds,
        strokeCount: metricsRef.current.length,
        metrics: [...metricsRef.current],
        rawStrokes: rawStrokesRef.current.map((stroke) => [...stroke]),
        normalizedStrokes: normalizedStrokesRef.current.map((stroke) => [...stroke]),
        isDemo
      };
    },
    [minScore]
  );

  const reset = useCallback(() => {
    setCurrentStrokeIdx(0);
    setUserStrokes([]);
    setFeedback(null);
    setFeedbackMessage(null);
    setMistakes(0);
    setStrokeMetrics([]);
    setLastMetric(null);
    setIsDemoing(false);
    isDrawing.current = false;
    activePathData.current = "";
    activePoints.current = [];
    activePointerId.current = null;
    strokeMissed.current = false;
    consecutiveWrong.current = 0;
    startTimeRef.current = null;
    metricsRef.current = [];
    mistakesRef.current = 0;
    rawStrokesRef.current = [];
    normalizedStrokesRef.current = [];
    if (activeStrokeRef.current) activeStrokeRef.current.setAttribute("d", "");
  }, []);

  const markWrong = useCallback((userD, metric) => {
    consecutiveWrong.current += 1;
    mistakesRef.current += 1;
    setMistakes(mistakesRef.current);
    strokeMissed.current = true;
    setLastMetric(metric);
    setFeedback(metric.feedbackCode);
    setFeedbackMessage(metric.feedbackMessage);
    setUserStrokes((prev) => [...prev, { d: userD, status: "wrong" }]);
    setTimeout(() => {
      setUserStrokes((prev) => prev.filter((stroke) => stroke.d !== userD));
    }, 900);
    if (activeStrokeRef.current) activeStrokeRef.current.setAttribute("d", "");

    if (consecutiveWrong.current >= 3) {
      setFeedback("threeWrong");
      setFeedbackMessage("Tiga kali belum tepat. Petunjuk stroke ditampilkan.");
      consecutiveWrong.current = 0;
    }
  }, []);

  const finishAcceptedStroke = useCallback(
    (idx, refD, metric, rawPoints, normalizedPoints) => {
      metricsRef.current = [...metricsRef.current, metric];
      rawStrokesRef.current = [...rawStrokesRef.current, rawPoints];
      normalizedStrokesRef.current = [...normalizedStrokesRef.current, normalizedPoints];
      setStrokeMetrics(metricsRef.current);
      setLastMetric(metric);
      setUserStrokes((prev) => [...prev, { d: refD, status: strokeMissed.current ? "correctAfterMiss" : "correct" }]);
      setFeedback(strokeMissed.current ? "correctAfterMiss" : metric.score >= 88 ? "correct" : "close");
      setFeedbackMessage(metric.feedbackMessage);
      strokeMissed.current = false;
      consecutiveWrong.current = 0;

      const nextIdx = idx + 1;
      setCurrentStrokeIdx(nextIdx);
      if (nextIdx >= referencePaths.length) {
        setFeedback("finished");
        setFeedbackMessage("Karakter selesai. Skor stroke tersimpan.");
        if (onComplete) setTimeout(() => onComplete(buildResult(false)), 350);
      } else if (onStrokeComplete) {
        onStrokeComplete(idx, metric);
      }
      if (activeStrokeRef.current) activeStrokeRef.current.setAttribute("d", "");
    },
    [buildResult, onComplete, onStrokeComplete, referencePaths.length]
  );

  const evaluateStroke = useCallback(
    (rawPoints) => {
      const idx = currentStrokeIdx;
      if (idx >= referencePaths.length) {
        setFeedback("tooMany");
        setFeedbackMessage("Terlalu banyak goresan. Karakter ini sudah selesai.");
        if (activeStrokeRef.current) activeStrokeRef.current.setAttribute("d", "");
        return;
      }

      if (rawPoints.length < 2 || StrokeRecognition.pathLength(rawPoints) < 5) {
        if (activeStrokeRef.current) activeStrokeRef.current.setAttribute("d", "");
        return;
      }

      const refD = referencePaths[idx];
      const templatePaths = strokeTemplates
        .map((attempt) => attempt?.[idx])
        .filter((points) => Array.isArray(points) && points.length > 2)
        .map((points) => StrokeRecognition.pointsToPath(points));
      const evaluations = [refD, ...templatePaths].map((candidateD) =>
        StrokeRecognition.evaluate(rawPoints, candidateD)
      );
      const bestEvaluation = evaluations.reduce(
        (best, current) => (current.metric.score > best.metric.score ? current : best),
        evaluations[0]
      );
      const { metric, normalizedPoints } = bestEvaluation;
      const normalizedD = StrokeRecognition.pointsToPath(normalizedPoints);

      if (metric.score < minScore) {
        markWrong(normalizedD, metric);
        return;
      }

      finishAcceptedStroke(idx, refD, metric, rawPoints, normalizedPoints);
    },
    [currentStrokeIdx, finishAcceptedStroke, markWrong, minScore, referencePaths, strokeTemplates]
  );

  const getSVGPoint = useCallback((event) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return { x: 0, y: 0 };
    const transformed = point.matrixTransform(screenCTM.inverse());
    return {
      x: transformed.x,
      y: transformed.y,
      t: performance.now(),
      pressure: event.pressure,
      tiltX: event.tiltX,
      tiltY: event.tiltY,
      pointerType: event.pointerType
    };
  }, []);

  const isPalmLikeInput = useCallback((event) => {
    if (!event.isPrimary && event.pointerType === "touch") return true;
    if (event.pointerType === "touch" && (event.width > 42 || event.height > 42)) return true;
    if (activePointerId.current !== null && activePointerId.current !== event.pointerId) return true;
    if (event.pointerType === "pen" && event.buttons === 0) return true;
    return false;
  }, []);

  const startStroke = useCallback(
    (event) => {
      if (currentStrokeIdx >= referencePaths.length || isDemoing || isPalmLikeInput(event)) return;
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      activePointerId.current = event.pointerId;
      isDrawing.current = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const point = getSVGPoint(event);
      activePoints.current = [point];
      activePathData.current = `M${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      if (activeStrokeRef.current) activeStrokeRef.current.setAttribute("d", activePathData.current);
    },
    [currentStrokeIdx, getSVGPoint, isDemoing, isPalmLikeInput, referencePaths.length]
  );

  const moveStroke = useCallback(
    (event) => {
      if (!isDrawing.current || isDemoing) return;
      if (activePointerId.current !== event.pointerId || isPalmLikeInput(event)) return;
      event.preventDefault();
      const point = getSVGPoint(event);
      const previous = activePoints.current[activePoints.current.length - 1];
      if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 0.35) return;
      activePoints.current.push(point);
      activePathData.current += ` L${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      if (activeStrokeRef.current) activeStrokeRef.current.setAttribute("d", activePathData.current);
    },
    [getSVGPoint, isDemoing, isPalmLikeInput]
  );

  const endStroke = useCallback(
    (event) => {
      if (!isDrawing.current || activePointerId.current !== event.pointerId) return;
      isDrawing.current = false;
      activePointerId.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      evaluateStroke([...activePoints.current]);
      activePoints.current = [];
      activePathData.current = "";
    },
    [evaluateStroke]
  );

  const triggerHint = useCallback(() => {
    if (currentStrokeIdx >= referencePaths.length) return;
    const hintStroke = { d: referencePaths[currentStrokeIdx], status: "hint" };
    setUserStrokes((prev) => [...prev, hintStroke]);
    setTimeout(() => {
      setUserStrokes((prev) => prev.filter((stroke) => stroke !== hintStroke));
    }, HINT_VISIBLE_MS);
  }, [currentStrokeIdx, referencePaths]);

  const triggerShow = useCallback(() => {
    if (isDemoing) return;
    const remainingStrokes = referencePaths.slice(currentStrokeIdx);
    if (!remainingStrokes.length) return;
    setIsDemoing(true);
    setUserStrokes([]);
    if (activeStrokeRef.current) activeStrokeRef.current.setAttribute("d", "");

    let delay = 150;
    const strokeDuration = HINT_DRAW_DURATION_MS;
    const pauseBetween = 250;
    remainingStrokes.forEach((d, index) => {
      setTimeout(() => {
        setUserStrokes((prev) => [...prev, { d, status: "hint" }]);
      }, delay);
      setTimeout(() => {
        setCurrentStrokeIdx((idx) => idx + 1);
        if (index === remainingStrokes.length - 1) {
          setFeedback("finished");
          setFeedbackMessage("Demo selesai. Ini tidak dihitung sebagai skor latihanmu.");
          setIsDemoing(false);
          if (onComplete) setTimeout(() => onComplete(buildResult(true)), 300);
        }
      }, delay + strokeDuration);
      delay += strokeDuration + pauseBetween;
    });
  }, [buildResult, currentStrokeIdx, isDemoing, onComplete, referencePaths]);

  return {
    currentStrokeIdx,
    userStrokes,
    feedback,
    feedbackMessage,
    mistakes,
    strokeMetrics,
    lastMetric,
    averageScore: averageScore(strokeMetrics),
    svgRef,
    activeStrokeRef,
    handlers: {
      onPointerDown: startStroke,
      onPointerMove: moveStroke,
      onPointerUp: endStroke,
      onPointerCancel: endStroke,
      onPointerLeave: endStroke
    },
    reset,
    triggerHint,
    triggerShow,
    isDemoing
  };
}
