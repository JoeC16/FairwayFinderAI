import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { WidgetSettingsForm } from "./widget-settings-form";

export default async function RetailerSettingsPage() {
  const session = await getServerSession(authOptions);

  const retailer = await db.retailer.findUnique({
    where: { userId: session!.user.id },
    include: { widgetConfig: true },
  });

  if (!retailer) redirect("/auth/sign-up?role=retailer");

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Widget Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Customise how the fitting tool looks on your website.</p>
      </div>
      <WidgetSettingsForm retailer={retailer} widgetConfig={retailer.widgetConfig} />
    </div>
  );
}
