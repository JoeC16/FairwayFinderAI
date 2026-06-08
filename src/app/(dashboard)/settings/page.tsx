import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Bell, Shield } from "lucide-react";
import { SettingsSecurityClient } from "./settings-security-client";

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

      {/* Security — client component so it can open modals */}
      <SettingsSecurityClient
        email={user.email!}
        hasPassword={!!user.password}
        userId={user.id}
      />

      {/* Notifications */}
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
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-900">Fitting complete emails</p>
            <p className="text-xs text-gray-400">Get notified when your AI report is ready</p>
          </div>
          <Badge variant="success" className="text-xs">On</Badge>
        </div>
      </div>
    </div>
  );
}
