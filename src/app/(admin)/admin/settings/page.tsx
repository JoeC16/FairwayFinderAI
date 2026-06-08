import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Globe, Shield } from "lucide-react";

export default async function AdminSettingsPage() {
  const [userCount, retailerCount, productCount, sessionCount] = await Promise.all([
    db.user.count(),
    db.retailer.count(),
    db.product.count(),
    db.fittingSession.count(),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Platform configuration and system status</p>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
          <Database className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Database Stats</h2>
          <Badge variant="success" className="ml-auto text-xs">Connected</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-50">
          {[
            { label: "Users", value: userCount },
            { label: "Retailers", value: retailerCount },
            { label: "Products", value: productCount },
            { label: "Sessions", value: sessionCount },
          ].map(({ label, value }) => (
            <div key={label} className="p-5 text-center">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Environment */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
          <Globe className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Environment</h2>
        </div>
        <div className="p-6 space-y-3">
          {[
            { key: "App URL", value: process.env.NEXT_PUBLIC_APP_URL ?? "Not set" },
            { key: "Stripe", value: process.env.STRIPE_SECRET_KEY ? "Configured" : "Not configured" },
            { key: "Email (SMTP)", value: process.env.SMTP_PASS ? "Configured" : "Not configured" },
            { key: "Anthropic AI", value: process.env.ANTHROPIC_API_KEY ? "Configured" : "Not configured" },
          ].map(({ key, value }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{key}</span>
              <Badge
                variant={value.includes("Not") ? "secondary" : "success"}
                className="text-xs"
              >
                {value}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
          <Shield className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Security</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Admin bootstrap endpoint</span>
            <Badge variant={userCount > 0 ? "success" : "warning"} className="text-xs">
              {userCount > 0 ? "Disabled (admin exists)" : "Active — create admin first"}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">NextAuth secret</span>
            <Badge variant={process.env.NEXTAUTH_SECRET ? "success" : "destructive"} className="text-xs">
              {process.env.NEXTAUTH_SECRET ? "Set" : "Missing"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
          <Settings className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Platform Info</h2>
        </div>
        <div className="p-6 space-y-2 text-sm text-gray-500">
          <p>FairwayFit AI — Golf Club Fitting SaaS</p>
          <p>Built with Next.js 15 · Prisma · PostgreSQL · Stripe · Anthropic Claude</p>
        </div>
      </div>
    </div>
  );
}
