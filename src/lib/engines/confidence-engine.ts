import type {
  FittingEngineInput,
  ConfidenceScores,
  ConfidenceDetail,
  FullConfidenceReport,
  ConfidenceTier,
} from "@/types/fitting";
import { getConfidenceTier } from "@/lib/utils";

// Confidence weights per spec
const WEIGHTS = {
  launchMonitor: 0.30,
  distanceMatrix: 0.20,
  tendencies: 0.15,
  physicalMeasurements: 0.15,
  currentEquipment: 0.10,
  swingVideo: 0.10,
} as const;

function scoreLaunchMonitor(input: FittingEngineInput): number {
  const lm = input.launchMonitor;
  if (!lm) return 0;

  let score = 0;
  const d = lm.driverData;
  if (d) {
    if (d.clubSpeed) score += 8;
    if (d.launchAngle) score += 6;
    if (d.spinRate) score += 6;
    if (d.attackAngle !== undefined) score += 5;
    if (d.ballSpeed) score += 3;
    if (d.clubPath !== undefined) score += 2;
  }
  if (lm.ironData) {
    if (lm.ironData.clubSpeed) score += 3;
    if (lm.ironData.launchAngle) score += 3;
    if (lm.ironData.spinRate) score += 2;
    if (lm.ironData.carryDistance) score += 2;
  }
  return Math.min(score, 100);
}

function scoreDistanceMatrix(input: FittingEngineInput): number {
  const dm = input.distanceMatrix;
  if (!dm) return 0;

  const fields: (keyof typeof dm)[] = [
    "driver", "threeWood", "fiveWood", "hybrid", "fiveIron", "sixIron",
    "sevenIron", "eightIron", "nineIron", "pitchingWedge", "gapWedge",
    "sandWedge", "lobWedge",
  ];

  const filled = fields.filter((f) => dm[f] && (dm[f] as number) > 0).length;
  return Math.round((filled / fields.length) * 100);
}

function scoreTendencies(input: FittingEngineInput): number {
  const t = input.tendencies;
  if (!t) return 0;

  let score = 0;
  if (t.typicalMiss) score += 30;
  if (t.strikePattern) score += 25;
  if (t.ballFlight) score += 20;
  if (t.shotShape) score += 15;
  if (t.frustrations?.length) score += 10;
  return Math.min(score, 100);
}

function scorePhysicalMeasurements(input: FittingEngineInput): number {
  const p = input.profile;
  let score = 0;
  if (p.heightCm) score += 40;
  if (p.wristToFloorCm) score += 40;
  if (p.age) score += 10;
  if (p.handicap !== undefined) score += 10;
  return Math.min(score, 100);
}

function scoreCurrentEquipment(input: FittingEngineInput): number {
  const bag = input.currentBag;
  if (!bag?.clubs?.length) return 0;

  let score = 20;
  const hasDriver = bag.clubs.find((c) => c.category === "driver");
  if (hasDriver) score += 20;
  if (hasDriver?.shaft) score += 20;
  if (hasDriver?.flex) score += 15;
  if (bag.clubs.length >= 5) score += 15;
  if (bag.clubs.length >= 10) score += 10;
  return Math.min(score, 100);
}

function scoreSwingVideo(input: FittingEngineInput): number {
  const count = input.swingVideoCount ?? 0;
  if (count === 0) return 0;
  if (count === 1) return 50;
  return 100;
}

function calculateWeightedScore(subscores: Record<string, number>): number {
  return Math.round(
    subscores.launchMonitor * WEIGHTS.launchMonitor +
    subscores.distanceMatrix * WEIGHTS.distanceMatrix +
    subscores.tendencies * WEIGHTS.tendencies +
    subscores.physicalMeasurements * WEIGHTS.physicalMeasurements +
    subscores.currentEquipment * WEIGHTS.currentEquipment +
    subscores.swingVideo * WEIGHTS.swingVideo
  );
}

