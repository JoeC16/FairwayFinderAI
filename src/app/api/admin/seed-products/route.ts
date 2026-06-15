import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// One entry per model — loft is advised by the fitting engine, not stored per-variant
const DRIVERS = [
  { brand: "TaylorMade", model: "Qi35 Max", year: 2025, msrp: 699, tags: ["high-handicap", "max-forgiveness"] },
  { brand: "TaylorMade", model: "Qi35 LS", year: 2025, msrp: 699, tags: ["low-spin", "better-player"] },
  { brand: "TaylorMade", model: "Qi35 Tour", year: 2025, msrp: 699, tags: ["tour", "workability"] },
  { brand: "TaylorMade", model: "Stealth 2 Plus", year: 2023, msrp: 529, tags: ["low-spin", "better-player"] },
  { brand: "TaylorMade", model: "Stealth 2", year: 2023, msrp: 499, tags: ["mid-handicap"] },
  { brand: "TaylorMade", model: "Stealth 2 HD", year: 2023, msrp: 499, tags: ["draw-bias", "high-handicap"] },
  { brand: "Callaway", model: "Paradym Ai Smoke Max", year: 2024, msrp: 649, tags: ["max-forgiveness", "ai"] },
  { brand: "Callaway", model: "Paradym Ai Smoke", year: 2024, msrp: 649, tags: ["mid-handicap", "ai"] },
  { brand: "Callaway", model: "Paradym Ai Smoke LS", year: 2024, msrp: 649, tags: ["low-spin", "better-player"] },
  { brand: "Callaway", model: "Paradym Ai Smoke Max D", year: 2024, msrp: 649, tags: ["draw-bias", "high-handicap"] },
  { brand: "Callaway", model: "Paradym X", year: 2023, msrp: 529, tags: ["max-forgiveness"] },
  { brand: "Ping", model: "G440 Max", year: 2024, msrp: 649, tags: ["max-forgiveness", "high-handicap"] },
  { brand: "Ping", model: "G440 LST", year: 2024, msrp: 649, tags: ["low-spin", "better-player"] },
  { brand: "Ping", model: "G440 SFT", year: 2024, msrp: 649, tags: ["draw-bias", "slice-fix"] },
  { brand: "Ping", model: "G430 Max 10K", year: 2023, msrp: 579, tags: ["max-forgiveness"] },
  { brand: "Titleist", model: "GT2", year: 2024, msrp: 579, tags: ["mid-handicap", "speed"] },
  { brand: "Titleist", model: "GT3", year: 2024, msrp: 579, tags: ["better-player", "workability"] },
  { brand: "Titleist", model: "GT4", year: 2024, msrp: 579, tags: ["tour", "low-spin"] },
  { brand: "Titleist", model: "TSR2", year: 2023, msrp: 529, tags: ["mid-handicap"] },
  { brand: "Titleist", model: "TSR3", year: 2023, msrp: 529, tags: ["better-player"] },
  { brand: "Cobra", model: "Darkspeed Max", year: 2024, msrp: 549, tags: ["max-forgiveness"] },
  { brand: "Cobra", model: "Darkspeed LS", year: 2024, msrp: 549, tags: ["low-spin", "better-player"] },
  { brand: "Cobra", model: "Darkspeed X", year: 2024, msrp: 549, tags: ["mid-handicap"] },
  { brand: "Srixon", model: "ZX7 MkII", year: 2024, msrp: 549, tags: ["better-player"] },
  { brand: "Srixon", model: "ZX5 MkII", year: 2024, msrp: 499, tags: ["mid-handicap"] },
  { brand: "Mizuno", model: "ST-Z 230", year: 2023, msrp: 499, tags: ["better-player", "low-spin"] },
  { brand: "Mizuno", model: "ST-X 230", year: 2023, msrp: 499, tags: ["mid-handicap"] },
  { brand: "Cleveland", model: "Launcher XL2", year: 2024, msrp: 399, tags: ["high-handicap", "budget"] },
  { brand: "Wilson", model: "Dynapower Carbon", year: 2023, msrp: 399, tags: ["mid-handicap", "budget"] },
];

