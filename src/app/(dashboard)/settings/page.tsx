import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, CreditCard, Bell } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  const user = await db.user.findUnique({
    where: { id: session!.user.id },
    include: { subscription: true },
  });

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences.</p>
      </div>

      {/* Plan */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50">
            <CreditCard className="h-5 w-5 text-gold-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Subscription</h2>
            <p className="text-sm text-gray-400">Manage your plan</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900 capitalize">{user.subscription?.plan ?? "Free"} Plan</p>
            <p className="text-xs text-gray-400 capitalize">{user.subscription?.status ?? "active"}</p>
          </div>
          <Badge variant="brand" className="capitalize text-xs">
            {user.subscription?.plan ?? "free"}
          </Badge>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
            <Shield className="h-5 w-5 text-brand-700" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Security</h2>
            <p className="text-sm text-gray-400">Password and authentication</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <Badge variant="success" className="text-xs">Verified</Badge>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Password</p>
              <p className="text-xs text-gray-400">{user.password ? "Set" : "Using social login"}</p>
            </div>
            {user.password && (
              <Button size="sm" variant="outline">Change</Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-400">Email preferences</p>
          </div>
        </div>
        <p className="text-sm text-gray-400">Notification preferences coming soon.</p>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
        <h2 className="font-semibold text-red-900 mb-1">Danger Zone</h2>
        <p className="text-sm text-red-700 mb-4">Permanently delete your account and all associated data.</p>
        <Button variant="destructive" size="sm">Delete Account</Button>
      </div>
    </div>
  );
}
