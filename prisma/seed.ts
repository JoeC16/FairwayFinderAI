import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DRIVERS = [
  { brand: "Ping", model: "G440 Max", year: 2024, lofts: ["9", "10.5", "12"], msrp: 649 },
  { brand: "Ping", model: "G440 LST", year: 2024, lofts: ["10.5"], msrp: 649 },
  { brand: "TaylorMade", model: "Qi35 Max", year: 2025, lofts: ["9", "10.5", "12"], msrp: 699 },
  { brand: "TaylorMade", model: "Qi35 LS", year: 2025, lofts: ["9", "10.5"], msrp: 699 },
  { brand: "Callaway", model: "Paradym Ai Smoke Max", year: 2024, lofts: ["9", "10.5", "12"], msrp: 649 },
  { brand: "Callaway", model: "Paradym Ai Smoke LS", year: 2024, lofts: ["9"], msrp: 649 },
  { brand: "Titleist", model: "TSR4", year: 2023, lofts: ["8", "9", "10"], msrp: 649 },
  { brand: "Titleist", model: "TSR3", year: 2023, lofts: ["9", "10", "11"], msrp: 649 },
  { brand: "Titleist", model: "TSR2", year: 2023, lofts: ["9", "10", "11.5"], msrp: 649 },
  { brand: "Cobra", model: "Darkspeed LS", year: 2024, lofts: ["8", "9", "10.5"], msrp: 549 },
  { brand: "Cobra", model: "Darkspeed Max", year: 2024, lofts: ["9", "10.5", "12"], msrp: 549 },
  { brand: "Srixon", model: "ZX7 MkII", year: 2024, lofts: ["9", "10.5"], msrp: 549 },
];

const IRON_SETS = [
  { brand: "Titleist", model: "T100", year: 2023, category: "players_cavity", msrp: 1399 },
  { brand: "Titleist", model: "T150", year: 2023, category: "players_cavity", msrp: 1299 },
  { brand: "Titleist", model: "T200", year: 2023, category: "players_distance", msrp: 1299 },
  { brand: "Titleist", model: "T300", year: 2023, category: "game_improvement", msrp: 1199 },
  { brand: "Ping", model: "Blueprint S", year: 2024, category: "muscle_back", msrp: 1499 },
  { brand: "Ping", model: "i230", year: 2023, category: "players_cavity", msrp: 1349 },
  { brand: "Ping", model: "G430", year: 2023, category: "game_improvement", msrp: 1149 },
  { brand: "Ping", model: "G730", year: 2024, category: "super_gi", msrp: 1199 },
  { brand: "TaylorMade", model: "P770", year: 2024, category: "players_distance", msrp: 1399 },
  { brand: "TaylorMade", model: "P790", year: 2024, category: "players_distance", msrp: 1349 },
  { brand: "TaylorMade", model: "Qi35 Irons", year: 2025, category: "game_improvement", msrp: 1249 },
  { brand: "Callaway", model: "Apex CB", year: 2024, category: "players_cavity", msrp: 1399 },
  { brand: "Callaway", model: "Paradym Ai Smoke", year: 2024, category: "game_improvement", msrp: 1199 },
  { brand: "Srixon", model: "ZX7 MkII", year: 2024, category: "players_cavity", msrp: 1199 },
  { brand: "Srixon", model: "ZX5 MkII", year: 2024, category: "players_distance", msrp: 1099 },
  { brand: "Cleveland", model: "Launcher XL Halo", year: 2024, category: "super_gi", msrp: 999 },
];

