"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, User, Settings, LogOut, LayoutDashboard, Package } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-900/95 backdrop-blur supports-[backdrop-filter]:bg-brand-900/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 2v20M3 7l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">
            FairwayFit <span className="text-gold-400">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/fitting" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            Start Fitting
          </Link>
          <Link href="/swing-analysis" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            Swing Analyser
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/pricing#retailers" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            For Retailers
          </Link>
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{session.user.name ?? session.user.email}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {(session.user.role === "RETAILER" || session.user.role === "ADMIN") && (
                  <DropdownMenuItem asChild>
                    <Link href="/retailer/dashboard" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Retailer Portal
                    </Link>
                  </DropdownMenuItem>
                )}
                {session.user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
              <Button variant="gold" asChild size="sm">
                <Link href="/fitting">Start Free Fitting</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-brand-900 px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/fitting" className="text-white/80 hover:text-white py-2" onClick={() => setMobileOpen(false)}>
              Start Fitting
            </Link>
            <Link href="/swing-analysis" className="text-white/80 hover:text-white py-2" onClick={() => setMobileOpen(false)}>
              Swing Analyser
            </Link>
            <Link href="/pricing" className="text-white/80 hover:text-white py-2" onClick={() => setMobileOpen(false)}>
              Pricing
            </Link>
            <Link href="/about" className="text-white/80 hover:text-white py-2" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <div className="border-t border-white/10 pt-3 mt-2 flex flex-col gap-2">
              {session ? (
                <>
                  <Button variant="ghost" className="text-white justify-start" asChild>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-red-400 justify-start"
                    onClick={() => { signOut(); setMobileOpen(false); }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="text-white justify-start" asChild>
                    <Link href="/auth/sign-in" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  </Button>
                  <Button variant="gold" asChild>
                    <Link href="/fitting" onClick={() => setMobileOpen(false)}>Start Free Fitting</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
