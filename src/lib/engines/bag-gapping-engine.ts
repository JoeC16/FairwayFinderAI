import type {
  FittingEngineInput,
  BagGapAnalysis,
  ClubGap,
  GapChartPoint,
} from "@/types/fitting";

const CLUB_ORDER = [
  { key: "driver", label: "Driver" },
  { key: "threeWood", label: "3 Wood" },
  { key: "fiveWood", label: "5 Wood" },
  { key: "sevenWood", label: "7 Wood" },
  { key: "hybrid", label: "Hybrid" },
  { key: "drivingIron", label: "Driving Iron" },
  { key: "fourIron", label: "4 Iron" },
  { key: "fiveIron", label: "5 Iron" },
  { key: "sixIron", label: "6 Iron" },
  { key: "sevenIron", label: "7 Iron" },
  { key: "eightIron", label: "8 Iron" },
  { key: "nineIron", label: "9 Iron" },
  { key: "pitchingWedge", label: "PW" },
  { key: "gapWedge", label: "GW" },
  { key: "sandWedge", label: "SW" },
  { key: "lobWedge", label: "LW" },
] as const;

const TARGET_GAPS: Record<string, number> = {
  "Driver->3 Wood":    25,
  "3 Wood->5 Wood":    15,
  "5 Wood->7 Wood":    12,
  "5 Wood->Hybrid":    12,
  "7 Wood->Hybrid":    10,
  "Hybrid->4 Iron":    12,
  "Hybrid->5 Iron":    12,
  "4 Iron->5 Iron":    10,
  "5 Iron->6 Iron":    10,
  "6 Iron->7 Iron":    10,
  "7 Iron->8 Iron":    10,
  "8 Iron->9 Iron":    10,
  "9 Iron->PW":        10,
  "PW->GW":            15,
  "GW->SW":            12,
  "SW->LW":            12,
  default:             12,
};

function getTargetGap(fromClub: string, toClub: string): number {
  const key = `${fromClub}->${toClub}`;
  return TARGET_GAPS[key] ?? TARGET_GAPS.default;
}

function getGapSeverity(
  actualGap: number,
  targetGap: number
): ClubGap["severity"] {
  const pct = actualGap / targetGap;
  if (pct < 0.5) return "problem";
  if (pct < 0.7) return "concern";
  if (pct < 0.85) return "acceptable";
  if (pct > 1.8)  return "problem";
  if (pct > 1.4)  return "concern";
  return "optimal";
}

function buildGapRecommendation(
  fromClub: string,
  toClub: string,
  actualGap: number,
  targetGap: number,
  severity: ClubGap["severity"]
): string | undefined {
  if (severity === "optimal" || severity === "acceptable") return undefined;

  if (actualGap < targetGap * 0.7) {
    return `${fromClub} and ${toClub} overlap — consider removing ${toClub} or replacing with a club that fills the gap better.`;
  }

  if (actualGap > targetGap * 1.4) {
    const midDistance = Math.round((actualGap / 2) * 10) / 10;
    return `${actualGap}y gap between ${fromClub} and ${toClub} — a ${midDistance}-yard gap club (or loft adjustment) would improve your bag coverage.`;
  }

  return undefined;
}

// ============================================================
// MAIN ENGINE
// ============================================================

