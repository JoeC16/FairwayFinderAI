import type { FittingEngineInput, FittingResult, LieLengthRecommendation, UpgradePriority } from "@/types/fitting";
import { calculateConfidence, confidenceScoresFromReport } from "./confidence-engine";
import { runDriverEngine } from "./driver-engine";
import { runIronEngine, determineLengthAdjustment } from "./iron-engine";
import { runWedgeEngine } from "./wedge-engine";
import { runShaftEngine } from "./shaft-engine";
import { runBagGappingEngine } from "./bag-gapping-engine";
import { getConfidenceTier } from "@/lib/utils";

// ============================================================
// LIE & LENGTH
// ============================================================

function runLieLengthEngine(input: FittingEngineInput): LieLengthRecommendation {
  const p = input.profile;
  const t = input.tendencies;

  const { adjustment: ironLength, adjustmentInches } = determineLengthAdjustment(p.wristToFloorCm, p.heightCm);

  let lieAdjDeg = 0;
  let lieAdjLabel = "Standard lie angle";

  if (t?.strikePattern === "toe") {
    lieAdjDeg = 2;
    lieAdjLabel = "+2° upright (toe strikes indicate too flat)";
  } else if (t?.strikePattern === "heel") {
    lieAdjDeg = -2;
    lieAdjLabel = "-2° flat (heel strikes indicate too upright)";
  } else if (p.heightCm) {
    const heightIn = p.heightCm / 2.54;
    if (heightIn > 76) { lieAdjDeg = 2; lieAdjLabel = "+2° upright (tall stature)"; }
    else if (heightIn > 73) { lieAdjDeg = 1; lieAdjLabel = "+1° upright (above average height)"; }
    else if (heightIn < 65) { lieAdjDeg = -2; lieAdjLabel = "-2° flat (shorter stature)"; }
    else if (heightIn < 68) { lieAdjDeg = -1; lieAdjLabel = "-1° flat (below average height)"; }
  }

  const heightIn = p.heightCm / 2.54;
  let driverLength = "45.5 inches (standard)";
  if (heightIn >= 76) driverLength = "46 inches (+0.5\")";
  else if (heightIn >= 73) driverLength = "45.5 inches (standard)";
  else if (heightIn >= 68) driverLength = "45 inches (-0.5\")";
  else driverLength = "44.5 inches (-1\")";

  const measurementMethod: LieLengthRecommendation["measurementMethod"] =
    p.wristToFloorCm ? "height_wrist" : "height_only";

  const reasoning: string[] = [
    `Length fit based on ${measurementMethod === "height_wrist" ? `wrist-to-floor of ${p.wristToFloorCm}cm` : `height of ${p.heightCm}cm`}.`,
    `Iron set: ${ironLength}.`,
    `Lie angle: ${lieAdjLabel}.`,
    `Lie and length adjustments must be confirmed on a lie board before ordering — an in-person fitting is recommended to validate these numbers.`,
    ...(measurementMethod === "height_only"
      ? ["Wrist-to-floor measurement would improve lie/length accuracy significantly."]
      : []),
  ];

  return {
    driverLength,
    ironLength,
    lengthAdjustment: adjustmentInches,
    lieAdjustment: lieAdjLabel,
    lieAdjustmentDegrees: lieAdjDeg,
    reasoning,
    measurementMethod,
  };
}

// ============================================================
// UPGRADE PRIORITY ENGINE
// ============================================================

