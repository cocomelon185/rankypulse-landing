import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { OpportunitiesClient } from "@/components/app-pages/OpportunitiesClient";

export const metadata = { title: "SEO Opportunities — RankyPulse", robots: { index: false } };

export default async function OpportunitiesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/opportunities");
  return <OpportunitiesClient />;
}
