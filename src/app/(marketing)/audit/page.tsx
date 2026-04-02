import type { Metadata } from "next";
import Link from "next/link";
import AuditHubClientPage from "./AuditHubClientPage";

export const metadata: Metadata = {
  title: { absolute: "Free SEO Audit Tool | Website SEO Checker | RankyPulse" },
  description:
    "Browse SEO audit guides by niche and platform. WordPress, Shopify, e‑commerce, local SEO, and more. Run a free audit in 30 seconds.",
  alternates: { canonical: "/audit" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "SEO Audit Guides | Run a Free Audit | RankyPulse",
    description:
      "Browse SEO audit guides by niche and platform. Run a free audit in 30 seconds. No signup required.",
    url: "/audit",
    siteName: "RankyPulse",
    type: "website",
    images: [{ url: "https://rankypulse.com/og.jpg", width: 1200, height: 630, alt: "RankyPulse — Audit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Audit Guides | Run a Free Audit | RankyPulse",
    description:
      "Browse SEO audit guides by niche and platform. Run a free audit in 30 seconds.",
  },
};

const POPULAR_REPORTS = [
  { domain: "shopify.com", label: "Shopify" },
  { domain: "wordpress.com", label: "WordPress" },
  { domain: "webflow.com", label: "Webflow" },
  { domain: "wix.com", label: "Wix" },
  { domain: "squarespace.com", label: "Squarespace" },
  { domain: "github.com", label: "GitHub" },
  { domain: "hubspot.com", label: "HubSpot" },
  { domain: "mailchimp.com", label: "Mailchimp" },
  { domain: "canva.com", label: "Canva" },
  { domain: "figma.com", label: "Figma" },
  { domain: "stripe.com", label: "Stripe" },
  { domain: "vercel.com", label: "Vercel" },
  { domain: "netlify.com", label: "Netlify" },
  { domain: "notion.so", label: "Notion" },
  { domain: "ahrefs.com", label: "Ahrefs" },
  { domain: "semrush.com", label: "SEMrush" },
  { domain: "moz.com", label: "Moz" },
  { domain: "medium.com", label: "Medium" },
];

export default function AuditHubPage() {
  return (
    <>
      <AuditHubClientPage />
      {/* Popular Reports — server-rendered for crawlers, gives each report page 2+ incoming links */}
      <section className="mx-auto max-w-5xl px-6 py-12 border-t border-white/5">
        <h2 className="mb-2 text-xl font-bold text-white">Popular SEO Audit Reports</h2>
        <p className="mb-6 text-sm text-gray-400">See real audit scores for well-known sites. Free, instant, no signup.</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {POPULAR_REPORTS.map(({ domain, label }) => (
            <Link
              key={domain}
              href={`/report/${domain}`}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-center text-sm font-medium text-gray-300 hover:border-indigo-500/40 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