const WEDGES = [
  { brand: "Titleist", model: "Vokey SM10", year: 2024, lofts: ["46", "48", "50", "52", "54", "56", "58", "60", "62"], msrp: 189 },
  { brand: "Cleveland", model: "RTX 6 ZipCore", year: 2024, lofts: ["46", "48", "50", "52", "54", "56", "58", "60"], msrp: 169 },
  { brand: "Callaway", model: "Jaws Raw", year: 2023, lofts: ["50", "52", "54", "56", "58", "60"], msrp: 169 },
  { brand: "TaylorMade", model: "MG4", year: 2024, lofts: ["50", "52", "54", "56", "58", "60"], msrp: 179 },
  { brand: "Ping", model: "Glide 4.0", year: 2023, lofts: ["46", "50", "52", "54", "56", "58", "60"], msrp: 169 },
  { brand: "Cobra", model: "King MIM", year: 2024, lofts: ["50", "52", "54", "56", "58", "60"], msrp: 159 },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminEmail = "admin@fairwayfit.ai";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash("admin123!", 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "FairwayFit Admin",
        role: "ADMIN",
        password: adminPassword,
      },
    });

    await prisma.subscription.create({
      data: { userId: admin.id, plan: "free", status: "active" },
    });

    console.log("✅ Admin user created:", adminEmail);
  } else {
    console.log("⏭  Admin user already exists");
  }

  // Seed drivers
  console.log("🏌️  Seeding drivers...");
  for (const driver of DRIVERS) {
    for (const loft of driver.lofts) {
      await prisma.product.upsert({
        where: {
          brand_model_year: {
            brand: driver.brand,
            model: `${driver.model} ${loft}°`,
            year: driver.year,
          },
        },
        update: {},
        create: {
          brand: driver.brand,
          model: `${driver.model} ${loft}°`,
          year: driver.year,
          category: "DRIVER",
          msrp: driver.msrp,
          specs: { loft },
          tags: ["driver"],
        },
      });
    }
  }

  // Seed iron sets
  console.log("⛳  Seeding iron sets...");
  for (const iron of IRON_SETS) {
    await prisma.product.upsert({
      where: {
        brand_model_year: {
          brand: iron.brand,
          model: iron.model,
          year: iron.year,
        },
      },
      update: {},
      create: {
        brand: iron.brand,
        model: iron.model,
        year: iron.year,
        category: "IRON_SET",
        msrp: iron.msrp,
        specs: { category: iron.category },
        tags: ["irons", iron.category],
      },
    });
  }

  // Seed wedges
  console.log("🏌️‍♂️  Seeding wedges...");
  for (const wedge of WEDGES) {
    for (const loft of wedge.lofts) {
      await prisma.product.upsert({
        where: {
          brand_model_year: {
            brand: wedge.brand,
            model: `${wedge.model} ${loft}°`,
            year: wedge.year,
          },
        },
        update: {},
        create: {
          brand: wedge.brand,
          model: `${wedge.model} ${loft}°`,
          year: wedge.year,
          category: "WEDGE",
          msrp: wedge.msrp,
          specs: { loft },
          tags: ["wedge"],
        },
      });
    }
  }

  // ── External partner retailers ─────────────────────────────
  const partners = [
    {
      name: "American Golf",
      slug: "american-golf",
      description: "UK's largest golf retailer with 100+ stores nationwide",
      tagline: "Expert fitting & top brands",
      website: "https://www.americangolf.co.uk",
      searchUrlTemplate: "https://www.americangolf.co.uk/search?query={query}",
      accentColor: "#e31837",
      bgColor: "#fff1f2",
      initials: "AG",
      countries: ["GB"],
      sortOrder: 1,
    },
    {
      name: "McGuirks Golf",
      slug: "mcguirks-golf",
      description: "Ireland's leading independent golf retailer",
      tagline: "Premium brands & custom fitting",
      website: "https://www.mcguirksgolf.com",
      searchUrlTemplate: "https://www.mcguirksgolf.com/catalogsearch/result/?q={query}",
      accentColor: "#006837",
      bgColor: "#f0fdf4",
      initials: "MG",
      countries: ["IE"],
      sortOrder: 2,
    },
    {
      name: "Affordable Golf",
      slug: "affordable-golf",
      description: "Best value golf equipment in the UK",
      tagline: "Top brands at great prices",
      website: "https://www.affordablegolf.co.uk",
      searchUrlTemplate: "https://www.affordablegolf.co.uk/search?q={query}",
      accentColor: "#1d4ed8",
      bgColor: "#eff6ff",
      initials: "AfG",
      countries: ["GB"],
      sortOrder: 3,
    },
  ];

  for (const partner of partners) {
    await prisma.externalPartner.upsert({
      where: { slug: partner.slug },
      update: partner,
      create: partner,
    });
  }

  const driverCount = await prisma.product.count({ where: { category: "DRIVER" } });
  const ironCount = await prisma.product.count({ where: { category: "IRON_SET" } });
  const wedgeCount = await prisma.product.count({ where: { category: "WEDGE" } });
  const partnerCount = await prisma.externalPartner.count();

  console.log(`✅ Seeding complete:`);
  console.log(`   Drivers:    ${driverCount}`);
  console.log(`   Iron sets:  ${ironCount}`);
  console.log(`   Wedges:     ${wedgeCount}`);
  console.log(`   Partners:   ${partnerCount}`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
