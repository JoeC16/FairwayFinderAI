import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  DRIVER: "Driver",
  FAIRWAY_WOOD: "Fairway Wood",
  HYBRID: "Hybrid",
  DRIVING_IRON: "Driving Iron",
  IRON_SET: "Iron Set",
  INDIVIDUAL_IRON: "Iron",
  WEDGE: "Wedge",
  PUTTER: "Putter",
  SHAFT: "Shaft",
  GRIP: "Grip",
  BAG: "Bag",
  ACCESSORY: "Accessory",
};

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: [{ category: "asc" }, { brand: "asc" }, { model: "asc" }],
    include: {
      _count: { select: { inventoryItems: true, productRecommendations: true } },
    },
    take: 200,
  });

  const totalCount = await db.product.count();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Database</h1>
          <p className="text-gray-500 text-sm mt-1">{totalCount} products</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 text-left">
              <th className="px-5 py-3 font-medium text-gray-500">Product</th>
              <th className="px-5 py-3 font-medium text-gray-500">Category</th>
              <th className="px-5 py-3 font-medium text-gray-500">Year</th>
              <th className="px-5 py-3 font-medium text-gray-500">MSRP</th>
              <th className="px-5 py-3 font-medium text-gray-500">In Inventory</th>
              <th className="px-5 py-3 font-medium text-gray-500">Recommended</th>
              <th className="px-5 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{product.brand} {product.model}</p>
                </td>
                <td className="px-5 py-3">
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-gray-500">{product.year ?? "—"}</td>
                <td className="px-5 py-3 text-gray-500">
                  {product.msrp ? `$${product.msrp.toLocaleString()}` : "—"}
                </td>
                <td className="px-5 py-3 text-gray-500">{product._count.inventoryItems}</td>
                <td className="px-5 py-3 text-gray-500">{product._count.productRecommendations}</td>
                <td className="px-5 py-3">
                  <Badge variant={product.active ? "success" : "secondary"} className="text-xs">
                    {product.active ? "Active" : "Inactive"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {products.length === 0 && (
          <div className="p-12 text-center">
            <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No products in database yet.</p>
            <Button asChild>
              <Link href="/admin/products/seed">Run Seed Script</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
