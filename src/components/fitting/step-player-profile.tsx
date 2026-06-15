"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/lib/hooks/use-toast";
import { Loader2, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  dominantHand: z.enum(["right", "left"]),
  handicap: z.string().min(1, "Handicap is required"),
  heightCm: z.string().min(1, "Height is required"),
  wristToFloorCm: z.string().optional(),
  averageScore: z.string().optional(),
  playingFrequency: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  sessionId: string;
  onComplete: () => void;
}

const GOALS = [
  "More distance",
  "Better accuracy",
  "Lower scores",
  "Improve consistency",
  "Reduce my slice/hook",
  "Better wedge play",
  "Improve putting",
  "Upgrade old equipment",
  "Get custom fitted",
  "Return to golf",
];

export function StepPlayerProfile({ sessionId, onComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const { data: authSession } = useSession();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { dominantHand: "right" },
  });

  const dominantHand = watch("dominantHand");

  // Pre-fill name and email from signed-in session, then fetch latest profile for other fields
  useEffect(() => {
    if (!authSession?.user) return;
    if (authSession.user.name) setValue("name", authSession.user.name, { shouldValidate: true });
    if (authSession.user.email) setValue("email", authSession.user.email, { shouldValidate: true });

    fetch("/api/user/latest-profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data: { name?: string; email?: string; phone?: string; age?: number; gender?: string; dominantHand?: string; handicap?: number; heightCm?: number; wristToFloorCm?: number; averageScore?: number; playingFrequency?: string; goals?: string[] } | null) => {
        if (!data) return;
        if (data.name) setValue("name", data.name);
        if (data.email) setValue("email", data.email);
        if (data.phone) setValue("phone", data.phone);
        if (data.age) setValue("age", String(data.age));
        if (data.gender) setValue("gender", data.gender);
        if (data.dominantHand) setValue("dominantHand", data.dominantHand as "right" | "left");
        if (data.handicap !== undefined) setValue("handicap", String(data.handicap));
        if (data.heightCm) setValue("heightCm", String(data.heightCm));
        if (data.wristToFloorCm) setValue("wristToFloorCm", String(data.wristToFloorCm));
        if (data.averageScore) setValue("averageScore", String(data.averageScore));
        if (data.playingFrequency) setValue("playingFrequency", data.playingFrequency);
        if (data.goals?.length) setSelectedGoals(data.goals);
      })
      .catch(() => {});
  }, [authSession, setValue]);

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        age: data.age ? parseInt(data.age) : undefined,
        gender: data.gender || undefined,
        dominantHand: data.dominantHand,
        handicap: parseFloat(data.handicap),
        heightCm: parseInt(data.heightCm),
        wristToFloorCm: data.wristToFloorCm ? parseInt(data.wristToFloorCm) : undefined,
        averageScore: data.averageScore ? parseInt(data.averageScore) : undefined,
        goals: selectedGoals,
        playingFrequency: data.playingFrequency || undefined,
      };

      const res = await fetch(`/api/fitting/${sessionId}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      onComplete();
    } catch (err) {
      toast({
        title: "Error saving profile",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Personal Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" placeholder="John Smith" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" placeholder="+44 7700 000000" {...register("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age">Age (optional)</Label>
            <Input id="age" type="number" placeholder="35" min={5} max={120} {...register("age")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Dominant Hand *</Label>
          <div className="flex gap-3">
            {["right", "left"].map((hand) => (
              <button
                key={hand}
                type="button"
                onClick={() => setValue("dominantHand", hand as "right" | "left")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all",
                  dominantHand === hand
                    ? "border-brand-700 bg-brand-50 text-brand-800"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {hand.charAt(0).toUpperCase() + hand.slice(1)}-Handed
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Golf Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Golf Profile</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="handicap">
              Handicap Index *
              <span className="text-gray-400 font-normal ml-1">(Enter 0 for scratch)</span>
            </Label>
            <Input id="handicap" type="number" step="0.1" placeholder="14.5" min={-10} max={54} {...register("handicap")} />
            {errors.handicap && <p className="text-xs text-red-500">{errors.handicap.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="averageScore">Typical 18-Hole Score</Label>
            <Input id="averageScore" type="number" placeholder="85" min={55} max={200} {...register("averageScore")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="playingFrequency">How often do you play?</Label>
            <Select onValueChange={(v) => setValue("playingFrequency", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rarely">Rarely (a few times a year)</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="multiple_weekly">2-4 times per week</SelectItem>
                <SelectItem value="daily">Daily / competitive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Physical Measurements */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-start justify-between">
          <h2 className="font-semibold text-gray-900">Physical Measurements</h2>
          <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg px-2 py-1">
            <Info className="h-3.5 w-3.5" />
            Used for lie & length fitting
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="heightCm">
              Height (cm) *
            </Label>
            <Input id="heightCm" type="number" placeholder="178" min={100} max={230} {...register("heightCm")} />
            {errors.heightCm && <p className="text-xs text-red-500">{errors.heightCm.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wristToFloorCm">
              Wrist-to-Floor (cm)
              <span className="text-gray-400 font-normal ml-1">(Recommended)</span>
            </Label>
            <Input id="wristToFloorCm" type="number" placeholder="82" min={50} max={100} {...register("wristToFloorCm")} />
            <p className="text-xs text-gray-400">Stand upright, arms at sides — measure from wrist crease to floor</p>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Your Golf Goals</h2>
        <p className="text-sm text-gray-500">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-all",
                selectedGoals.includes(goal)
                  ? "border-brand-700 bg-brand-800 text-white"
                  : "border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50"
              )}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Continue to Your Bag
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
