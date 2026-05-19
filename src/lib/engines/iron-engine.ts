import type {
  FittingEngineInput,
  IronRecommendation,
  IronCategory,
  ShaftFlex,
  ProductRec,
  ShaftRec,
} from "@/types/fitting";

// ============================================================
// IRON CATEGORY
// ============================================================

export function determineIronCategory(
  handicap: number,
  strikePattern?: string,
  ballFlight?: string
): { category: IronCategory; label: string } {
  const isConsistentStriker = strikePattern === "center";
  const isInconsistent = strikePattern === "heel" || strikePattern === "toe" || strikePattern === "thin" || strikePattern === "fat";

  if (handicap <= 3 && !isInconsistent) {
    return { category: "muscle_back", label: "Muscle Back Blade" };
  }
  if (handicap <= 7 && isConsistentStriker) {
    return { category: "players_cavity", label: "Players Cavity Back" };
  }
  if (handicap <= 7) {
    return { category: "players_cavity", label: "Players Cavity Back" };
  }
  if (handicap <= 14) {
    return { category: "players_distance", label: "Players Distance" };
  }
  if (handicap <= 24) {
    return { category: "game_improvement", label: "Game Improvement" };
  }
  return { category: "super_game_improvement", label: "Super Game Improvement" };
}

// ============================================================
// IRON SHAFT FLEX
// ============================================================

function determineIronFlex(
  ironClubSpeedMph?: number,
  driverClubSpeedMph?: number,
  sevenIronDistance?: number,
  handicap?: number
): ShaftFlex {
  // 7-iron speed is ~70-75% of driver speed
  const ironSpeed = ironClubSpeedMph ?? (driverClubSpeedMph ? driverClubSpeedMph * 0.72 : undefined);

  if (ironSpeed) {
    if (ironSpeed >= 95)  return "x_stiff";
    if (ironSpeed >= 85)  return "stiff";
    if (ironSpeed >= 75)  return "regular";
    if (ironSpeed >= 65)  return "senior";
    return "ladies";
  }

  if (sevenIronDistance) {
    if (sevenIronDistance >= 185) return "x_stiff";
    if (sevenIronDistance >= 170) return "stiff";
    if (sevenIronDistance >= 155) return "regular";
    if (sevenIronDistance >= 135) return "senior";
    return "ladies";
  }

  if (handicap !== undefined) {
    if (handicap <= 5)  return "stiff";
    if (handicap <= 15) return "regular";
    if (handicap <= 25) return "senior";
    return "ladies";
  }

  return "regular";
}

// ============================================================
// SHAFT TYPE (STEEL vs GRAPHITE)
// ============================================================

function determineShaftType(
  ironSpeed?: number,
  driverSpeed?: number,
  age?: number,
  handicap?: number
): "steel" | "graphite" {
  const speed = ironSpeed ?? (driverSpeed ? driverSpeed * 0.72 : undefined);

  if (speed && speed < 70) return "graphite";
  if (age && age >= 65) return "graphite";
  if (handicap && handicap >= 28) return "graphite";
  return "steel";
}

// ============================================================
// LENGTH ADJUSTMENT (Wrist-to-Floor Method)
// ============================================================

export function determineLengthAdjustment(
  wristToFloorCm?: number,
  heightCm?: number
): { adjustment: string; adjustmentInches: number } {
  let wtf = wristToFloorCm;

  if (!wtf && heightCm) {
    // Estimate wrist-to-floor from height: approximation
    wtf = heightCm * 0.455;
  }

  if (!wtf) return { adjustment: "Standard length", adjustmentInches: 0 };

  const wtfInches = wtf / 2.54;

  if (wtfInches < 27)   return { adjustment: "-1.5 inches below standard", adjustmentInches: -1.5 };
  if (wtfInches < 29)   return { adjustment: "-1 inch below standard", adjustmentInches: -1 };
  if (wtfInches < 31)   return { adjustment: "-0.5 inches below standard", adjustmentInches: -0.5 };
  if (wtfInches <= 33)  return { adjustment: "Standard length", adjustmentInches: 0 };
  if (wtfInches <= 35)  return { adjustment: "+0.5 inches over standard", adjustmentInches: 0.5 };
  if (wtfInches <= 37)  return { adjustment: "+1 inch over standard", adjustmentInches: 1 };
  return { adjustment: "+1.5 inches over standard", adjustmentInches: 1.5 };
}

