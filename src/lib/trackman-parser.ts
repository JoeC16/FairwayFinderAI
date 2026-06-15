import type { DriverLaunchData, IronLaunchData } from "@/types/fitting";

// TrackMan CSV column → our field name
const DRIVER_COL_MAP: Record<string, keyof DriverLaunchData> = {
  "club speed":    "clubSpeed",
  "ball speed":    "ballSpeed",
  "smash factor":  "smashFactor",
  "launch angle":  "launchAngle",
  "spin rate":     "spinRate",
  "carry":         "carryDistance",
  "total":         "totalDistance",
  "attack aoa":    "attackAngle",
  "attack angle":  "attackAngle",
  "club path":     "clubPath",
  "face angle":    "faceAngle",
  "dynamic loft":  "dynamicLoft",
  "height":        "apex",
  "max height":    "apex",
  "landing angle": "descentAngle",
  "descent angle": "descentAngle",
  "spin axis":     "spinAxis",
};

const IRON_COL_MAP: Record<string, keyof IronLaunchData> = {
  "club speed":    "clubSpeed",
  "ball speed":    "ballSpeed",
  "launch angle":  "launchAngle",
  "spin rate":     "spinRate",
  "carry":         "carryDistance",
  "height":        "peakHeight",
  "max height":    "peakHeight",
  "landing angle": "descentAngle",
  "descent angle": "descentAngle",
};

// Normalise a club name string to a category
function classifyClub(name: string): "driver" | "iron" | "other" {
  const n = name.toLowerCase().trim();
  if (n === "driver" || n === "dr" || n === "1w") return "driver";
  // 7-iron is the standard iron benchmark
  if (/^7[\s-]?iron$/i.test(n) || n === "7i" || n === "7 iron") return "iron";
  return "other";
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    // Simple split — TrackMan numeric exports don't use quoted commas
    rows.push(line.split(",").map((c) => c.trim()));
  }
  return rows;
}

function avg(values: number[]): number | undefined {
  if (!values.length) return undefined;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export interface TrackManParseResult {
  driverData?: DriverLaunchData;
  ironData?: IronLaunchData;
  driverShotCount: number;
  ironShotCount: number;
  isTrackMan: boolean;
}

export function parseTrackManCSV(text: string): TrackManParseResult {
  const rows = parseCSV(text);
  if (rows.length < 2) return { driverShotCount: 0, ironShotCount: 0, isTrackMan: false };

  // Find the header row — the one that contains "Ball Speed" or "Club Speed"
  let headerRowIdx = -1;
  let headers: string[] = [];
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const lower = rows[i].map((h) => h.toLowerCase());
    if (lower.includes("ball speed") || lower.includes("club speed")) {
      headerRowIdx = i;
      headers = lower;
      break;
    }
  }

  if (headerRowIdx === -1) return { driverShotCount: 0, ironShotCount: 0, isTrackMan: false };

  // Find the "Club" column index
  const clubColIdx = headers.indexOf("club");

  // Accumulate values per club category
  const driverAccum: Partial<Record<keyof DriverLaunchData, number[]>> = {};
  const ironAccum: Partial<Record<keyof IronLaunchData, number[]>> = {};

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    const clubName = clubColIdx >= 0 ? row[clubColIdx] : "";
    const category = classifyClub(clubName);
    if (category === "other") continue;

    const colMap = category === "driver" ? DRIVER_COL_MAP : IRON_COL_MAP;
    const accum = category === "driver" ? driverAccum : ironAccum;

    for (let c = 0; c < headers.length; c++) {
      const fieldKey = colMap[headers[c]];
      if (!fieldKey) continue;
      const val = parseFloat(row[c]);
      if (isNaN(val)) continue;
      if (!accum[fieldKey as keyof typeof accum]) {
        (accum as Record<string, number[]>)[fieldKey] = [];
      }
      (accum as Record<string, number[]>)[fieldKey].push(val);
    }
  }

  // Average the accumulated values
  function buildResult<T extends object>(accum: Partial<Record<keyof T, number[]>>): T | undefined {
    const result: Partial<T> = {};
    for (const [key, values] of Object.entries(accum)) {
      const mean = avg(values as number[]);
      if (mean !== undefined) (result as Record<string, number>)[key] = Math.round(mean * 100) / 100;
    }
    return Object.keys(result).length ? (result as T) : undefined;
  }

  const driverShotCount = Object.values(driverAccum)[0]?.length ?? 0;
  const ironShotCount = Object.values(ironAccum)[0]?.length ?? 0;

  return {
    driverData: buildResult<DriverLaunchData>(driverAccum),
    ironData: buildResult<IronLaunchData>(ironAccum),
    driverShotCount,
    ironShotCount,
    isTrackMan: true,
  };
}
