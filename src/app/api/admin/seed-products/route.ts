import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const DRIVERS = [
  { brand: "Ping", model: "G440 Max", year: 2024, lofts: ["9", "10.5", "12"], msrp: 649 },
  { brand: "Ping", model: "G440 LST", year: 2024, lofts: ["10.5"], msrp: 649 },
  { brand: "TaylorMade", model: "Qi35 Max", year: 2025, lofts: ["9", "10.5", "12"], msrp: 699 },
  { brand: "TaylorMade", model: "Qi35 LS", year: 2025, lofts: ["9", "10.5"], msrp: 699 },
  { brand: "Callaway", model: "Paradym Ai Smoke Max", year: 2024, lofts: ["9", "10.5", "12"], msrp: 649 },
  { brand: "Titleist", model: "TSR3", year: 2023, lofts: ["9", "10", "11"], msrp: 649 },
  { brand: "Titleist", model: "TSR2", year: 2023, lofts: ["9", "10", "11.5"], msrp: 649 },
  { brand: "Cobra", model: "Darkspeed Max", year: 2024, lofts: ["9", "10.5", "12"], msrp: 549 },
  { brand: "Srixon", model: "ZX7 MkII", year: 2024, lofts: ["9", "10.5"], msrp: 549 },
];

const IRON_SETS = [
  { brand: "Titleist", model: "T100", year: 2023, msrp: 1399 },
  { brand: "Titleist", model: "T200", year: 2023, msrp: 1299 },
  { brand: "Titleist", model: "T300", year: 2023, msrp: 1199 },
  { brand: "Ping", model: "i230", year: 2023, msrp: 1349 },
  { brand: "Ping", model: "G430", year: 2023, msrp: 1149 },
  { brand: "Ping", model: "G730", year: 2024, msrp: 1199 },
  { brand: "TaylorMade", model: "P790", year: 2024, msrp: 1349 },
  { brand: "TaylorMade", model: "Qi35 Irons", year: 2025, msrp: 1249 },
  { brand: "Callaway", model: "Apex CB", year: 2024, msrp: 1399 },
  { brand: "Callaway", model: "Paradym Ai Smoke", year: 2024, msrp: 1199 },
  { brand: "Srixon", model: "ZX5 MkII", year: 2024, msrp: 1099 },
  { brand: "Cleveland", model: "Launcher XL Halo", year: 2024, msrp: 999 },
];

const WEDGES = [
  { brand: "Titleist", model: "Vokey SM10", year: 2024, lofts: ["50", "52", "54", "56", "58", "60"], msrp: 189 },
  { brand: "Cleveland", model: "RTX 6 ZipCore", year: 2024, lofts: ["50", "52", "54", "56", "58", "60"], msrp: 169 },
  { brand: "Callaway", model: "Jaws Raw", year: 2023, lofts: ["52", "54", "56", "58", "60"], msrp: 169 },
  { brand: "TaylorMade", model: "MG4", year: 2024, lofts: ["50", "52", "54", "56", "58", "60"], msrp: 179 },
  { brand: "Ping", model: "Glide 4.0", year: 2023, lofts: ["50", "52", "54", "56", "58", "60"], msrp: 169 },
];

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let created = 0;

  for (const driver of DRIVERS) {
    for (const loft of driver.lofts) {
      const modelWithLoft = `${driver.model} ${loft}°`;
      const existing = await db.product.findFirst({
        where: { brand: driver.brand, model: modelWithLoft, year: driver.year },
      });
      if (!existing) {
        await db.product.create({
          data: { brand: driver.brand, model: modelWithLoft, year: driver.year, category: "DRIVER", msrp: driver.msrp, active: true, specs: {} },
        });
        created++;
      }
    }
  }

  for (const iron of IRON_SETS) {
    const existing = await db.product.findFirst({
      where: { brand: iron.brand, model: iron.model, year: iron.year },
    });
    if (!existing) {
      await db.product.create({
        data: { brand: iron.brand, model: iron.model, year: iron.year, category: "IRON_SET", msrp: iron.msrp, active: true, specs: {} },
      });
      created++;
    }
  }

  for (const wedge of WEDGES) {
    for (const loft of wedge.lofts) {
      const modelWithLoft = `${wedge.model} ${loft}°`;
      const existing = await db.product.findFirst({
        where: { brand: wedge.brand, model: modelWithLoft, year: wedge.year },
      });
      if (!existing) {
        await db.product.create({
          data: { brand: wedge.brand, model: modelWithLoft, year: wedge.year, category: "WEDGE", msrp: wedge.msrp, active: true, specs: {} },
        });
        created++;
      }
    }
  }

  return NextResponse.json({ message: `Seeded ${created} new products successfully.` });
}