// ============================================================
// LIE ANGLE ADJUSTMENT
// ============================================================

function determineLieAdjustment(
  strikePattern?: string,
  heightCm?: number,
  wristToFloorCm?: number
): { adjustment: string; degrees: number } {
  // Strike-based adjustment
  if (strikePattern === "toe") {
    return { adjustment: "+2° flat (upright)", degrees: 2 };
  }
  if (strikePattern === "heel") {
    return { adjustment: "-2° upright (flat)", degrees: -2 };
  }

  // Height/WTF-based adjustment
  const heightInches = heightCm ? heightCm / 2.54 : undefined;
  if (heightInches) {
    if (heightInches > 76)   return { adjustment: "+2° upright", degrees: 2 };
    if (heightInches > 73)   return { adjustment: "+1° upright", degrees: 1 };
    if (heightInches >= 68)  return { adjustment: "Standard lie angle", degrees: 0 };
    if (heightInches >= 65)  return { adjustment: "-1° flat", degrees: -1 };
    return { adjustment: "-2° flat", degrees: -2 };
  }

  return { adjustment: "Standard lie angle", degrees: 0 };
}

// ============================================================
// SHAFT WEIGHT FOR IRONS
// ============================================================

function determineIronShaftWeight(
  ironSpeed?: number,
  driverSpeed?: number,
  shaftType?: "steel" | "graphite"
): string {
  const speed = ironSpeed ?? (driverSpeed ? driverSpeed * 0.72 : undefined);

  if (shaftType === "graphite") {
    if (!speed || speed < 60) return "55-65g (ultralight graphite)";
    if (speed < 70)           return "65-75g (light graphite)";
    if (speed < 80)           return "75-85g (mid graphite)";
    return "85-95g (tour graphite)";
  }

  // Steel
  if (!speed || speed < 70)  return "85-95g (light steel)";
  if (speed < 80)            return "100-110g (standard steel)";
  if (speed < 90)            return "110-120g (heavy steel)";
  return "120-130g (tour steel)";
}

// ============================================================
// IRON SHAFT OPTIONS
// ============================================================

function buildIronShaftOptions(
  flex: ShaftFlex,
  shaftType: "steel" | "graphite",
  handicap: number
): ShaftRec[] {
  const shafts: ShaftRec[] = [];

  if (shaftType === "steel") {
    shafts.push({
      name: "KBS Tour",
      manufacturer: "KBS",
      weight: "120g",
      flex,
      profile: "mid",
      spin: "mid",
      tier: "premium",
      suitedFor: "Players wanting low penetrating flight and exceptional feel",
      confidence: 90,
    });
    shafts.push({
      name: "True Temper Dynamic Gold",
      manufacturer: "True Temper",
      weight: "125g",
      flex,
      profile: "low",
      spin: "low",
      tier: "mid",
      suitedFor: "Tour-proven steel shaft with decades of professional use",
      confidence: 87,
    });
    if (handicap >= 10) {
      shafts.push({
        name: "Nippon NS Pro Modus3 Tour 105",
        manufacturer: "Nippon",
        weight: "105g",
        flex,
        profile: "mid",
        spin: "mid",
        tier: "premium",
        suitedFor: "Mid-weight steel offering feel of tour shaft at lighter weight",
        confidence: 85,
      });
    }
  } else {
    shafts.push({
      name: "Mitsubishi MMT",
      manufacturer: "Mitsubishi Chemical",
      weight: "75g",
      flex,
      profile: "mid",
      spin: "mid",
      tier: "premium",
      suitedFor: "Multi-material graphite with steel-like feel and reduced vibration",
      confidence: 88,
    });
    shafts.push({
      name: "UST Recoil 760",
      manufacturer: "UST Mamiya",
      weight: "70g",
      flex,
      profile: "mid",
      spin: "mid",
      tier: "mid",
      suitedFor: "Smooth loading graphite ideal for moderate swing speeds",
      confidence: 84,
    });
    shafts.push({
      name: "Aldila Rogue White",
      manufacturer: "Aldila",
      weight: "80g",
      flex,
      profile: "high",
      spin: "high",
      tier: "mid",
      suitedFor: "High-launch graphite for seniors and slower swing speeds",
      confidence: 82,
    });
  }

  return shafts;
}

