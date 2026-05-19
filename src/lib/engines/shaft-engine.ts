import type {
  FittingEngineInput,
  ShaftRecommendation,
  ShaftRec,
  ShaftFlex,
} from "@/types/fitting";
import { determineShaftFlex } from "./driver-engine";
import { determineIronCategory } from "./iron-engine";

function determineIronShaftFlex(input: FittingEngineInput): ShaftFlex {
  const ironSpeed = input.launchMonitor?.ironData?.clubSpeed;
  const driverSpeed = input.launchMonitor?.driverData?.clubSpeed;
  const estimatedIronSpeed = driverSpeed ? driverSpeed * 0.72 : undefined;
  const speed = ironSpeed ?? estimatedIronSpeed;

  if (speed) {
    if (speed >= 90) return "x_stiff";
    if (speed >= 82) return "stiff";
    if (speed >= 72) return "regular";
    if (speed >= 62) return "senior";
    return "ladies";
  }
  return determineShaftFlex(undefined, input.profile.handicap, input.distanceMatrix?.driver);
}

export function runShaftEngine(input: FittingEngineInput): ShaftRecommendation {
  const driverFlex = determineShaftFlex(
    input.launchMonitor?.driverData?.clubSpeed,
    input.profile.handicap,
    input.distanceMatrix?.driver
  );
  const ironFlex = determineIronShaftFlex(input);
  const lm = input.launchMonitor?.driverData;
  const highSpin = lm?.spinRate && lm.spinRate > 3000;
  const lowLaunch = lm?.launchAngle && lm.launchAngle < 10;

  const driverShafts: ShaftRec[] = [];
  const ironShafts: ShaftRec[] = [];
  const wedgeShafts: ShaftRec[] = [];

  // Driver shafts
  const driverProfile = lowLaunch ? "high" : highSpin ? "low" : "mid";
  const driverSpin = highSpin ? "low" : "mid";

  driverShafts.push({
    name: driverProfile === "high" ? "Fujikura Ventus Red" : driverProfile === "low" ? "Fujikura Ventus Black" : "Fujikura Ventus Blue",
    manufacturer: "Fujikura",
    weight: driverFlex === "stiff" || driverFlex === "x_stiff" ? "70g" : "60g",
    flex: driverFlex,
    profile: driverProfile as ShaftRec["profile"],
    spin: driverSpin as ShaftRec["spin"],
    torque: "3.2°",
    tier: "premium",
    suitedFor: `${driverProfile === "high" ? "Higher launch and draw-biased flight" : driverProfile === "low" ? "Low, penetrating ball flight with reduced spin" : "Balanced, mid-launch flight"}`,
    confidence: 90,
  });

  driverShafts.push({
    name: "Graphite Design Tour AD DI",
    manufacturer: "Graphite Design",
    weight: "65g",
    flex: driverFlex,
    profile: "mid",
    spin: "mid",
    torque: "3.4°",
    tier: "premium",
    suitedFor: "Consistent, reliable mid-launch flight — one of the most fitted shafts on Tour",
    confidence: 87,
  });

  // Iron shafts
  const needsGraphite = (input.profile.age ?? 0) >= 60 || (input.launchMonitor?.ironData?.clubSpeed ?? 999) < 70;

  if (needsGraphite) {
    ironShafts.push({
      name: "Mitsubishi MMT 75",
      manufacturer: "Mitsubishi Chemical",
      weight: "75g",
      flex: ironFlex,
      profile: "mid",
      spin: "mid",
      tier: "premium",
      suitedFor: "Steel-like performance in a lighter graphite — excellent for seniors or players with joint concerns",
      confidence: 89,
    });
    ironShafts.push({
      name: "UST Recoil 760",
      manufacturer: "UST Mamiya",
      weight: "70g",
      flex: ironFlex,
      profile: "mid",
      spin: "mid",
      tier: "mid",
      suitedFor: "Popular graphite iron shaft — smooth, consistent feel",
      confidence: 84,
    });
  } else {
    ironShafts.push({
      name: "KBS Tour",
      manufacturer: "KBS",
      weight: "120g",
      flex: ironFlex,
      profile: "mid",
      spin: "low",
      tier: "premium",
      suitedFor: "Low-to-mid launch with exceptional control and feel. Favoured by tour professionals",
      confidence: 91,
    });
    ironShafts.push({
      name: "True Temper Dynamic Gold",
      manufacturer: "True Temper",
      weight: "125g",
      flex: ironFlex,
      profile: "low",
      spin: "low",
      tier: "mid",
      suitedFor: "The tour-standard steel shaft — reliable, proven, consistent",
      confidence: 88,
    });
    if (input.profile.handicap >= 10) {
      ironShafts.push({
        name: "Nippon NS Pro Modus3 Tour 105",
        manufacturer: "Nippon",
        weight: "105g",
        flex: ironFlex,
        profile: "mid",
        spin: "mid",
        tier: "premium",
        suitedFor: "Lighter tour-weight steel providing premium feel without the heavy swing weight",
        confidence: 85,
      });
    }
  }

  // Wedge shafts
  wedgeShafts.push({
    name: "True Temper Dynamic Gold S400",
    manufacturer: "True Temper",
    weight: "130g",
    flex: "stiff",
    profile: "low",
    spin: "low",
    tier: "mid",
    suitedFor: "Consistent spin in scoring clubs — same shaft used by Tour professionals in wedges",
    confidence: 88,
  });
  wedgeShafts.push({
    name: "KBS Hi-Rev 2.0",
    manufacturer: "KBS",
    weight: "115g",
    flex: "stiff",
    profile: "high",
    spin: "high",
    tier: "premium",
    suitedFor: "Designed specifically for wedges — promotes higher launch and maximum spin",
    confidence: 85,
  });

  const reasoning: string[] = [
    `Driver shaft: ${driverFlex.replace("_", "-")} flex based on club speed profile.`,
    `${needsGraphite ? "Graphite" : "Steel"} iron shafts recommended in ${ironFlex.replace("_", "-")} flex.`,
    `Wedge shafts should be heavier than iron shafts for feel and consistency.`,
    ...(highSpin ? ["High spin rate detected — low-spin driver shaft profiles preferred."] : []),
    ...(lowLaunch ? ["Low launch angle — high-launch driver shaft will assist trajectory."] : []),
  ];

  return {
    driverShafts,
    ironShafts,
    wedgeShafts,
    reasoning,
  };
}
