import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { WidgetSettingsForm } from "./widget-settings-form";
import { BillingSection } from "./billing-section";

export default async function RetailerSettingsPage() {
  const session = await getServerSession(authOptions);

  const retailer = await db.retailer.findUnique({
    where: { userId: session!.user.id },
    include: { widgetConfig: true, subscription: true },
  });

  if (!retailer) redirect("/auth/sign-up?role=retailer");

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account, billing, and widget configuration.</p>
      </div>

      <BillingSection
        plan={retailer.plan}
        status={retailer.subscription?.status ?? "trialing"}
        fittingsUsed={retailer.subscription?.fittingsUsed ?? 0}
        fittingsLimit={retailer.subscription?.fittingsLimit ?? 50}
        currentPeriodEnd={retailer.subscription?.currentPeriodEnd?.toISOString() ?? null}
        cancelAtPeriodEnd={retailer.subscription?.cancelAtPeriodEnd ?? false}
        trialEndsAt={retailer.trialEndsAt?.toISOString() ?? null}
      />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Widget Settings</h2>
        <WidgetSettingsForm retailer={retailer} widgetConfig={retailer.widgetConfig} />
      </div>
    </div>
  );
}