// ============================================================
// PER-CATEGORY CONFIDENCE
// ============================================================

function calculateDriverConfidence(input: FittingEngineInput, subscores: Record<string, number>): number {
  const lm = input.launchMonitor;
  let score = 0;

  if (lm?.driverData?.clubSpeed) score += 30;
  else if (subscores.distanceMatrix > 30) score += 15;
  else if (input.profile.handicap !== undefined) score += 8;

  if (lm?.driverData?.launchAngle) score += 20;
  if (lm?.driverData?.spinRate) score += 20;
  if (lm?.driverData?.attackAngle !== undefined) score += 10;
  if (input.tendencies?.typicalMiss) score += 10;
  if (input.tendencies?.strikePattern) score += 5;
  if (input.swingVideoCount) score += 5;

  return Math.min(score, 100);
}

function calculateIronConfidence(input: FittingEngineInput, subscores: Record<string, number>): number {
  let score = 0;
  const lm = input.launchMonitor;

  if (lm?.ironData?.clubSpeed) score += 25;
  else if (subscores.distanceMatrix > 40) score += 15;
  else if (input.profile.handicap !== undefined) score += 8;

  if (lm?.ironData?.launchAngle) score += 15;
  if (lm?.ironData?.spinRate) score += 15;
  if (input.profile.heightCm) score += 15;
  if (input.profile.wristToFloorCm) score += 15;
  if (input.tendencies?.strikePattern) score += 10;
  if (subscores.distanceMatrix > 60) score += 5;

  return Math.min(score, 100);
}

function calculateWedgeConfidence(input: FittingEngineInput, subscores: Record<string, number>): number {
  let score = 0;
  const dm = input.distanceMatrix;

  if (dm?.pitchingWedge) score += 20;
  if (dm?.gapWedge) score += 20;
  if (dm?.sandWedge) score += 20;
  if (dm?.lobWedge) score += 15;
  if (input.currentBag?.clubs?.some((c) => c.category === "wedge")) score += 15;
  if (input.tendencies?.shortGameNotes) score += 10;

  return Math.min(score, 100);
}

function calculateShaftConfidence(input: FittingEngineInput): number {
  let score = 0;
  const lm = input.launchMonitor;

  if (lm?.driverData?.clubSpeed) score += 35;
  else if (input.distanceMatrix?.driver) score += 20;

  if (lm?.driverData?.spinRate) score += 20;
  if (lm?.driverData?.launchAngle) score += 15;
  if (lm?.ironData?.clubSpeed) score += 15;
  if (input.tendencies?.typicalMiss) score += 10;
  if (input.swingVideoCount) score += 5;

  return Math.min(score, 100);
}

function calculateLieLengthConfidence(input: FittingEngineInput): number {
  let score = 0;
  if (input.profile.wristToFloorCm) score += 60;
  if (input.profile.heightCm) score += 30;
  if (input.tendencies?.strikePattern === "heel" || input.tendencies?.strikePattern === "toe") score += 10;
  return Math.min(score, 100);
}

function calculateBagGappingConfidence(input: FittingEngineInput): number {
  const dm = input.distanceMatrix;
  if (!dm) return 0;

  const fields: (keyof typeof dm)[] = [
    "driver", "threeWood", "fiveWood", "hybrid", "fiveIron", "sixIron",
    "sevenIron", "eightIron", "nineIron", "pitchingWedge", "gapWedge",
    "sandWedge",
  ];
  const filled = fields.filter((f) => dm[f] && (dm[f] as number) > 0).length;
  return Math.round((filled / fields.length) * 100);
}

// ============================================================
// MISSING DATA & IMPROVEMENT TIPS
// ============================================================

