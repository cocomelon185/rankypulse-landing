import type { Metadata } from "next";
import BillingClientPage from "./BillingClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/billing" },
    robots: { index: true, follow: true },
  };
}

export default function BillingPage() {
  return <BillingClientPage />;
}