export function runBagGappingEngine(input: FittingEngineInput): BagGapAnalysis {
  const dm = input.distanceMatrix;

  if (!dm) {
    return {
      gaps: [],
      overallGrading: "poor",
      missingWindows: ["All distance data missing — complete your distance matrix for gap analysis."],
      overlaps: [],
      totalBagReach: 0,
      longestGap: null,
      recommendations: ["Enter your carry distances in Step 4 to unlock a full bag gap analysis."],
      chartData: [],
    };
  }

  // Build ordered club-distance pairs (skip clubs with no distance)
  const clubs: { label: string; distance: number }[] = [];

  for (const entry of CLUB_ORDER) {
    const dist = dm[entry.key as keyof typeof dm] as number | undefined;
    if (dist && dist > 0) {
      clubs.push({ label: entry.label, distance: dist });
    }
  }

  if (clubs.length < 3) {
    return {
      gaps: [],
      overallGrading: "poor",
      missingWindows: ["Fewer than 3 club distances entered — add more for meaningful gap analysis."],
      overlaps: [],
      totalBagReach: 0,
      longestGap: null,
      recommendations: [],
      chartData: clubs.map((c) => ({ club: c.label, carry: c.distance })),
    };
  }

  // Sort by distance (descending)
  clubs.sort((a, b) => b.distance - a.distance);

  const gaps: ClubGap[] = [];
  const overlaps: string[] = [];
  const missingWindows: string[] = [];

  for (let i = 0; i < clubs.length - 1; i++) {
    const from = clubs[i];
    const to = clubs[i + 1];
    const actualGap = from.distance - to.distance;
    const targetGap = getTargetGap(from.label, to.label);
    const severity = getGapSeverity(actualGap, targetGap);
    const recommendation = buildGapRecommendation(from.label, to.label, actualGap, targetGap, severity);

    gaps.push({
      fromClub: from.label,
      toClub: to.label,
      fromDistance: from.distance,
      toDistance: to.distance,
      gap: actualGap,
      targetGap,
      severity,
      recommendation,
    });

    if (actualGap < 0) {
      overlaps.push(`${from.label} (${from.distance}y) and ${to.label} (${to.distance}y) overlap.`);
    }
    if (severity === "problem" && actualGap > 0) {
      missingWindows.push(`${actualGap}y gap between ${from.label} and ${to.label} — optimal gap is ~${targetGap}y.`);
    }
  }

  const totalBagReach = clubs.length > 0 ? clubs[0].distance : 0;
  const longestGap = gaps.length > 0
    ? gaps.reduce((prev, curr) => (curr.gap > prev.gap ? curr : prev))
    : null;

  // Calculate grading
  const problemCount = gaps.filter((g) => g.severity === "problem").length;
  const concernCount = gaps.filter((g) => g.severity === "concern").length;
  let overallGrading: BagGapAnalysis["overallGrading"];
  if (problemCount === 0 && concernCount <= 1) overallGrading = "excellent";
  else if (problemCount <= 1 && concernCount <= 2) overallGrading = "good";
  else if (problemCount <= 2 || concernCount <= 4) overallGrading = "fair";
  else overallGrading = "poor";

  // Recommendations
  const recommendations: string[] = [];

  if (longestGap && longestGap.gap > 25) {
    recommendations.push(
      `Priority: Address the ${longestGap.gap}y gap between ${longestGap.fromClub} and ${longestGap.toClub}.`
    );
  }

  if (overlaps.length > 0) {
    recommendations.push("Review overlapping clubs — you may have unnecessary clubs in your bag.");
  }

  const hasLongGameGap = gaps.some(
    (g) =>
      (g.fromClub === "Driver" || g.fromClub === "3 Wood" || g.fromClub === "5 Wood") &&
      g.severity === "problem"
  );
  if (hasLongGameGap) {
    recommendations.push("Consider adding a hybrid or fairway wood to cover the long-game gap.");
  }

  const hasScoringGap = gaps.some(
    (g) =>
      (g.fromClub === "PW" || g.fromClub === "GW" || g.fromClub === "SW") &&
      g.severity !== "optimal"
  );
  if (hasScoringGap) {
    recommendations.push("Scoring zone gap detected — adjust your wedge loft spacing for better distance control.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Your bag gapping is well-structured with consistent distance windows across the set.");
  }

  // Chart data
  const chartData: GapChartPoint[] = clubs.map((c, i) => ({
    club: c.label,
    carry: c.distance,
    target: i < clubs.length - 1 ? clubs[i + 1].distance + getTargetGap(c.label, clubs[i + 1].label) : undefined,
    optimal: gaps[i]?.severity === "optimal",
  }));

  return {
    gaps,
    overallGrading,
    missingWindows,
    overlaps,
    totalBagReach,
    longestGap,
    recommendations,
    chartData,
  };
}