function getMissingDataForDriver(input: FittingEngineInput): string[] {
  const missing: string[] = [];
  if (!input.launchMonitor?.driverData?.clubSpeed) missing.push("Driver club speed");
  if (!input.launchMonitor?.driverData?.launchAngle) missing.push("Launch angle");
  if (!input.launchMonitor?.driverData?.spinRate) missing.push("Spin rate");
  if (!input.launchMonitor?.driverData?.attackAngle) missing.push("Attack angle");
  if (!input.tendencies?.typicalMiss) missing.push("Typical miss direction");
  if (!input.swingVideoCount) missing.push("Swing video");
  return missing;
}

function getMissingDataForIrons(input: FittingEngineInput): string[] {
  const missing: string[] = [];
  if (!input.launchMonitor?.ironData?.clubSpeed) missing.push("Iron club speed");
  if (!input.profile.wristToFloorCm) missing.push("Wrist-to-floor measurement");
  if (!input.tendencies?.strikePattern) missing.push("Strike pattern");
  return missing;
}

function getMissingDataForWedges(input: FittingEngineInput): string[] {
  const missing: string[] = [];
  const dm = input.distanceMatrix;
  if (!dm?.pitchingWedge) missing.push("Pitching wedge distance");
  if (!dm?.gapWedge) missing.push("Gap wedge distance");
  if (!dm?.sandWedge) missing.push("Sand wedge distance");
  if (!dm?.lobWedge) missing.push("Lob wedge distance");
  return missing;
}

// ============================================================
// BUILD DETAIL OBJECTS
// ============================================================

