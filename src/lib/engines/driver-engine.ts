import type {
  FittingEngineInput,
  DriverRecommendation,
  ShaftFlex,
  ProductRec,
  ShaftRec,
} from "@/types/fitting";

// ============================================================
// SHAFT FLEX DETERMINATION
// ============================================================

export function determineShaftFlex(
  clubSpeedMph?: number,
  handicap?: number,
  distanceYards?: number
): ShaftFlex {
  // Prioritise measured club speed
  if (clubSpeedMph) {
    if (clubSpeedMph >= 110) return "tour_x";
    if (clubSpeedMph >= 100) return "x_stiff";
    if (clubSpeedMph >= 90)  return "stiff";
    if (clubSpeedMph >= 78)  return "regular";
    if (clubSpeedMph >= 65)  return "senior";
    return "ladies";
  }

  // Estimate from driver distance
  if (distanceYards) {
    if (distanceYards >= 280) return "x_stiff";
    if (distanceYards >= 250) return "stiff";
    if (distanceYards >= 220) return "regular";
    if (distanceYards >= 190) return "senior";
    return "ladies";
  }

  // Estimate from handicap
  if (handicap !== undefined) {
    if (handicap <= 3)  return "x_stiff";
    if (handicap <= 8)  return "stiff";
    if (handicap <= 18) return "regular";
    if (handicap <= 28) return "senior";
    return "ladies";
  }

  return "regular";
}

// ============================================================
// SHAFT WEIGHT
// ============================================================

function determineShaftWeight(clubSpeed?: number): string {
  if (!clubSpeed) return "55-65g";
  if (clubSpeed >= 105) return "65-80g";
  if (clubSpeed >= 95)  return "65-75g";
  if (clubSpeed >= 85)  return "55-65g";
  if (clubSpeed >= 72)  return "45-55g";
  return "40-50g";
}

// ============================================================
// DRIVER LOFT
// ============================================================

function determineDriverLoft(
  clubSpeed?: number,
  launchAngle?: number,
  spinRate?: number,
  attackAngle?: number,
  handicap?: number,
  driverDistance?: number
): { loft: number; loftRange: string } {
  let baseLoft: number;

  if (clubSpeed) {
    if (clubSpeed >= 110) baseLoft = 8.5;
    else if (clubSpeed >= 105) baseLoft = 9.0;
    else if (clubSpeed >= 100) baseLoft = 9.5;
    else if (clubSpeed >= 95)  baseLoft = 10.0;
    else if (clubSpeed >= 88)  baseLoft = 10.5;
    else if (clubSpeed >= 80)  baseLoft = 11.0;
    else if (clubSpeed >= 72)  baseLoft = 12.0;
    else baseLoft = 13.0;
  } else if (driverDistance) {
    if (driverDistance >= 280) baseLoft = 9.0;
    else if (driverDistance >= 250) baseLoft = 10.0;
    else if (driverDistance >= 220) baseLoft = 11.0;
    else baseLoft = 12.5;
  } else {
    baseLoft = handicap && handicap <= 10 ? 10.5 : 12.0;
  }

  // Attack angle correction: steep downward = add loft
  if (attackAngle !== undefined) {
    if (attackAngle < -5) baseLoft += 1.5;
    else if (attackAngle < -2) baseLoft += 0.5;
    else if (attackAngle > 3) baseLoft -= 0.5;
    else if (attackAngle > 5) baseLoft -= 1.0;
  }

  // Launch angle correction: too low = add loft
  if (launchAngle !== undefined) {
    const targetLaunch = clubSpeed ? Math.max(10, 17 - (clubSpeed - 80) * 0.15) : 12;
    if (launchAngle < targetLaunch - 3) baseLoft += 1.0;
    else if (launchAngle > targetLaunch + 3) baseLoft -= 0.5;
  }

  // Spin correction: very high spin = lower loft to reduce spin
  if (spinRate !== undefined) {
    const targetSpin = clubSpeed ? Math.max(2200, 3000 - (clubSpeed - 80) * 20) : 2600;
    if (spinRate > targetSpin + 700) baseLoft -= 0.5;
    else if (spinRate < targetSpin - 700) baseLoft += 0.5;
  }

  baseLoft = Math.round(baseLoft * 2) / 2; // Round to nearest 0.5
  const low = baseLoft - 0.5;
  const high = baseLoft + 0.5;

  return {
    loft: baseLoft,
    loftRange: `${low}°–${high}°`,
  };
}

// ============================================================
// HEAD STYLE
// ============================================================

