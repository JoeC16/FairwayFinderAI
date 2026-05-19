"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Chrome } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
  }

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
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/60 mt-2">Sign in to your account</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6">
          <Button
            variant="hero"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl })}
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
              <div className="flex items-center justify-between">
                <Label className="text-white/80">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-gold-400 hover:text-gold-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" variant="gold" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-white/60 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-gold-400 hover:text-gold-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
