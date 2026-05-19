import { redirect } from "next/navigation";

// Kick off a new session server-side and redirect to the wizard
export default async function FittingStartPage({
  searchParams,
}: {
  searchParams: Promise<{ retailer?: string }>;
}) {
  const { retailer } = await searchParams;

  // Create session via server action would be ideal, but for this route
  // we redirect to a loading page that creates the session client-side.
  redirect(`/fitting/new${retailer ? `?retailer=${retailer}` : ""}`);
}
