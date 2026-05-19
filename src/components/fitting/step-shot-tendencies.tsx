"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";
import { Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface Props {
  sessionId: string;
  onComplete: () => void;
  onSkip: () => void;
}

const MISS_OPTIONS = [
  { value: "slice", label: "Slice", desc: "Ball curves hard right" },
  { value: "push_fade", label: "Push Fade", desc: "Starts right, fades more" },
  { value: "push", label: "Push", desc: "Starts and stays right" },
  { value: "straight", label: "Straight", desc: "Fairly straight" },
  { value: "pull_draw", label: "Pull Draw", desc: "Starts left, draws" },
  { value: "pull", label: "Pull", desc: "Starts and stays left" },
  { value: "hook", label: "Hook", desc: "Ball curves hard left" },
  { value: "double_cross", label: "Double Cross", desc: "Intended fade goes left" },
];

const STRIKE_OPTIONS = [
  { value: "center", label: "Center", desc: "Consistent sweet spot" },
  { value: "heel", label: "Heel", desc: "Contact near the hosel" },
  { value: "toe", label: "Toe", desc: "Contact near the toe" },
  { value: "thin", label: "Thin", desc: "Too high on face" },
  { value: "fat", label: "Fat", desc: "Hits turf before ball" },
  { value: "high_face", label: "High Face", desc: "Top of face" },
  { value: "low_face", label: "Low Face", desc: "Bottom of face" },
];

const FLIGHT_OPTIONS = [
  { value: "low", label: "Low", desc: "Piercing, low trajectory" },
  { value: "mid", label: "Mid", desc: "Mid height, normal" },
  { value: "high", label: "High", desc: "High, balloon-like" },
];

const SHAPE_OPTIONS = [
  { value: "fade", label: "Fade / Slice", desc: "Left-to-right curve" },
  { value: "straight", label: "Straight", desc: "Very little curve" },
  { value: "draw", label: "Draw / Hook", desc: "Right-to-left curve" },
];

const FRUSTRATIONS = [
  "Not enough distance",
  "Too much spin",
  "Lack of forgiveness",
  "Inconsistent strike",
  "Poor dispersion",
  "Cannot hold greens",
  "Trouble with wedges",
  "Long iron difficulty",
  "Bunker play",
  "Putting inconsistency",
  "Pull hooks",
  "Driver accuracy",
  "Distance gapping",
  "Ball flight too low",
  "Ball flight too high",
];

function OptionGrid({
  options,
  value,
  onChange,
  cols = 4,
}: {
  options: { value: string; label: string; desc: string }[];
  value?: string;
  onChange: (v: string) => void;
  cols?: number;
}) {
  return (
    <div className={cn(
      "grid gap-2",
      cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"
    )}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "p-3 rounded-xl border-2 text-left transition-all",
            value === opt.value
              ? "border-brand-700 bg-brand-50"
              : "border-gray-100 hover:border-gray-300 bg-white"
          )}
        >
          <div className={cn("text-sm font-semibold", value === opt.value ? "text-brand-800" : "text-gray-800")}>
            {opt.label}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 leading-tight">{opt.desc}</div>
        </button>
      ))}
    </div>
  );
}

export function StepShotTendencies({ sessionId, onComplete, onSkip }: Props) {
  const [loading, setLoading] = useState(false);
  const [typicalMiss, setTypicalMiss] = useState<string>("");
  const [strikePattern, setStrikePattern] = useState<string>("");
  const [ballFlight, setBallFlight] = useState<string>("");
  const [shotShape, setShotShape] = useState<string>("");
  const [frustrations, setFrustrations] = useState<string[]>([]);

  function toggleFrustration(f: string) {
    setFrustrations((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  async function handleSave() {
    if (!typicalMiss && !strikePattern && frustrations.length === 0) {
      onSkip();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/fitting/${sessionId}/tendencies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typicalMiss: typicalMiss || undefined,
          strikePattern: strikePattern || undefined,
          ballFlight: ballFlight || undefined,
          shotShape: shotShape || undefined,
          frustrations,
        }),
      });

      if (!res.ok) throw new Error("Failed to save tendencies");
      onComplete();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <Label className="text-sm font-semibold text-gray-900">Typical Miss Direction</Label>
          <p className="text-xs text-gray-400 mt-0.5">When you miss, which way does it typically go?</p>
        </div>
        <OptionGrid options={MISS_OPTIONS} value={typicalMiss} onChange={setTypicalMiss} cols={4} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <Label className="text-sm font-semibold text-gray-900">Strike Pattern</Label>
          <p className="text-xs text-gray-400 mt-0.5">Where do you typically make contact on the face?</p>
        </div>
        <OptionGrid options={STRIKE_OPTIONS} value={strikePattern} onChange={setStrikePattern} cols={4} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <Label className="text-sm font-semibold text-gray-900">Ball Flight Height</Label>
          <OptionGrid options={FLIGHT_OPTIONS} value={ballFlight} onChange={setBallFlight} cols={3} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <Label className="text-sm font-semibold text-gray-900">Shot Shape</Label>
          <OptionGrid options={SHAPE_OPTIONS} value={shotShape} onChange={setShotShape} cols={3} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <Label className="text-sm font-semibold text-gray-900">Common Frustrations</Label>
          <p className="text-xs text-gray-400 mt-0.5">Select everything that frustrates you about your current game</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FRUSTRATIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFrustration(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-all",
                frustrations.includes(f)
                  ? "border-brand-700 bg-brand-800 text-white"
                  : "border-gray-200 text-gray-600 hover:border-brand-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onSkip}>
          Skip this step
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
            Save & Continue
            <ChevronRight className="h-4 w-4" />
          </>}
        </Button>
      </div>
    </div>
  );
}
