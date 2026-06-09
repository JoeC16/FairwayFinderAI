"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Lock, Chrome, Trophy, ShoppingBag, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") ?? null;

  const [role, setRole] = useState<"consumer" | "retailer" | null>(
    initialRole === "retailer" ? "retailer" : initialRole === "consumer" ? "consumer" : null
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Registration failed");
      }

      await signIn("credentials", {
        email,
        password,
        callbackUrl: role === "retailer" ? "/retailer/dashboard" : "/dashboard",
      });
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            value: "consumer" as const,
            icon: Trophy,
            title: "I'm a Golfer",
            desc: "Get personalised club recommendations",
            badge: "Free",
          },
          {
            value: "retailer" as const,
            icon: ShoppingBag,
            title: "I'm a Retailer",
            desc: "Offer AI fittings to your customers",
            badge: "14-day trial",
          },
        ].map(({ value, icon: Icon, title, desc, badge }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={cn(
              "relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all",
              role === value
                ? "border-gold-400 bg-gold-500/10"
                : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
            )}
          >
            {role === value && (
              <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500">
                <Check className="h-3 w-3 text-white" />
              </span>
            )}
            <Icon className={cn("h-5 w-5", role === value ? "text-gold-400" : "text-white/60")} />
            <span className={cn("text-sm font-semibold", role === value ? "text-white" : "text-white/80")}>{title}</span>
            <span className="text-xs text-white/50">{desc}</span>
            <span className={cn(
              "mt-1 rounded-full px-2 py-0.5 text-xs font-medium",
              role === value ? "bg-gold-500/30 text-gold-300" : "bg-white/10 text-white/40"
            )}>{badge}</span>
          </button>
        ))}
      </div>

      {/* Form — only show once role is chosen */}
      {role && (
        <div className="glass rounded-2xl p-6 space-y-5 animate-fade-in">
          <Button
            variant="hero"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: role === "retailer" ? "/retailer/dashboard" : "/dashboard" })}
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-white/20" />
            <span className="text-white/40 text-sm">or</span>
            <div className="flex-1 border-t border-white/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-white/80">{role === "retailer" ? "Shop / Business Name" : "Full Name"}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder={role === "retailer" ? "e.g. The Golf Shop" : "John Smith"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/80">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" variant="gold" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : role === "retailer" ? "Start Free Trial" : "Create Account"}
            </Button>

            <p className="text-center text-white/40 text-xs">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="text-gold-400">Terms</Link> and{" "}
              <Link href="/privacy" className="text-gold-400">Privacy Policy</Link>
            </p>
          </form>
        </div>
      )}

      {!role && (
        <p className="text-center text-white/40 text-sm">Select an option above to get started</p>
      )}

      <p className="text-center text-white/60 text-sm">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-gold-400 hover:text-gold-300 font-medium">Sign in</Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M12 2v20M3 7l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">FairwayFit <span className="text-gold-400">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/60 mt-2 text-sm">Who are you signing up as?</p>
        </div>
        <Suspense fallback={<div className="h-48" />}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
