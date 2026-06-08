"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Lock, Chrome } from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") ?? "consumer";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

      await signIn("credentials", { email, password, callbackUrl: role === "retailer" ? "/retailer/dashboard" : "/dashboard" });
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-8 space-y-6">
      <Button
        variant="hero"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
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
          <Label className="text-white/80">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="John Smith"
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
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : role === "retailer" ? "Start Free Trial" : "Create Account"}
        </Button>

        <p className="text-center text-white/40 text-xs">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-gold-400">Terms</Link> and{" "}
          <Link href="/privacy" className="text-gold-400">Privacy Policy</Link>
        </p>
      </form>

      <p className="text-center text-white/60 text-sm">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-gold-400 hover:text-gold-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
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
          <p className="text-white/60 mt-2" suppressHydrationWarning>
            Start your journey
          </p>
        </div>
        <Suspense fallback={<div className="glass rounded-2xl p-8" />}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
