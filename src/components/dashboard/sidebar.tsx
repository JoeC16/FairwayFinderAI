"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  User,
  Settings,
  Package,
  Users,
  BarChart3,
  ShoppingBag,
  Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  role: string;
}

const CONSUMER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/fittings", label: "My Fittings", icon: ClipboardList },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const RETAILER_NAV = [
  { href: "/retailer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/retailer/inventory", label: "Inventory", icon: Package },
  { href: "/retailer/leads", label: "Leads", icon: Users },
  { href: "/retailer/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/retailer/settings", label: "Settings", icon: Settings },
];

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/retailers", label: "Retailers", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ role }: Props) {
  const pathname = usePathname();

  const navItems =
    role === "ADMIN" ? ADMIN_NAV :
    role === "RETAILER" ? RETAILER_NAV :
    CONSUMER_NAV;

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-brand-900 min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 2v20M3 7l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-white font-bold">FairwayFit <span className="text-gold-400">AI</span></span>
        </Link>
      </div>

      {/* Role indicator */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
          {role === "ADMIN" && <Shield className="h-3.5 w-3.5 text-gold-400" />}
          {role === "RETAILER" && <ShoppingBag className="h-3.5 w-3.5 text-gold-400" />}
          {role === "CONSUMER" && <User className="h-3.5 w-3.5 text-gold-400" />}
          <span className="text-white/60 text-xs font-medium">
            {role === "ADMIN" ? "Admin Portal" : role === "RETAILER" ? "Retailer Portal" : "My Account"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Start fitting CTA */}
      {role === "CONSUMER" && (
        <div className="p-4 border-t border-white/10">
          <Link
            href="/fitting"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-sm font-semibold transition-colors"
          >
            + New Fitting
          </Link>
        </div>
      )}
    </aside>
  );
}