function determineHeadStyle(
  typicalMiss?: string,
  strikePattern?: string,
  spinRate?: number,
  handicap?: number
): { headStyle: DriverRecommendation["headStyle"]; headStyleLabel: string } {
  const isSlice = typicalMiss === "slice" || typicalMiss === "push_fade";
  const isHighSpin = spinRate && spinRate > 3200;
  const isLowHandicap = handicap !== undefined && handicap <= 7;

  if (isLowHandicap && isHighSpin) {
    return { headStyle: "low_spin", headStyleLabel: "Low-Spin Tour Shape" };
  }
  if (isSlice) {
    return { headStyle: "draw_bias", headStyleLabel: "Draw-Bias / High-MOI" };
  }
  if (handicap === undefined || handicap >= 18) {
    return { headStyle: "max_forgiveness", headStyleLabel: "Maximum Forgiveness" };
  }
  if (isHighSpin) {
    return { headStyle: "low_spin", headStyleLabel: "Low-Spin" };
  }
  return { headStyle: "neutral", headStyleLabel: "Neutral / All-Round" };
}

// ============================================================
// SHAFT LAUNCH/SPIN PROFILE
// ============================================================

function determineShaftProfile(
  launchAngle?: number,
  spinRate?: number,
  clubSpeed?: number
): { profile: ShaftRec["profile"]; spin: ShaftRec["spin"] } {
  let profile: ShaftRec["profile"] = "mid";
  let spin: ShaftRec["spin"] = "mid";

  if (launchAngle !== undefined && clubSpeed) {
    const targetLaunch = Math.max(10, 17 - (clubSpeed - 80) * 0.15);
    if (launchAngle < targetLaunch - 3) profile = "high";
    else if (launchAngle > targetLaunch + 3) profile = "low";
  }

  if (spinRate) {
    if (spinRate > 3000) spin = "low";
    else if (spinRate < 2300) spin = "high";
  }

  return { profile, spin };
}

// ============================================================
// SHAFT RECOMMENDATIONS
// ============================================================

function buildShaftOptions(
  flex: ShaftFlex,
  weight: string,
  profile: ShaftRec["profile"],
  spin: ShaftRec["spin"]
): ShaftRec[] {
  const shafts: ShaftRec[] = [];

  // Premium tier
  if (flex === "x_stiff" || flex === "stiff" || flex === "tour_x") {
    shafts.push({
      name: spin === "low" ? "Fujikura Ventus Black" : profile === "high" ? "Fujikura Ventus Red" : "Fujikura Ventus Blue",
      manufacturer: "Fujikura",
      weight: flex === "x_stiff" || flex === "tour_x" ? "70-75g" : "60-65g",
      flex,
      profile,
      spin,
      torque: "3.0°",
      tier: "premium",
      suitedFor: "Mid-to-fast swing speeds, stable penetrating flight",
      confidence: 92,
    });
    shafts.push({
      name: "HZRDUS Smoke Black RDX",
      manufacturer: "Project X",
      weight: "70g",
      flex,
      profile: "low",
      spin: "low",
      torque: "2.8°",
      tier: "premium",
      suitedFor: "Fast swingers wanting low spin and penetrating flight",
      confidence: 88,
    });
  }

  if (flex === "regular" || flex === "stiff") {
    shafts.push({
      name: profile === "high" ? "Mitsubishi TENSEI AV Orange" : "Mitsubishi TENSEI AV Blue",
      manufacturer: "Mitsubishi Chemical",
      weight: "65g",
      flex,
      profile,
      spin,
      torque: "3.5°",
      tier: "mid",
      suitedFor: "Mid swing speeds with balanced flight",
      confidence: 85,
    });
  }

  if (flex === "senior" || flex === "regular") {
    shafts.push({
      name: "UST Mamiya Helium Nanocore",
      manufacturer: "UST Mamiya",
      weight: "45-55g",
      flex,
      profile: "high",
      spin: "high",
      torque: "4.5°",
      tier: "mid",
      suitedFor: "Moderate swing speeds needing higher launch and carry",
      confidence: 82,
    });
  }

  if (flex === "ladies" || flex === "senior") {
    shafts.push({
      name: "Aldila NV 2KXV Blue",
      manufacturer: "Aldila",
      weight: "40-50g",
      flex,
      profile: "high",
      spin: "high",
      torque: "5.0°",
      tier: "mid",
      suitedFor: "Slower swing speeds needing maximum launch assistance",
      confidence: 80,
    });
  }

  // Always add a mid-range option
  shafts.push({
    name: "Graphite Design Tour AD DI",
    manufacturer: "Graphite Design",
    weight: "60-65g",
    flex,
    profile: "mid",
    spin: "mid",
    torque: "3.4°",
    tier: "premium",
    suitedFor: "Consistent mid-launch, excellent feedback",
    confidence: 86,
  });

  return shafts.slice(0, 3);
}

