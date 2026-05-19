"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/hooks/use-toast";
import { Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sessionId: string;
  onComplete: () => void;
  onSkip: () => void;
}

const CLUBS = [
  { key: "driver", label: "Driver", group: "Woods" },
  { key: "threeWood", label: "3 Wood", group: "Woods" },
  { key: "fiveWood", label: "5 Wood", group: "Woods" },
  { key: "sevenWood", label: "7 Wood", group: "Woods" },
  { key: "hybrid", label: "Hybrid", group: "Hybrids" },
  { key: "drivingIron", label: "Driving Iron", group: "Hybrids" },
  { key: "fourIron", label: "4 Iron", group: "Irons" },
  { key: "fiveIron", label: "5 Iron", group: "Irons" },
  { key: "sixIron", label: "6 Iron", group: "Irons" },
  { key: "sevenIron", label: "7 Iron", group: "Irons" },
  { key: "eightIron", label: "8 Iron", group: "Irons" },
  { key: "nineIron", label: "9 Iron", group: "Irons" },
  { key: "pitchingWedge", label: "Pitching Wedge", group: "Wedges" },
  { key: "gapWedge", label: "Gap Wedge", group: "Wedges" },
  { key: "sandWedge", label: "Sand Wedge", group: "Wedges" },
  { key: "lobWedge", label: "Lob Wedge", group: "Wedges" },
] as const;

const GROUPS = ["Woods", "Hybrids", "Irons", "Wedges"] as const;

export function StepDistanceMatrix({ sessionId, onComplete, onSkip }: Props) {
  const [distances, setDistances] = useState<Record<string, string>>({});
  const [unit, setUnit] = useState<"yards" | "meters">("yards");
  const [loading, setLoading] = useState(false);

  function updateDistance(key: string, value: string) {
    setDistances((prev) => ({ ...prev, [key]: value }));
  }

  const filledCount = Object.values(distances).filter((v) => v && parseFloat(v) > 0).length;

  async function handleSave() {
    if (filledCount === 0) {
      onSkip();
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, number | string> = { unit };
      for (const [k, v] of Object.entries(distances)) {
        if (v && parseFloat(v) > 0) payload[k] = parseFloat(v);
      }

      const res = await fetch(`/api/fitting/${sessionId}/distances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save distances");
      onComplete();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-start gap-3">
        <div className="text-amber-600 text-lg">💡</div>
        <div>
          <p className="text-sm font-medium text-amber-900">Enter carry distances, not total distances</p>
          <p className="text-xs text-amber-700 mt-0.5">Carry = how far the ball flies before landing. This gives us the most accurate gap analysis.</p>
        </div>
      </div>

      {/* Unit toggle */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 p-4">
        <span className="text-sm text-gray-600 mr-2">Distance unit:</span>
        {(["yards", "meters"] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              unit === u ? "bg-brand-800 text-white" : "bg-gray-100 text-gray-600"
            )}
          >
            {u.charAt(0).toUpperCase() + u.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400">
          {filledCount}/{CLUBS.length} filled
        </span>
      </div>

      {GROUPS.map((group) => {
        const groupClubs = CLUBS.filter((c) => c.group === group);
        return (
          <div key={group} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">{group}</span>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {groupClubs.map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">{label}</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="—"
                      min={0}
                      max={unit === "yards" ? 400 : 366}
                      className={cn(
                        "h-9 text-sm pr-8",
                        distances[key] && parseFloat(distances[key]) > 0 && "border-brand-300 bg-brand-50"
                      )}
                      value={distances[key] ?? ""}
                      onChange={(e) => updateDistance(key, e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {unit === "yards" ? "y" : "m"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onSkip}>
          Skip this step
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
            {filledCount === 0 ? "Skip" : "Save & Continue"}
            <ChevronRight className="h-4 w-4" />
          </>}
        </Button>
      </div>
    </div>
  );
}
