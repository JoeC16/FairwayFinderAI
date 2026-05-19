"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";

interface Props {
  user: { id: string; name: string | null; image: string | null };
}

export function ProfileForm({ user }: Props) {
  const { update } = useSession();
  const [name, setName] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to save");
      }

      await update({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">Personal Details</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Display Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          minLength={2}
        />
      </div>

      <Button type="submit" disabled={saving || saved}>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <><Check className="h-4 w-4" /> Saved</>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