const FAIRWAY_WOODS = [
  { brand: "TaylorMade", model: "Qi35 3 Wood", year: 2025, msrp: 449, tags: ["3-wood"] },
  { brand: "TaylorMade", model: "Qi35 5 Wood", year: 2025, msrp: 449, tags: ["5-wood"] },
  { brand: "Callaway", model: "Paradym Ai Smoke 3 Wood", year: 2024, msrp: 399, tags: ["3-wood"] },
  { brand: "Callaway", model: "Paradym Ai Smoke 5 Wood", year: 2024, msrp: 399, tags: ["5-wood"] },
  { brand: "Ping", model: "G440 3 Wood", year: 2024, msrp: 399, tags: ["3-wood"] },
  { brand: "Ping", model: "G440 5 Wood", year: 2024, msrp: 399, tags: ["5-wood"] },
  { brand: "Titleist", model: "GT2 3 Wood", year: 2024, msrp: 349, tags: ["3-wood"] },
  { brand: "Cobra", model: "Darkspeed 3 Wood", year: 2024, msrp: 329, tags: ["3-wood"] },
  { brand: "Srixon", model: "ZX Mk II 3 Wood", year: 2024, msrp: 299, tags: ["3-wood"] },
];

const HYBRIDS = [
  { brand: "TaylorMade", model: "Qi35 Rescue", year: 2025, msrp: 299, tags: ["hybrid"] },
  { brand: "Callaway", model: "Paradym Ai Smoke Hybrid", year: 2024, msrp: 299, tags: ["hybrid"] },
  { brand: "Ping", model: "G440 Hybrid", year: 2024, msrp: 299, tags: ["hybrid"] },
  { brand: "Titleist", model: "TSR2 Hybrid", year: 2023, msrp: 279, tags: ["hybrid"] },
  { brand: "Cobra", model: "Darkspeed Hybrid", year: 2024, msrp: 249, tags: ["hybrid"] },
  { brand: "Cleveland", model: "Launcher XL Halo Hybrid", year: 2024, msrp: 229, tags: ["hybrid", "high-handicap"] },
  { brand: "Srixon", model: "ZX Hybrid", year: 2024, msrp: 249, tags: ["hybrid"] },
];

const IRON_SETS = [
  { brand: "Titleist", model: "T100", year: 2023, msrp: 1399, tags: ["players-cavity", "better-player"] },
  { brand: "Titleist", model: "T100S", year: 2023, msrp: 1399, tags: ["players-cavity", "strong-lofts"] },
  { brand: "Titleist", model: "T150", year: 2023, msrp: 1299, tags: ["players-cavity"] },
  { brand: "Titleist", model: "T200", year: 2023, msrp: 1299, tags: ["players-distance"] },
  { brand: "Titleist", model: "T300", year: 2023, msrp: 1199, tags: ["game-improvement"] },
  { brand: "Titleist", model: "T350", year: 2023, msrp: 1099, tags: ["super-game-improvement"] },
  { brand: "Ping", model: "Blueprint S", year: 2024, msrp: 1499, tags: ["muscle-back", "better-player", "blades"] },
  { brand: "Ping", model: "Blueprint T", year: 2024, msrp: 1499, tags: ["muscle-back", "tour"] },
  { brand: "Ping", model: "i230", year: 2023, msrp: 1349, tags: ["players-cavity", "better-player"] },
  { brand: "Ping", model: "i525", year: 2023, msrp: 1249, tags: ["players-distance"] },
  { brand: "Ping", model: "G430", year: 2023, msrp: 1149, tags: ["game-improvement"] },
  { brand: "Ping", model: "G730", year: 2024, msrp: 1199, tags: ["super-game-improvement"] },
  { brand: "TaylorMade", model: "P7MC", year: 2024, msrp: 1499, tags: ["muscle-cavity", "better-player"] },
  { brand: "TaylorMade", model: "P7MB", year: 2024, msrp: 1499, tags: ["blades", "tour"] },
  { brand: "TaylorMade", model: "P770", year: 2024, msrp: 1399, tags: ["players-distance", "better-player"] },
  { brand: "TaylorMade", model: "P790", year: 2024, msrp: 1349, tags: ["players-distance"] },
  { brand: "TaylorMade", model: "Qi35 Irons", year: 2025, msrp: 1249, tags: ["game-improvement"] },
  { brand: "TaylorMade", model: "Stealth 2 HD Irons", year: 2023, msrp: 1099, tags: ["super-game-improvement", "high-handicap"] },
  { brand: "Callaway", model: "Apex MB", year: 2024, msrp: 1499, tags: ["blades", "tour"] },
  { brand: "Callaway", model: "Apex CB", year: 2024, msrp: 1399, tags: ["players-cavity", "better-player"] },
  { brand: "Callaway", model: "Apex Pro", year: 2024, msrp: 1349, tags: ["players-distance", "better-player"] },
  { brand: "Callaway", model: "Paradym Ai Smoke Irons", year: 2024, msrp: 1199, tags: ["game-improvement", "ai"] },
  { brand: "Callaway", model: "Big Bertha B21 Irons", year: 2023, msrp: 999, tags: ["super-game-improvement", "high-handicap"] },
  { brand: "Mizuno", model: "JPX 925 Tour", year: 2024, msrp: 1399, tags: ["players-cavity", "better-player"] },
  { brand: "Mizuno", model: "JPX 925 Forged", year: 2024, msrp: 1299, tags: ["players-distance", "forged"] },
  { brand: "Mizuno", model: "JPX 925", year: 2024, msrp: 1199, tags: ["game-improvement"] },
  { brand: "Mizuno", model: "JPX 925 Hot Metal", year: 2024, msrp: 1099, tags: ["super-game-improvement"] },
  { brand: "Srixon", model: "ZX7 MkII Irons", year: 2024, msrp: 1199, tags: ["players-cavity", "better-player"] },
  { brand: "Srixon", model: "ZX5 MkII Irons", year: 2024, msrp: 1099, tags: ["players-distance"] },
  { brand: "Cleveland", model: "ZipCore XL Irons", year: 2024, msrp: 999, tags: ["game-improvement"] },
  { brand: "Cleveland", model: "Launcher XL Halo Irons", year: 2024, msrp: 899, tags: ["super-game-improvement", "high-handicap"] },
  { brand: "Wilson", model: "D9 Irons", year: 2023, msrp: 799, tags: ["game-improvement", "budget"] },
];

