import type { Metadata } from "next";
import DashboardClientPage from "./DashboardClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/dashboard" },
    robots: { index: true, follow: true },
  };
}

export default function DashboardPage() {
  return <DashboardClientPage />;
}