// ============================================================
// PRODUCT RECOMMENDATIONS
// ============================================================

function buildIronRecommendations(
  category: IronCategory,
  flex: ShaftFlex,
  confidence: number
): ProductRec[] {
  const recs: ProductRec[] = [];

  if (category === "muscle_back") {
    recs.push({
      brand: "Titleist",
      model: "T100",
      category: "Irons",
      specs: { type: "Players Cavity", material: "Forged 1025 Carbon Steel" },
      msrp: 1599,
      reasoning: "The T100 offers the workability and feel demanded by low handicappers with a thin topline and minimal offset.",
      confidence,
      matchType: "exact",
    });
    recs.push({
      brand: "Mizuno",
      model: "JPX925 Forged",
      category: "Irons",
      specs: { type: "Players Forged", material: "4140 Chromoly" },
      msrp: 1399,
      reasoning: "Mizuno's legendary grain flow forging delivers unmatched feel for ball strikers who demand feedback.",
      confidence: confidence - 3,
      matchType: "exact",
    });
  } else if (category === "players_cavity") {
    recs.push({
      brand: "Titleist",
      model: "T150",
      category: "Irons",
      specs: { type: "Players Cavity Back", material: "Forged" },
      msrp: 1549,
      reasoning: "The T150 blends player-level feel and workability with a forgiving cavity back — the ideal club for single-figure golfers.",
      confidence,
      matchType: "exact",
    });
    recs.push({
      brand: "TaylorMade",
      model: "P790",
      category: "Irons",
      specs: { type: "Players Distance", technology: "SpeedFoam Air" },
      msrp: 1499,
      reasoning: "P790's hollow-body construction delivers exceptional ball speed while retaining the compact player's look.",
      confidence: confidence - 2,
      matchType: "exact",
    });
  } else if (category === "players_distance") {
    recs.push({
      brand: "TaylorMade",
      model: "P790",
      category: "Irons",
      specs: { type: "Players Distance", technology: "SpeedFoam Air" },
      msrp: 1499,
      reasoning: "The P790 offers the best combination of speed, distance and player aesthetics in its category.",
      confidence,
      matchType: "exact",
    });
    recs.push({
      brand: "Callaway",
      model: "Apex",
      category: "Irons",
      specs: { type: "Players Distance", technology: "Forged 1025" },
      msrp: 1349,
      reasoning: "Callaway Apex delivers consistent distance and workability, suitable for players transitioning from GI to players irons.",
      confidence: confidence - 3,
      matchType: "exact",
    });
  } else if (category === "game_improvement") {
    recs.push({
      brand: "Ping",
      model: "G730",
      category: "Irons",
      specs: { type: "Game Improvement", technology: "Variable Face Thickness" },
      msrp: 1199,
      reasoning: "Ping's G730 delivers the largest sweet spot in the lineup with consistent distance and high launch.",
      confidence,
      matchType: "exact",
    });
    recs.push({
      brand: "TaylorMade",
      model: "Qi35 Max",
      category: "Irons",
      specs: { type: "Max Game Improvement", technology: "Qi AI Face" },
      msrp: 1249,
      reasoning: "The Qi35 Max irons use AI-optimised faces to maximise ball speed across a wide hitting area.",
      confidence: confidence - 2,
      matchType: "exact",
    });
  } else {
    recs.push({
      brand: "Callaway",
      model: "Big Bertha B21",
      category: "Irons",
      specs: { type: "Super Game Improvement", technology: "Wide Sole, High Launch" },
      msrp: 1099,
      reasoning: "Big Bertha B21 is designed to launch high and straight with extreme forgiveness for developing golfers.",
      confidence,
      matchType: "exact",
    });
    recs.push({
      brand: "Cleveland",
      model: "Launcher XL Halo",
      category: "Irons",
      specs: { type: "Super Game Improvement", technology: "Hollow Body, Halo Design" },
      msrp: 849,
      reasoning: "Launcher XL Halo irons deliver exceptional launch and distance at a competitive price point.",
      confidence: confidence - 5,
      matchType: "close",
    });
  }

  return recs;
}

