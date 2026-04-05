import type { Metadata } from "next";
import ContactClientPage from "./ContactClientPage";
import { SEOContentWrapper } from "@/components/landing/SEOContentWrapper";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Contact RankyPulse | Questions & Feedback";
  const description =
    "Have a question or feedback? Send us a message — we usually reply within 1 business day.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/contact" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/contact",
      siteName: "RankyPulse",
      type: "website",
      images: [{ url: "https://rankypulse.com/og.jpg", width: 1200, height: 630, alt: "Contact RankyPulse" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og.jpg"],
    },
  };
}

export default function ContactPage() {
  return (
    <>
      <ContactClientPage />
      <SEOContentWrapper />
    </>
  );
}
