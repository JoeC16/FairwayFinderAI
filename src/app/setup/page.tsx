"use client";

import { useState } from "react";
import Link from "next/link";

export default function SetupPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/auth/claim-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json() as { message?: string; error?: string };

    if (res.ok) {
      setStatus("success");
      setMessage(data.message ?? "You are now an admin!");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500 mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 2v20M3 7l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">First-Time Setup</h1>
          <p className="text-white/60 mt-2 text-sm">
            Claim admin access for your account.<br />
            This page disables itself after one use.
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          {status === "success" ? (
            <div className="text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 mx-auto">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-medium">{message}</p>
              <p className="text-white/50 text-sm">Sign out and back in, then visit the admin panel.</p>
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/admin/retailers"
                  className="block w-full py-2.5 px-4 bg-gold-500 hover:bg-gold-400 text-white font-medium rounded-xl text-center transition-colors"
                >
                  Go to Admin Panel
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="block w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-center transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === "error" && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-300 text-sm">{message}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-white/80 text-sm font-medium">Your account email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-2.5 px-4 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
              >
                {status === "loading" ? "Claiming..." : "Claim Admin Access"}
              </button>
              <p className="text-white/40 text-xs text-center">
                You must have already signed up with this email.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