// ============================================================
// MAIN ENGINE
// ============================================================

export function runIronEngine(input: FittingEngineInput): IronRecommendation {
  const p = input.profile;
  const t = input.tendencies;
  const lm = input.launchMonitor;

  const { category, label: categoryLabel } = determineIronCategory(
    p.handicap,
    t?.strikePattern,
    t?.ballFlight
  );

  const flex = determineIronFlex(
    lm?.ironData?.clubSpeed,
    lm?.driverData?.clubSpeed,
    input.distanceMatrix?.sevenIron,
    p.handicap
  );

  const shaftType = determineShaftType(
    lm?.ironData?.clubSpeed,
    lm?.driverData?.clubSpeed,
    p.age,
    p.handicap
  );

  const shaftWeight = determineIronShaftWeight(
    lm?.ironData?.clubSpeed,
    lm?.driverData?.clubSpeed,
    shaftType
  );

  const { adjustment: lengthAdjustment } = determineLengthAdjustment(p.wristToFloorCm, p.heightCm);
  const { adjustment: lieAdjustment, degrees: lieAdjDeg } = determineLieAdjustment(t?.strikePattern, p.heightCm, p.wristToFloorCm);

  const loftAdjustment =
    lieAdjDeg === 0
      ? "Standard loft"
      : lieAdjDeg > 0
      ? `+${lieAdjDeg}° upright (may affect loft)`
      : `${lieAdjDeg}° flat (may affect loft)`;

  const setComposition = p.handicap <= 10
    ? "4-PW (or 5-PW if long irons feel difficult)"
    : p.handicap <= 20
    ? "5-PW + AW"
    : "5-PW or 6-PW + AW";

  const shaftOptions = buildIronShaftOptions(flex, shaftType, p.handicap);
  const confidence = 78;
  const recommendedProducts = buildIronRecommendations(category, flex, confidence);

  const reasoning: string[] = [
    `Handicap of ${p.handicap} and ${t?.strikePattern ? `${t.strikePattern} strike pattern` : "available data"} indicate ${categoryLabel} irons.`,
    `${shaftType === "steel" ? "Steel" : "Graphite"} shafts in ${flex.replace("_", "-")} flex recommended based on swing speed profile.`,
    `${lengthAdjustment} based on ${p.wristToFloorCm ? "wrist-to-floor" : "height"} measurement.`,
    `${lieAdjustment} recommendation based on ${t?.strikePattern ? `${t.strikePattern} strike pattern` : "physical measurements"}.`,
  ];

  return {
    category,
    categoryLabel,
    flex,
    shaftType,
    shaftWeight,
    shaftProfile: "mid",
    lengthAdjustment,
    loftAdjustment,
    lieAdjustment,
    setComposition,
    recommendedProducts,
    shaftOptions,
    reasoning,
  };
}
