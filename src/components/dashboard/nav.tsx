"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null; role: string };
}

export function DashboardNav({ user }: Props) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="lg:hidden w-9" /> {/* spacer for mobile menu button */}
        <div className="hidden sm:block">
          <p className="text-sm text-gray-500">Welcome back,</p>
          <p className="text-sm font-semibold text-gray-900 -mt-0.5">{user.name ?? user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-800 text-white text-sm font-bold">
                {(user.name ?? user.email ?? "U")[0].toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{user.name ?? "User"}</p>
                <p className="text-xs text-gray-400 leading-tight">{user.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-600 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
