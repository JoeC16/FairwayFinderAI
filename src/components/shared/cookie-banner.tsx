"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie("ff_consent")) setVisible(true);
  }, []);

  function accept() {
    setCookie("ff_consent", "accepted", 365);
    setVisible(false);
  }

  function decline() {
    setCookie("ff_consent", "declined", 365);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-brand-950 border-t border-white/10 px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-sm text-white/80 max-w-2xl">
          We use cookies to personalise your experience and remember referral codes. See our{" "}
          <Link href="/cookies" className="underline text-gold-400 hover:text-gold-300">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline text-gold-400 hover:text-gold-300">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={decline}
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="bg-gold-500 hover:bg-gold-400 text-brand-950 font-semibold"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
