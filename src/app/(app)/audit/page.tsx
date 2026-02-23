import type { Metadata } from "next";
import AuditClientPage from "./AuditClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/audit" },
    robots: { index: true, follow: true },
  };
}

export default function AuditPage() {
  return <AuditClientPage />;
}
