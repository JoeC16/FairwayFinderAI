import type {
  FittingEngineInput,
  WedgeRecommendation,
  WedgeSetup,
  WedgeBounce,
  WedgeGrind,
  ProductRec,
} from "@/types/fitting";

// ============================================================
// WEDGE SETUP LOGIC
// ============================================================

function determineWedgeSetup(
  pitchingWedgeLoft: number | null,
  frustrations: string[]
): WedgeSetup[] {
  const needsMoreWedges = frustrations.some(
    (f) => f.toLowerCase().includes("wedge") || f.toLowerCase().includes("short game") || f.toLowerCase().includes("scoring")
  );

  // Standard PW lofts determine the rest of the set
  const pwLoft = pitchingWedgeLoft ?? 46;

  if (pwLoft <= 44) {
    // Strong-lofted modern PW
    return [
      { loft: 50, purpose: "Gap Wedge / Approach", bounce: "mid", bounceAngle: "10°", grind: "standard", grindLabel: "Standard (S Grind)" },
      { loft: 54, purpose: "Sand Wedge / Bunker", bounce: "mid", bounceAngle: "12°", grind: "m_grind", grindLabel: "Mid Grind (M Grind)" },
      { loft: 58, purpose: "Lob Wedge / Finesse", bounce: "low", bounceAngle: "8°", grind: "k_grind", grindLabel: "Low Grind (K Grind)" },
    ];
  } else if (pwLoft <= 47) {
    // Standard PW loft
    return [
      { loft: 52, purpose: "Gap Wedge / 100-yard club", bounce: "mid", bounceAngle: "10°", grind: "standard", grindLabel: "Standard (F Grind)" },
      { loft: 56, purpose: "Sand Wedge", bounce: "mid", bounceAngle: "12°", grind: "m_grind", grindLabel: "Mid Grind (M Grind)" },
      { loft: 60, purpose: "Lob Wedge", bounce: "low", bounceAngle: "8°", grind: "k_grind", grindLabel: "Low Grind (K Grind)" },
    ];
  } else {
    // High-lofted PW (older irons)
    return [
      { loft: 54, purpose: "Sand Wedge", bounce: "high", bounceAngle: "14°", grind: "standard", grindLabel: "Standard / Wide Sole" },
      { loft: 58, purpose: "Lob Wedge", bounce: "low", bounceAngle: "8°", grind: "k_grind", grindLabel: "Low Grind" },
    ];
  }
}

// ============================================================
// BOUNCE RECOMMENDATION
// ============================================================

function determineBounce(
  frustrations: string[],
  shotShape?: string,
  typicalMiss?: string
): WedgeBounce {
  const wantsMoreSpin = frustrations.some((f) => f.toLowerCase().includes("spin") || f.toLowerCase().includes("hold"));
  const steepSwing = typicalMiss === "fat" || typicalMiss === "pull";
  const shallowSwing = typicalMiss === "thin" || typicalMiss === "push";

  if (steepSwing) return "high";
  if (shallowSwing) return "low";
  return "mid";
}

// ============================================================
// GRIND RECOMMENDATION
// ============================================================

function determineGrind(
  bounce: WedgeBounce,
  typicalMiss?: string,
  shotShape?: string
): { grind: WedgeGrind; grindLabel: string } {
  if (typicalMiss === "fat") {
    return { grind: "s_grind", grindLabel: "S Grind (versatile, high bounce)" };
  }
  if (typicalMiss === "thin" || shotShape === "fade") {
    return { grind: "k_grind", grindLabel: "K Grind (low bounce, open face shots)" };
  }
  if (bounce === "high") {
    return { grind: "m_grind", grindLabel: "M Grind (full-face versatility)" };
  }
  return { grind: "standard", grindLabel: "Standard / F Grind (all-round)" };
}

// ============================================================
// GAP ISSUES
// ============================================================

function identifyGapIssues(
  setup: WedgeSetup[],
  pwLoft: number | null,
  distances: Partial<Record<string, number>>
): string[] {
  const issues: string[] = [];
  const pw = pwLoft ?? 46;

  if (setup.length > 0 && setup[0].loft - pw > 6) {
    issues.push(`Gap between PW (${pw}°) and gap wedge (${setup[0].loft}°) is ${setup[0].loft - pw}° — consider a ${pw + 4}° utility wedge.`);
  }

  const pwDist = distances.pitchingWedge;
  const gwDist = distances.gapWedge;
  const swDist = distances.sandWedge;
  const lwDist = distances.lobWedge;

  if (pwDist && gwDist && pwDist - gwDist > 25) {
    issues.push(`Large gap of ${pwDist - gwDist}y between PW (${pwDist}y) and GW (${gwDist}y). Adding an additional wedge would improve scoring.`);
  }
  if (gwDist && swDist && gwDist - swDist > 25) {
    issues.push(`Gap of ${gwDist - swDist}y between GW and SW. Current loft setup creates a distance hole.`);
  }
  if (swDist && lwDist && swDist - lwDist > 20) {
    issues.push(`SW to LW gap of ${swDist - lwDist}y. Adding a lob wedge or adjusting loft spread is recommended.`);
  }

  return issues;
}