function buildUpgradePriorities(input: FittingEngineInput): UpgradePriority[] {
  const priorities: UpgradePriority[] = [];
  const bag = input.currentBag?.clubs ?? [];
  const p = input.profile;

  const driver = bag.find((c) => c.category === "driver");
  const irons = bag.find((c) => c.category === "iron_set");
  const wedges = bag.filter((c) => c.category === "wedge");

  let rank = 1;

  // Driver - highest ROI for most golfers
  if (!driver || !driver.model) {
    priorities.push({
      rank: rank++,
      club: "Driver",
      currentClub: driver ? `${driver.brand ?? ""} ${driver.model ?? "Unknown"}`.trim() : "None",
      recommendedClub: "New fitted driver",
      expectedImprovement: "10-15 extra yards, improved accuracy",
      estimatedCost: "£450-£700",
      priority: "high",
      reasoning: "Driver fitting typically delivers the largest performance improvement per dollar spent.",
    });
  }

  // Wedges - high scoring impact
  if (wedges.length < 2) {
    priorities.push({
      rank: rank++,
      club: "Wedge Set",
      currentClub: wedges.length > 0 ? "Partial wedge set" : "No dedicated wedges",
      recommendedClub: "Complete 3-wedge setup",
      expectedImprovement: "Better distance gapping, improved spin control",
      estimatedCost: "£400-£600",
      priority: "high",
      reasoning: "Scoring zone precision improves more with proper wedge fitting than almost any other change.",
    });
  }

  // Irons
  if (!irons?.model || p.handicap >= 15) {
    priorities.push({
      rank: rank++,
      club: "Irons",
      currentClub: irons ? `${irons.brand ?? ""} ${irons.model ?? "Unknown"}`.trim() : "Unknown",
      recommendedClub: p.handicap >= 20 ? "Game improvement irons" : "Players distance irons",
      expectedImprovement: "More consistent distances, improved launch conditions",
      estimatedCost: "£800-£1,400",
      priority: p.handicap >= 20 ? "high" : "medium",
      reasoning: "New irons matched to your swing speed and lie/length requirements will produce more consistent results.",
    });
  }

  // Long game gap club
  const dm = input.distanceMatrix;
  if (dm?.driver && dm?.fiveIron) {
    const longGameGap = (dm.driver ?? 0) - (dm.fiveIron ?? 0);
    if (longGameGap > 80) {
      priorities.push({
        rank: rank++,
        club: "Fairway Wood / Hybrid",
        currentClub: "Gap in long game",
        recommendedClub: `${Math.round(dm.driver - 40)}y gap club`,
        expectedImprovement: `Better coverage for ${Math.round(dm.driver - 50)}-${Math.round(dm.driver - 15)}y shots`,
        estimatedCost: "£200-£350",
        priority: "medium",
        reasoning: "A significant long-game gap exists between your driver and longest iron.",
      });
    }
  }

  return priorities.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  }).map((p, i) => ({ ...p, rank: i + 1 }));
}

// ============================================================
// SUMMARY GENERATOR
// ============================================================

function generateSummaryPoints(input: FittingEngineInput): string[] {
  const p = input.profile;
  const t = input.tendencies;
  const lm = input.launchMonitor?.driverData;
  const points: string[] = [];

  points.push(`Handicap ${p.handicap} — ${p.handicap <= 10 ? "skilled ball striker" : p.handicap <= 20 ? "developing player" : "recreational golfer"} profile.`);

  if (lm?.clubSpeed) {
    points.push(`Driver club speed of ${lm.clubSpeed} mph — ${lm.clubSpeed >= 100 ? "fast" : lm.clubSpeed >= 85 ? "moderate" : "slower"} swing speed category.`);
  }
  if (t?.typicalMiss && t.typicalMiss !== "straight") {
    const missLabel = t.typicalMiss.replace("_", " ");
    points.push(`Primary miss: ${missLabel} — equipment adjustments targeting this tendency.`);
  }
  if (t?.frustrations?.length) {
    points.push(`Key frustrations: ${t.frustrations.slice(0, 2).join(", ")}.`);
  }
  if (p.wristToFloorCm) {
    points.push(`Physical measurements taken — personalised lie and length recommendations available.`);
  }

  return points;
}

function generateExpectedBenefits(input: FittingEngineInput): string[] {
  const benefits: string[] = [];
  const p = input.profile;
  const t = input.tendencies;
  const lm = input.launchMonitor?.driverData;

  if (t?.typicalMiss === "slice" || t?.typicalMiss === "push_fade") {
    benefits.push("Significantly reduced slice miss with draw-biased driver recommendation.");
  }
  if (lm?.clubSpeed && lm.clubSpeed < 85) {
    benefits.push("Higher launch and carry distance through optimised loft selection.");
  }
  if (p.handicap >= 15) {
    benefits.push("Larger sweet spots and higher forgiveness to reduce mishit penalties.");
  }
  if (p.wristToFloorCm) {
    benefits.push("Consistent distance control through accurate lie and length fitting.");
  }
  benefits.push("Complete wedge gapping for better scoring zone distance control.");
  benefits.push("Equipment matched to your swing — not generic off-the-shelf specification.");

  return benefits;
}

// ============================================================
// MAIN FITTING RUNNER
// ============================================================

export async function runFittingEngine(input: FittingEngineInput): Promise<FittingResult> {
  const confidence = calculateConfidence(input);
  const driver = runDriverEngine(input);
  const irons = runIronEngine(input);
  const wedges = runWedgeEngine(input);
  const shafts = runShaftEngine(input);
  const lieLength = runLieLengthEngine(input);
  const bagGaps = runBagGappingEngine(input);
  const upgradePriorities = buildUpgradePriorities(input);
  const summaryPoints = generateSummaryPoints(input);
  const expectedBenefits = generateExpectedBenefits(input);

  return {
    sessionId: input.sessionId,
    confidence,
    driver,
    irons,
    wedges,
    shafts,
    lieLength,
    bagGaps,
    upgradePriorities,
    summaryPoints,
    expectedBenefits,
    generatedAt: new Date(),
  };
}
