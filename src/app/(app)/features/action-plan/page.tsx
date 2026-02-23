import type { Metadata } from "next";
import ActionPlanClientPage from "./ActionPlanClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/features/action-plan" },
    robots: { index: true, follow: true },
  };
}

export default function ActionPlanPage() {
  return <ActionPlanClientPage />;
}
