import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ConfidenceTier } from "@/types/fitting";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getConfidenceTier(score: number): ConfidenceTier {
  if (score >= 90) return "very_high";
  if (score >= 75) return "high";
  if (score >= 60) return "moderate";
  if (score >= 40) return "low";
  return "insufficient";
}

export function getConfidenceTierLabel(tier: ConfidenceTier): string {
  const labels: Record<ConfidenceTier, string> = {
    very_high: "Very High Confidence",
    high: "High Confidence",
    moderate: "Moderate Confidence",
    low: "Low Confidence",
    insufficient: "Insufficient Data",
  };
  return labels[tier];
}

export function getConfidenceTierColor(tier: ConfidenceTier): string {
  const colors: Record<ConfidenceTier, string> = {
    very_high: "text-green-400",
    high: "text-emerald-400",
    moderate: "text-amber-400",
    low: "text-orange-400",
    insufficient: "text-red-400",
  };
  return colors[tier];
}

export function getConfidenceBgColor(tier: ConfidenceTier): string {
  const colors: Record<ConfidenceTier, string> = {
    very_high: "bg-green-500/20 border-green-500/30",
    high: "bg-emerald-500/20 border-emerald-500/30",
    moderate: "bg-amber-500/20 border-amber-500/30",
    low: "bg-orange-500/20 border-orange-500/30",
    insufficient: "bg-red-500/20 border-red-500/30",
  };
  return colors[tier];
}

export function formatHandicap(handicap: number): string {
  if (handicap <= 0) return `+${Math.abs(handicap)}`;
  return String(handicap);
}

export function formatDistance(yards: number, unit: "yards" | "meters" = "yards"): string {
  if (unit === "meters") {
    return `${Math.round(yards * 0.9144)}m`;
  }
  return `${yards}y`;
}

export function yardsToMeters(yards: number): number {
  return Math.round(yards * 0.9144);
}

export function metersToYards(meters: number): number {
  return Math.round(meters * 1.09361);
}

export function cmToInches(cm: number): number {
  return cm / 2.54;
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54);
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateGuestToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getShaftFlexLabel(flex: string): string {
  const labels: Record<string, string> = {
    ladies: "Ladies (L)",
    senior: "Senior (A)",
    regular: "Regular (R)",
    stiff: "Stiff (S)",
    x_stiff: "X-Stiff (X)",
    tour_x: "Tour X (TX)",
  };
  return labels[flex] ?? flex;
}

export function getHandicapCategory(handicap: number): string {
  if (handicap <= 0) return "Scratch / Plus Handicap";
  if (handicap <= 5) return "Low Handicapper (0-5)";
  if (handicap <= 10) return "Mid-Low Handicapper (5-10)";
  if (handicap <= 18) return "Mid Handicapper (10-18)";
  if (handicap <= 28) return "High Handicapper (18-28)";
  return "Beginner (28+)";
}

export function calculateSmashFactor(ballSpeed: number, clubSpeed: number): number {
  if (!clubSpeed) return 0;
  return Math.round((ballSpeed / clubSpeed) * 100) / 100;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

export function absoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}${path}`;
}

export function parseClubLoft(loftStr: string): number | null {
  const match = loftStr.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return parseFloat(match[1]);
}

export function formatClubCategory(category: string): string {
  const labels: Record<string, string> = {
    driver: "Driver",
    fairway_wood: "Fairway Wood",
    hybrid: "Hybrid",
    driving_iron: "Driving Iron",
    iron_set: "Iron Set",
    wedge: "Wedge",
    putter: "Putter",
    DRIVER: "Driver",
    FAIRWAY_WOOD: "Fairway Wood",
    HYBRID: "Hybrid",
    DRIVING_IRON: "Driving Iron",
    IRON_SET: "Iron Set",
    WEDGE: "Wedge",
    PUTTER: "Putter",
  };
  return labels[category] ?? category;
}
