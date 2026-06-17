"use client";

import { useState } from "react";
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
  Megaphone,
  Link2,
  ChevronRight,
  X,
  Menu,
  ArrowLeftRight,
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
  { href: "/admin/promoters", label: "Promoters", icon: Megaphone },
  { href: "/admin/referrals", label: "Referrals", icon: Link2 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const ADMIN_PORTAL_LINKS = [
  { href: "/admin/dashboard", label: "Admin Portal", icon: Shield },
  { href: "/retailer/dashboard", label: "Retailer Portal", icon: ShoppingBag },
  { href: "/dashboard", label: "Consumer Portal", icon: User },
];

function SidebarContent({ role, pathname, onNavClick }: { role: string; pathname: string; onNavClick?: () => void }) {
  const navItems =
    role === "ADMIN"
      ? pathname.startsWith("/retailer") ? RETAILER_NAV
        : pathname.startsWith("/dashboard") ? CONSUMER_NAV
        : ADMIN_NAV
      : role === "RETAILER" ? RETAILER_NAV
      : CONSUMER_NAV;

  const activePortalLabel =
    role === "ADMIN"
      ? pathname.startsWith("/retailer") ? "Retailer Portal"
        : pathname.startsWith("/dashboard") ? "Consumer Portal"
        : "Admin Portal"
      : role === "RETAILER" ? "Retailer Portal"
      : "My Account";

  return (
    <>
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavClick}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 2v20M3 7l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-white font-bold">FairwayFit <span className="text-gold-400">AI</span></span>
        </Link>
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
          {activePortalLabel === "Admin Portal" && <Shield className="h-3.5 w-3.5 text-gold-400" />}
          {activePortalLabel === "Retailer Portal" && <ShoppingBag className="h-3.5 w-3.5 text-gold-400" />}
          {(activePortalLabel === "Consumer Portal" || activePortalLabel === "My Account") && <User className="h-3.5 w-3.5 text-gold-400" />}
          <span className="text-white/60 text-xs font-medium">{activePortalLabel}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
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

      {role === "CONSUMER" && (
        <div className="p-4 border-t border-white/10">
          <Link
            href="/fitting"
            onClick={onNavClick}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-sm font-semibold transition-colors"
          >
            + New Fitting
          </Link>
        </div>
      )}

      {role === "ADMIN" && (
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-1.5 px-2 mb-2">
            <ArrowLeftRight className="h-3 w-3 text-white/40" />
            <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Switch Portal</span>
          </div>
          <div className="space-y-0.5">
            {ADMIN_PORTAL_LINKS.map(({ href, label, icon: Icon }) => {
              const isCurrent = activePortalLabel === label;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    isCurrent
                      ? "bg-gold-500/20 text-gold-300"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                  {isCurrent && <span className="ml-auto text-gold-400/60 text-xs">current</span>}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export function DashboardSidebar({ role }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-brand-900 min-h-screen">
        <SidebarContent role={role} pathname={pathname} />
      </aside>

      {/* Mobile hamburger button — rendered in the nav bar slot via a portal-like approach */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-900 text-white shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex w-72 flex-col bg-brand-900 min-h-screen shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent role={role} pathname={pathname} onNavClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
