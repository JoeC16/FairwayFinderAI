import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { InventoryManager } from "./inventory-manager";

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);

  const retailer = await db.retailer.findUnique({
    where: { userId: session!.user.id },
    select: { id: true, name: true },
  });

  if (!retailer) redirect("/auth/sign-up?role=retailer");

  const items = await db.retailerInventoryItem.findMany({
    where: { retailerId: retailer.id },
    orderBy: [{ category: "asc" }, { brand: "asc" }],
    take: 500,
  });

  return <InventoryManager retailerId={retailer.id} initialItems={items} />;
}