const WEDGES = [
  { brand: "Titleist", model: "Vokey SM10", year: 2024, msrp: 189, tags: ["wedge"] },
  { brand: "Titleist", model: "Vokey SM9", year: 2023, msrp: 159, tags: ["wedge"] },
  { brand: "Cleveland", model: "RTX 6 ZipCore", year: 2024, msrp: 169, tags: ["wedge"] },
  { brand: "Cleveland", model: "CBX 4 ZipCore", year: 2024, msrp: 159, tags: ["wedge", "game-improvement"] },
  { brand: "Callaway", model: "Jaws Raw", year: 2023, msrp: 169, tags: ["wedge"] },
  { brand: "Callaway", model: "Mack Daddy CB", year: 2023, msrp: 149, tags: ["wedge", "game-improvement"] },
  { brand: "TaylorMade", model: "MG4", year: 2024, msrp: 179, tags: ["wedge"] },
  { brand: "TaylorMade", model: "Hi-Toe 4", year: 2024, msrp: 179, tags: ["wedge", "versatile"] },
  { brand: "Ping", model: "Glide 4.0", year: 2023, msrp: 169, tags: ["wedge"] },
  { brand: "Mizuno", model: "T24", year: 2024, msrp: 169, tags: ["wedge"] },
  { brand: "Cobra", model: "King MIM", year: 2024, msrp: 159, tags: ["wedge"] },
  { brand: "Wilson", model: "Staff Model Wedge", year: 2023, msrp: 139, tags: ["wedge"] },
];