function buildDetail(
  score: number,
  explanation: string,
  missingData: string[],
  improvementTips: string[]
): ConfidenceDetail {
  return {
    score,
    tier: getConfidenceTier(score),
    explanation,
    missingData,
    improvementTips,
  };
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function calculateConfidence(input: FittingEngineInput): FullConfidenceReport {
  const subscores = {
    launchMonitor: scoreLaunchMonitor(input),
    distanceMatrix: scoreDistanceMatrix(input),
    tendencies: scoreTendencies(input),
    physicalMeasurements: scorePhysicalMeasurements(input),
    currentEquipment: scoreCurrentEquipment(input),
    swingVideo: scoreSwingVideo(input),
  };

  const overallScore = calculateWeightedScore(subscores);
  const driverScore = calculateDriverConfidence(input, subscores);
  const ironScore = calculateIronConfidence(input, subscores);
  const wedgeScore = calculateWedgeConfidence(input, subscores);
  const shaftScore = calculateShaftConfidence(input);
  const lieLengthScore = calculateLieLengthConfidence(input);
  const bagGapScore = calculateBagGappingConfidence(input);
  const productScore = Math.round((driverScore + ironScore + wedgeScore) / 3);

  const hasLaunchMonitor = !!input.launchMonitor?.driverData?.clubSpeed;
  const hasFullDistances = subscores.distanceMatrix > 70;

  return {
    overall: buildDetail(
      overallScore,
      `Overall fitting confidence is ${getConfidenceTier(overallScore).replace("_", " ")} based on the data provided. ${
        hasLaunchMonitor
          ? "Launch monitor data significantly improves recommendation accuracy."
          : "Adding launch monitor data would substantially improve confidence."
      }`,
      [
        ...(!input.launchMonitor?.driverData?.clubSpeed ? ["Launch monitor data"] : []),
        ...(!hasFullDistances ? ["Complete distance matrix"] : []),
        ...(!input.swingVideoCount ? ["Swing video"] : []),
      ],
      [
        "Complete a TrackMan or GCQuad session for highest accuracy",
        "Provide swing video for AI analysis",
        "Ensure all carry distances are filled in",
      ]
    ),

    driver: buildDetail(
      driverScore,
      `Driver fit confidence is ${getConfidenceTier(driverScore).replace("_", " ")}. ${
        hasLaunchMonitor
          ? "Club speed, launch and spin data provided. "
          : "Estimated from distances and handicap. "
      }${input.tendencies?.typicalMiss ? `Miss tendency (${input.tendencies.typicalMiss}) factored in.` : ""}`,
      getMissingDataForDriver(input),
      [
        "Provide driver club speed from a launch monitor",
        "Record spin rate and launch angle for optimal loft matching",
        "Upload a face-on swing video for path analysis",
      ]
    ),

    irons: buildDetail(
      ironScore,
      `Iron fit confidence is ${getConfidenceTier(ironScore).replace("_", " ")}. ${
        input.profile.wristToFloorCm
          ? "Physical measurements enable precise length and lie fitting. "
          : "Height-based estimation used for length fitting. "
      }`,
      getMissingDataForIrons(input),
      [
        "Measure wrist-to-floor distance for accurate length fitting",
        "Provide a 7-iron club speed from launch monitor",
        "Note your typical strike pattern (heel/toe/center)",
      ]
    ),

    wedges: buildDetail(
      wedgeScore,
      `Wedge fit confidence is ${getConfidenceTier(wedgeScore).replace("_", " ")}. ${
        subscores.distanceMatrix > 50
          ? "Distance matrix used to identify scoring gaps."
          : "Limited distance data available for gap analysis."
      }`,
      getMissingDataForWedges(input),
      [
        "Enter all short iron and wedge carry distances",
        "Note your typical course conditions (soft/firm/mixed)",
        "Describe any short game frustrations",
      ]
    ),

    shaft: buildDetail(
      shaftScore,
      `Shaft fit confidence is ${getConfidenceTier(shaftScore).replace("_", " ")}. ${
        hasLaunchMonitor
          ? "Club speed and spin data provide strong shaft matching accuracy."
          : "Estimated from distance data. Launch monitor data recommended."
      }`,
      [
        ...(!input.launchMonitor?.driverData?.clubSpeed ? ["Driver club speed"] : []),
        ...(!input.launchMonitor?.driverData?.spinRate ? ["Spin rate"] : []),
      ],
      [
        "Provide club speed for accurate flex matching",
        "Spin rate data helps identify low/mid/high launch shaft profiles",
      ]
    ),

    lieLength: buildDetail(
      lieLengthScore,
      `Lie and length confidence is ${getConfidenceTier(lieLengthScore).replace("_", " ")}. ${
        input.profile.wristToFloorCm
          ? "Wrist-to-floor measurement provided — high accuracy fitting."
          : "Using height as primary measurement. Wrist-to-floor will improve accuracy."
      }`,
      [...(!input.profile.wristToFloorCm ? ["Wrist-to-floor measurement"] : [])],
      [
        "Measure wrist-to-floor distance (stand upright, arms at sides, measure from wrist crease to floor)",
        "An in-person lie board fitting will confirm the recommendation",
      ]
    ),

    bagGapping: buildDetail(
      bagGapScore,
      `Bag gapping confidence is ${getConfidenceTier(bagGapScore).replace("_", " ")}. ${
        bagGapScore > 70
          ? "Full distance matrix enables comprehensive gap analysis."
          : "Partial distance data limits gap analysis accuracy."
      }`,
      getMissingDataForWedges(input),
      [
        "Enter every club's carry distance for a complete gap analysis",
        "Include fairway wood and hybrid distances",
      ]
    ),

    productRecommendation: buildDetail(
      productScore,
      `Product recommendation confidence is ${getConfidenceTier(productScore).replace("_", " ")}. Recommendations are based on fitting parameters derived from your data.`,
      [],
      [
        "Higher confidence fitting data improves product matching accuracy",
        "Inventory matching improves when retailers upload full product specs",
      ]
    ),
  };
}

export function confidenceScoresFromReport(report: FullConfidenceReport): ConfidenceScores {
  return {
    overall: report.overall.score,
    driver: report.driver.score,
    irons: report.irons.score,
    wedges: report.wedges.score,
    shaft: report.shaft.score,
    lieLength: report.lieLength.score,
    bagGapping: report.bagGapping.score,
    productRecommendation: report.productRecommendation.score,
  };
}