// ============================================================
// HEAD PRODUCT RECOMMENDATIONS
// ============================================================

function buildHeadRecommendations(
  headStyle: DriverRecommendation["headStyle"],
  loft: number,
  flex: ShaftFlex,
  confidence: number
): ProductRec[] {
  const loftStr = `${loft}°`;
  const recs: ProductRec[] = [];

  if (headStyle === "draw_bias" || headStyle === "max_forgiveness") {
    recs.push({
      brand: "Ping",
      model: "G440 Max",
      category: "Driver",
      loft: loftStr,
      specs: { forgiveness: "Maximum", weight: "460cc", technology: "Carbonfly Wrap" },
      msrp: 649,
      reasoning: `The Ping G440 Max's high-MOI design and Carbonfly carbon crown reduce your slice and maximise distance on off-centre strikes.`,
      confidence: confidence,
      matchType: "exact",
    });
    recs.push({
      brand: "TaylorMade",
      model: "Qi35 Max",
      category: "Driver",
      loft: loftStr,
      specs: { forgiveness: "Maximum", weight: "460cc", technology: "Qi AI Speed Pocket" },
      msrp: 649,
      reasoning: `The Qi35 Max's draw-bias internal weighting promotes a right-to-left ball flight, correcting your push-fade tendency.`,
      confidence: confidence - 3,
      matchType: "exact",
    });
    if (headStyle === "max_forgiveness") {
      recs.push({
        brand: "Callaway",
        model: "Paradym Ai Smoke Max",
        category: "Driver",
        loft: loftStr,
        specs: { forgiveness: "Maximum", technology: "Ai Smart Face" },
        msrp: 599,
        reasoning: `Callaway's AI-designed face optimises ball speed across the entire face, ideal for inconsistent strike patterns.`,
        confidence: confidence - 5,
        matchType: "close",
      });
    }
  } else if (headStyle === "low_spin") {
    recs.push({
      brand: "TaylorMade",
      model: "Qi35 LS",
      category: "Driver",
      loft: loftStr,
      specs: { forgiveness: "Tour", weight: "460cc", technology: "Low-Spin Inertia Generator" },
      msrp: 649,
      reasoning: `The Qi35 LS's forward CG placement reduces spin for faster swings needing tighter, more penetrating flight.`,
      confidence: confidence,
      matchType: "exact",
    });
    recs.push({
      brand: "Callaway",
      model: "Paradym Ai Smoke Triple Diamond",
      category: "Driver",
      loft: loftStr,
      specs: { forgiveness: "Tour", technology: "Triple Diamond Low-Spin" },
      msrp: 649,
      reasoning: `The Triple Diamond delivers lower launch and spin for high-speed players wanting a tighter, more workable flight.`,
      confidence: confidence - 4,
      matchType: "close",
    });
  } else {
    // Neutral
    recs.push({
      brand: "Titleist",
      model: "TSR2",
      category: "Driver",
      loft: loftStr,
      specs: { forgiveness: "Mid-High", technology: "Variable Face Thickness" },
      msrp: 649,
      reasoning: `The TSR2's neutral CG and responsive face deliver consistent performance across a range of handicaps.`,
      confidence: confidence,
      matchType: "exact",
    });
    recs.push({
      brand: "Ping",
      model: "G440 LST",
      category: "Driver",
      loft: loftStr,
      specs: { forgiveness: "Mid", technology: "LST Low Spin" },
      msrp: 599,
      reasoning: `The G440 LST offers lower spin than the Max while retaining Ping's forgiving head shape — ideal for players who want control without losing forgiveness.`,
      confidence: confidence - 3,
      matchType: "close",
    });
  }

  return recs;
}

// ============================================================
// SWING WEIGHT & LENGTH
// ============================================================

function determineSwingWeight(clubSpeed?: number): string {
  if (!clubSpeed) return "D2";
  if (clubSpeed >= 110) return "D4-D5";
  if (clubSpeed >= 100) return "D3-D4";
  if (clubSpeed >= 88)  return "D2-D3";
  if (clubSpeed >= 75)  return "D1-D2";
  return "C9-D1";
}

