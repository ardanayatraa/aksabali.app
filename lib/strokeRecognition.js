import { Geom } from "./geometry";
import { pathToPolyline } from "./svgPathSampler";

const TARGET_POINT_COUNT = 48;
const EPSILON = 0.00001;

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const StrokeRecognition = {
  pointsToPath(points) {
    if (!points.length) return "";
    const [first, ...rest] = points;
    return [
      `M${first.x.toFixed(2)},${first.y.toFixed(2)}`,
      ...rest.map((point) => `L${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    ].join(" ");
  },

  pathToPoints(pathD, count = TARGET_POINT_COUNT) {
    if (!pathD) return [];
    if (typeof document !== "undefined") {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathD);
      const length = path.getTotalLength();
      if (!Number.isFinite(length) || length <= 0) return [];
      return Array.from({ length: count }, (_, index) => {
        const point = path.getPointAtLength((length * index) / Math.max(1, count - 1));
        return { x: point.x, y: point.y };
      });
    }
    return this.resample(pathToPolyline(pathD), count);
  },

  pathLength(points) {
    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
      total += Geom.distance(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
    }
    return total;
  },

  centroid(points) {
    if (!points.length) return { x: 0, y: 0 };
    const total = points.reduce(
      (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
      { x: 0, y: 0 }
    );
    return { x: total.x / points.length, y: total.y / points.length };
  },

  smooth(points, radius = 2) {
    if (points.length <= 2) return points;
    return points.map((point, index) => {
      if (index === 0 || index === points.length - 1) return point;
      const start = Math.max(0, index - radius);
      const end = Math.min(points.length - 1, index + radius);
      const averaged = this.centroid(points.slice(start, end + 1));
      return { ...point, x: averaged.x, y: averaged.y };
    });
  },

  resample(points, count = TARGET_POINT_COUNT) {
    if (points.length === 0) return [];
    if (points.length === 1) return Array.from({ length: count }, () => points[0]);

    const totalLength = this.pathLength(points);
    if (totalLength <= EPSILON) return Array.from({ length: count }, () => points[0]);

    const interval = totalLength / (count - 1);
    const sampled = [{ ...points[0] }];
    let distanceSinceLast = 0;
    let previous = { ...points[0] };

    for (let i = 1; i < points.length; i += 1) {
      let current = { ...points[i] };
      let segmentLength = Geom.distance(previous.x, previous.y, current.x, current.y);

      while (distanceSinceLast + segmentLength >= interval && segmentLength > EPSILON) {
        const ratio = (interval - distanceSinceLast) / segmentLength;
        const nextPoint = {
          x: previous.x + ratio * (current.x - previous.x),
          y: previous.y + ratio * (current.y - previous.y),
          t: current.t,
          pressure: current.pressure,
          tiltX: current.tiltX,
          tiltY: current.tiltY,
          pointerType: current.pointerType
        };
        sampled.push(nextPoint);
        previous = nextPoint;
        segmentLength = Geom.distance(previous.x, previous.y, current.x, current.y);
        distanceSinceLast = 0;
      }

      distanceSinceLast += segmentLength;
      previous = current;
    }

    while (sampled.length < count) sampled.push({ ...points[points.length - 1] });
    return sampled.slice(0, count);
  },

  dtwDistance(a, b) {
    if (!a.length || !b.length) return Number.POSITIVE_INFINITY;
    const rows = a.length + 1;
    const cols = b.length + 1;
    const dp = Array.from({ length: rows }, () => Array(cols).fill(Number.POSITIVE_INFINITY));
    dp[0][0] = 0;

    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        const cost = Geom.distance(a[i - 1].x, a[i - 1].y, b[j - 1].x, b[j - 1].y);
        dp[i][j] = cost + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }

    return dp[a.length][b.length] / (a.length + b.length);
  },

  directedHausdorff(a, b) {
    if (!a.length || !b.length) return Number.POSITIVE_INFINITY;
    let maxMinDistance = 0;
    for (const point of a) {
      let minDistance = Number.POSITIVE_INFINITY;
      for (const other of b) {
        minDistance = Math.min(minDistance, Geom.distance(point.x, point.y, other.x, other.y));
      }
      maxMinDistance = Math.max(maxMinDistance, minDistance);
    }
    return maxMinDistance;
  },

  smoothness(points) {
    if (points.length < 4) return 100;
    let angleChange = 0;
    let samples = 0;
    for (let i = 2; i < points.length; i += 1) {
      const a1 = Geom.angle(points[i - 2].x, points[i - 2].y, points[i - 1].x, points[i - 1].y);
      const a2 = Geom.angle(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
      angleChange += Geom.angleDiff(a1, a2);
      samples += 1;
    }
    const avgChange = samples ? angleChange / samples : 0;
    return clamp(100 - Math.max(0, avgChange - 18) * 1.8);
  },

  evaluate(userPoints, referenceD) {
    const cleanedUser = this.resample(this.smooth(userPoints), TARGET_POINT_COUNT);
    const refPoints = this.pathToPoints(referenceD, TARGET_POINT_COUNT);
    const userLength = this.pathLength(cleanedUser);
    const refLength = this.pathLength(refPoints);
    const refReversed = [...refPoints].reverse();

    const directDtw = this.dtwDistance(cleanedUser, refPoints);
    const reverseDtw = this.dtwDistance(cleanedUser, refReversed);
    const isDirectionReversed = reverseDtw + 1.5 < directDtw;
    const compareRef = isDirectionReversed ? refReversed : refPoints;

    const dtwDistance = Math.min(directDtw, reverseDtw);
    const hausdorffDistance = Math.max(
      this.directedHausdorff(cleanedUser, compareRef),
      this.directedHausdorff(compareRef, cleanedUser)
    );
    const startDistance = refPoints.length
      ? Geom.distance(cleanedUser[0]?.x || 0, cleanedUser[0]?.y || 0, refPoints[0].x, refPoints[0].y)
      : 999;
    const endDistance = refPoints.length
      ? Geom.distance(
          cleanedUser[cleanedUser.length - 1]?.x || 0,
          cleanedUser[cleanedUser.length - 1]?.y || 0,
          refPoints[refPoints.length - 1].x,
          refPoints[refPoints.length - 1].y
        )
      : 999;
    const centroidUser = this.centroid(cleanedUser);
    const centroidRef = this.centroid(refPoints);
    const centroidDistance = Geom.distance(centroidUser.x, centroidUser.y, centroidRef.x, centroidRef.y);
    const lengthRatio = userLength / Math.max(refLength, EPSILON);

    const positionScore = clamp(100 - (startDistance * 2.2 + endDistance * 1.5 + centroidDistance * 2.4));
    const shapeScore = clamp(100 - (dtwDistance * 7.5 + hausdorffDistance * 2.2));
    const directionScore = isDirectionReversed ? clamp(45 - reverseDtw) : clamp(100 - Math.abs(startDistance - endDistance) * 0.8);
    const lengthScore = clamp(100 - Math.abs(1 - lengthRatio) * 95);
    const smoothnessScore = this.smoothness(cleanedUser);

    const score = clamp(
      shapeScore * 0.42 +
        positionScore * 0.24 +
        directionScore * 0.18 +
        lengthScore * 0.11 +
        smoothnessScore * 0.05
    );

    let feedbackCode = "shape_off";
    let feedbackMessage = "Bentuk stroke belum mengikuti contoh.";
    if (isDirectionReversed) {
      feedbackCode = "direction_reversed";
      feedbackMessage = "Arah goresan terbalik. Ikuti arah awal contoh.";
    } else if (startDistance > 12) {
      feedbackCode = "start_far";
      feedbackMessage = "Titik mulai terlalu jauh dari contoh.";
    } else if (endDistance > 14) {
      feedbackCode = "end_far";
      feedbackMessage = "Akhir goresan belum sampai posisi yang tepat.";
    } else if (lengthRatio < 0.72) {
      feedbackCode = "too_short";
      feedbackMessage = "Goresan terlalu pendek.";
    } else if (lengthRatio > 1.38) {
      feedbackCode = "too_long";
      feedbackMessage = "Goresan terlalu panjang.";
    } else if (smoothnessScore < 62) {
      feedbackCode = "jittery";
      feedbackMessage = "Goresan terlalu bergetar. Coba tulis lebih stabil.";
    } else if (score >= 88) {
      feedbackCode = "excellent";
      feedbackMessage = "Presisi sangat bagus.";
    } else if (score >= 76) {
      feedbackCode = "good";
      feedbackMessage = "Bagus, stroke sudah sesuai.";
    } else if (score >= 64) {
      feedbackCode = "close";
      feedbackMessage = "Hampir benar. Rapikan bentuk sedikit lagi.";
    }

    return {
      normalizedPoints: cleanedUser,
      metric: {
        score: Math.round(score),
        shapeScore: Math.round(shapeScore),
        directionScore: Math.round(directionScore),
        lengthScore: Math.round(lengthScore),
        positionScore: Math.round(positionScore),
        smoothnessScore: Math.round(smoothnessScore),
        dtwDistance: Number(dtwDistance.toFixed(2)),
        hausdorffDistance: Number(hausdorffDistance.toFixed(2)),
        startDistance: Number(startDistance.toFixed(2)),
        endDistance: Number(endDistance.toFixed(2)),
        centroidDistance: Number(centroidDistance.toFixed(2)),
        lengthRatio: Number(lengthRatio.toFixed(2)),
        isDirectionReversed,
        feedbackCode,
        feedbackMessage
      }
    };
  }
};