// ============================================================
// PRODUCT RECOMMENDATIONS
// ============================================================

function buildWedgeRecommendations(
  bounce: WedgeBounce,
  grind: WedgeGrind,
  confidence: number
): ProductRec[] {
  const recs: ProductRec[] = [];

  recs.push({
    brand: "Titleist",
    model: "Vokey SM10",
    category: "Wedge",
    specs: {
      bounce: bounce === "high" ? "14°" : bounce === "low" ? "8°" : "10°",
      grind: grind.toUpperCase().replace("_", " "),
      finish: "Tour Chrome",
    },
    msrp: 179,
    reasoning: `Vokey SM10 offers the widest grind selection available, allowing precise customisation for your swing style and course conditions.`,
    confidence,
    matchType: "exact",
  });

  recs.push({
    brand: "Cleveland",
    model: "RTX 6 ZipCore",
    category: "Wedge",
    specs: {
      bounce: bounce === "high" ? "14°" : bounce === "low" ? "8°" : "10°",
      technology: "ZipCore, UltiZip Grooves",
    },
    msrp: 169,
    reasoning: `Cleveland RTX 6 ZipCore's variable face thickness technology adds spin even from difficult lies.`,
    confidence: confidence - 4,
    matchType: "exact",
  });

  recs.push({
    brand: "Callaway",
    model: "Jaws Raw",
    category: "Wedge",
    specs: {
      bounce: bounce === "high" ? "14°" : bounce === "low" ? "8°" : "10°",
      technology: "Raw Face for Maximum Spin",
    },
    msrp: 179,
    reasoning: `Jaws Raw's purposely uncoated face generates exceptional spin, especially in wet conditions.`,
    confidence: confidence - 6,
    matchType: "close",
  });

  return recs;
}

// ============================================================
// EXTRACT PW LOFT FROM BAG
// ============================================================

function extractPwLoft(input: FittingEngineInput): number | null {
  const pwClub = input.currentBag?.clubs?.find(
    (c) => c.category === "wedge" || (c.category === "iron_set" && c.loft && c.loft >= 44)
  );
  if (pwClub?.loft) return pwClub.loft;

  // Infer from iron set (standard PW lofts by iron type)
  const irons = input.currentBag?.clubs?.find((c) => c.category === "iron_set");
  if (irons?.model) {
    const model = irons.model.toLowerCase();
    if (model.includes("blade") || model.includes("mb") || model.includes("forged")) return 47;
    if (model.includes("game improvement") || model.includes("gi")) return 44;
  }

  return null;
}

// ============================================================
// MAIN ENGINE
// ============================================================

export function runWedgeEngine(input: FittingEngineInput): WedgeRecommendation {
  const t = input.tendencies;
  const dm = input.distanceMatrix;
  const frustrations = t?.frustrations ?? [];

  const pwLoft = extractPwLoft(input);
  const bounce = determineBounce(frustrations, t?.shotShape, t?.typicalMiss);
  const { grind, grindLabel } = determineGrind(bounce, t?.typicalMiss, t?.shotShape);
  const setup = determineWedgeSetup(pwLoft, frustrations);

  const gapIssues = identifyGapIssues(setup, pwLoft, {
    pitchingWedge: dm?.pitchingWedge,
    gapWedge: dm?.gapWedge,
    sandWedge: dm?.sandWedge,
    lobWedge: dm?.lobWedge,
  });

  const confidence = 75;
  const recommendedProducts = buildWedgeRecommendations(bounce, grind, confidence);

  const reasoning: string[] = [
    `Wedge setup of ${setup.map((s) => s.loft + "°").join("-")} provides optimal loft spacing from your pitching wedge.`,
    `${bounce === "high" ? "High" : bounce === "low" ? "Low" : "Mid"} bounce recommended — ${
      bounce === "high"
        ? "prevents digging for steep/aggressive swing styles"
        : bounce === "low"
        ? "enables creativity from tight lies and firm turf"
        : "versatile for mixed playing conditions"
    }.`,
    `${grindLabel} suits your swing and typical course conditions.`,
    ...gapIssues,
  ];

  return {
    setup,
    numberOfWedges: setup.length,
    bounce,
    primaryGrind: grind,
    recommendedProducts,
    gapIssues,
    reasoning,
  };
}