function determineDriverLength(heightCm?: number): string {
  if (!heightCm) return "45.5 inches (standard)";
  if (heightCm >= 193) return "46 inches (+0.5\")";
  if (heightCm >= 183) return "45.5 inches (standard)";
  if (heightCm >= 170) return "45 inches (-0.5\")";
  return "44.5 inches (-1\")";
}

// ============================================================
// REASONING BUILDER
// ============================================================

function buildReasoning(input: FittingEngineInput, flex: ShaftFlex, loft: number, headStyle: string): string[] {
  const reasons: string[] = [];
  const lm = input.launchMonitor;
  const t = input.tendencies;
  const p = input.profile;

  if (lm?.driverData?.clubSpeed) {
    reasons.push(`Club speed of ${lm.driverData.clubSpeed} mph indicates a ${flex.replace("_", "-")} shaft is optimal.`);
  } else {
    reasons.push(`Shaft flex estimated from ${p.handicap !== undefined ? `handicap of ${p.handicap}` : "available data"}.`);
  }

  if (lm?.driverData?.launchAngle) {
    reasons.push(`Current launch angle of ${lm.driverData.launchAngle}° — ${loft}° loft optimises launch conditions.`);
  }

  if (lm?.driverData?.spinRate) {
    const spinDesc = lm.driverData.spinRate > 3000 ? "high" : lm.driverData.spinRate < 2400 ? "low" : "optimal";
    reasons.push(`Spin rate of ${lm.driverData.spinRate} rpm is ${spinDesc} — head selection and shaft profile address this.`);
  }

  if (t?.typicalMiss) {
    const missLabel = t.typicalMiss.replace("_", " ");
    reasons.push(`${missLabel.charAt(0).toUpperCase() + missLabel.slice(1)} tendency drives the draw-biased head recommendation.`);
  }

  if (lm?.driverData?.attackAngle !== undefined) {
    const aaDesc = lm.driverData.attackAngle < 0 ? "descending" : "ascending";
    reasons.push(`${aaDesc} attack angle of ${Math.abs(lm.driverData.attackAngle).toFixed(1)}° factored into loft selection.`);
  }

  return reasons;
}

// ============================================================
// MAIN ENGINE
// ============================================================

export function runDriverEngine(input: FittingEngineInput): DriverRecommendation {
  const lm = input.launchMonitor?.driverData;
  const p = input.profile;
  const t = input.tendencies;

  const flex = determineShaftFlex(lm?.clubSpeed, p.handicap, input.distanceMatrix?.driver);
  const shaftWeight = determineShaftWeight(lm?.clubSpeed);
  const { loft, loftRange } = determineDriverLoft(
    lm?.clubSpeed,
    lm?.launchAngle,
    lm?.spinRate,
    lm?.attackAngle,
    p.handicap,
    input.distanceMatrix?.driver
  );
  const { headStyle, headStyleLabel } = determineHeadStyle(
    t?.typicalMiss,
    t?.strikePattern,
    lm?.spinRate,
    p.handicap
  );
  const { profile, spin } = determineShaftProfile(lm?.launchAngle, lm?.spinRate, lm?.clubSpeed);
  const swingWeight = determineSwingWeight(lm?.clubSpeed);
  const length = determineDriverLength(p.heightCm);
  const shaftOptions = buildShaftOptions(flex, shaftWeight, profile, spin);
  const confidence = 80;
  const recommendedProducts = buildHeadRecommendations(headStyle, loft, flex, confidence);
  const reasoning = buildReasoning(input, flex, loft, headStyle);

  const adjustmentNotes: string[] = [];
  if (lm?.attackAngle !== undefined && lm.attackAngle < -3) {
    adjustmentNotes.push("Consider teeing the ball higher and moving it forward in stance to improve attack angle.");
  }
  if (lm?.spinRate && lm.spinRate > 3500) {
    adjustmentNotes.push("High spin rate — check for equipment wear and ensure shaft is not too flexible.");
  }
  if (lm?.smashFactor && lm.smashFactor < 1.44) {
    adjustmentNotes.push(`Smash factor of ${lm.smashFactor} suggests off-centre contact — consider a face insert or impact tape assessment.`);
  }

  return {
    loft,
    loftRange,
    flex,
    shaftWeight,
    shaftProfile: profile,
    shaftSpin: spin,
    headStyle,
    headStyleLabel,
    swingWeight,
    length,
    recommendedProducts,
    shaftOptions,
    reasoning,
    adjustmentNotes,
  };
}
