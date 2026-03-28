import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin-access";
import { DataProviderDiagnosticsClient } from "@/components/app-pages/DataProviderDiagnosticsClient";

export const metadata = {
  title: "Data Provider Diagnostics — RankyPulse",
  robots: { index: false },
};

export default async function DataProviderDiagnosticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/app/settings/data-provider");
  }
  if (!isAdminSession(session)) {
    redirect("/app/settings");
  }

  return <DataProviderDiagnosticsClient />;
}
