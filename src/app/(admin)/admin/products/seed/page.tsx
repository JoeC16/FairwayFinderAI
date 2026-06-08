"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Database, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SeedProductsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSeed() {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/seed-products", { method: "POST" });
      const data = await res.json() as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Seed failed");
      setMessage(data.message ?? "Done");
      setStatus("done");
      setTimeout(() => router.push("/admin/products"), 2000);
    } catch (err) {
      setMessage((err as Error).message);
      setStatus("error");
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Seed Products</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-4">
        {status === "done" ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-semibold text-gray-900">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to products...</p>
          </>
        ) : (
          <>
            <Database className="h-12 w-12 text-brand-600 mx-auto" />
            <div>
              <h2 className="font-semibold text-gray-900">Load Golf Products</h2>
              <p className="text-sm text-gray-500 mt-1">
                This will add 100+ drivers, irons, wedges and putters to the product database. Safe to run multiple times — existing products won&apos;t be duplicated.
              </p>
            </div>
            {status === "error" && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{message}</p>
            )}
            <Button onClick={handleSeed} disabled={status === "loading"} className="w-full">
              {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Seeding...</> : "Seed Products"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
