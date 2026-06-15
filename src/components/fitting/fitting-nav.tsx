"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  Settings,
  ShoppingBag,
  Users,
  BarChart3,
  Shield,
  LogIn,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

function navItemsForRole(role?: string) {
  if (role === "ADMIN") {
    return [
      { href: "/admin/dashboard", label: "Admin Dashboard", icon: Shield },
      { href: "/dashboard", label: "Consumer Portal", icon: LayoutDashboard },
      { href: "/retailer/dashboard", label: "Retailer Portal", icon: ShoppingBag },
    ];
  }
  if (role === "RETAILER") {
    return [
      { href: "/retailer/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/retailer/leads", label: "Leads", icon: Users },
      { href: "/retailer/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/retailer/settings", label: "Settings", icon: Settings },
    ];
  }
  if (role === "CONSUMER") {
    return [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/fittings", label: "My Fittings", icon: ClipboardList },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];
  }
  return [
    { href: "/", label: "Home", icon: Home },
    { href: "/auth/sign-in", label: "Sign In", icon: LogIn },
  ];
}

export function FittingNav() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const role = session?.user?.role;
  const navItems = navItemsForRole(role);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex w-64 flex-col bg-brand-900 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
                    <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M12 2v20M3 7l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-white font-bold text-sm">FairwayFit <span className="text-gold-400">AI</span></span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-3 pt-2 pb-1">
              <p className="px-3 py-2 text-white/40 text-xs font-medium uppercase tracking-wider">Navigate</p>
            </div>

            <nav className="flex-1 px-3 space-y-0.5">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-white/10">
              <p className="text-white/30 text-xs text-center">
                {session ? `Signed in as ${session.user?.email ?? ""}` : "Continue as guest"}
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