const PUTTERS = [
  { brand: "Scotty Cameron", model: "Phantom 5", year: 2024, msrp: 449, tags: ["mallet", "face-balanced"] },
  { brand: "Scotty Cameron", model: "Special Select Newport 2", year: 2024, msrp: 419, tags: ["blade"] },
  { brand: "Scotty Cameron", model: "Super Select Newport", year: 2024, msrp: 389, tags: ["blade"] },
  { brand: "Ping", model: "PLD Milled Anser", year: 2024, msrp: 399, tags: ["blade"] },
  { brand: "Ping", model: "PLD Milled DS72", year: 2024, msrp: 399, tags: ["mallet"] },
  { brand: "Ping", model: "G Le3 Nova", year: 2024, msrp: 199, tags: ["mallet", "ladies"] },
  { brand: "TaylorMade", model: "Spider Tour X", year: 2024, msrp: 379, tags: ["mallet", "face-balanced"] },
  { brand: "TaylorMade", model: "TP Reserve B11", year: 2024, msrp: 249, tags: ["blade"] },
  { brand: "Callaway", model: "Odyssey Ai-One Milled 7", year: 2024, msrp: 329, tags: ["mallet"] },
  { brand: "Callaway", model: "Odyssey White Hot OG #7", year: 2023, msrp: 179, tags: ["mallet", "budget"] },
  { brand: "Cleveland", model: "HB Soft 2", year: 2024, msrp: 149, tags: ["mallet", "budget"] },
  { brand: "Wilson", model: "Staff Model Blade Putter", year: 2023, msrp: 179, tags: ["blade"] },
];

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let created = 0;

  async function upsertProduct(p: { brand: string; model: string; year: number; msrp: number; tags: string[] }, category: string) {
    const existing = await db.product.findFirst({ where: { brand: p.brand, model: p.model, year: p.year } });
    if (!existing) {
      await db.product.create({
        data: { brand: p.brand, model: p.model, year: p.year, category: category as never, msrp: p.msrp, tags: p.tags, active: true, specs: {} },
      });
      created++;
    }
  }

  for (const p of DRIVERS)       await upsertProduct(p, "DRIVER");
  for (const p of FAIRWAY_WOODS) await upsertProduct(p, "FAIRWAY_WOOD");
  for (const p of HYBRIDS)       await upsertProduct(p, "HYBRID");
  for (const p of IRON_SETS)     await upsertProduct(p, "IRON_SET");
  for (const p of WEDGES)        await upsertProduct(p, "WEDGE");
  for (const p of PUTTERS)       await upsertProduct(p, "PUTTER");

  const total = await db.product.count({ where: { active: true } });

  const PARTNERS = [
    { name: "American Golf", slug: "american-golf", description: "UK's largest golf retailer with 100+ stores", tagline: "Expert fitting & top brands", website: "https://www.americangolf.co.uk", searchUrlTemplate: "https://www.americangolf.co.uk/search-results?q={query}", accentColor: "#e31837", bgColor: "#fff1f2", initials: "AG", countries: ["GB"], active: true, sortOrder: 1 },
    { name: "GolfBidder", slug: "golfbidder", description: "Europe's largest new & used golf club retailer", tagline: "New & pre-owned at great prices", website: "https://www.golfbidder.co.uk", searchUrlTemplate: "https://www.golfbidder.co.uk/search?q={query}", accentColor: "#006837", bgColor: "#f0fdf4", initials: "GB", countries: ["GB"], active: true, sortOrder: 2 },
    { name: "Affordable Golf", slug: "affordable-golf", description: "Top brands at competitive prices", tagline: "Free UK delivery on all orders", website: "https://www.affordablegolf.co.uk", searchUrlTemplate: "https://www.affordablegolf.co.uk/search?q={query}&type=product", accentColor: "#1d4ed8", bgColor: "#eff6ff", initials: "AfG", countries: ["GB"], active: true, sortOrder: 3 },
    { name: "Clarkes Golf", slug: "clarkes-golf", description: "Family-run golf retailer since 1983", tagline: "Expert staff & top brands", website: "https://www.clarkesgolf.co.uk", searchUrlTemplate: "https://www.clarkesgolf.co.uk/search?q={query}&type=product", accentColor: "#1a3c5e", bgColor: "#f0f4f8", initials: "CG", countries: ["GB"], active: true, sortOrder: 4 },
    { name: "Replay Golf", slug: "replay-golf", description: "New and second-hand golf clubs at great prices", tagline: "New & used clubs", website: "https://replay-golf.co.uk", searchUrlTemplate: "https://replay-golf.co.uk/search?q={query}&type=product", accentColor: "#7c3aed", bgColor: "#f5f3ff", initials: "RG", countries: ["GB"], active: true, sortOrder: 5 },
    { name: "eBay UK", slug: "ebay-uk-golf", description: "Marketplace for new & used golf clubs", tagline: "Huge selection, competitive prices", website: "https://www.ebay.co.uk", searchUrlTemplate: "https://www.ebay.co.uk/sch/i.html?_nkw={query}&_sacat=1513", accentColor: "#e53238", bgColor: "#fff7ed", initials: "eB", countries: ["GB"], active: true, sortOrder: 6 },
  ];

  for (const partner of PARTNERS) {
    await db.externalPartner.upsert({ where: { slug: partner.slug }, update: partner, create: partner });
  }

  return NextResponse.json({ message: `Seeded ${created} new products (${total} total active) across 6 categories. 6 partner retailers updated.` });
}
