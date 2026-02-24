import type { Metadata } from "next";
import ContactClientPage from "./ContactClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Contact | RankyPulse";
  const description =
    "Have a question or feedback? Send us a message — we usually reply within 1 business day.";

  return {
    title,
    description,
    alternates: { canonical: "/contact" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/contact",
      siteName: "RankyPulse",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ContactPage() {
  return <ContactClientPage />;
}
