import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAuditLanding } from "@/lib/pseo/auditPages";
import { Check } from "lucide-react";
import { AuditCtaForm } from "../AuditCtaForm";
import { clampTitle, clampDesc } from "@/lib/metadata";
import { SEOContentWrapper } from "@/components/landing/SEOContentWrapper";

const BASE_URL = "https://rankypulse.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getAuditLanding(slug);
  if (!page) return { title: "Not Found" };

  const canonical = `/audit/${slug}`;
  const title = clampTitle(page.metaTitle);
  const description = clampDesc(page.metaDescription);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "RankyPulse",
      type: "article",
      images: [{ url: `${BASE_URL}/og.jpg`, width: 1200, height: 630, alt: page.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  const { getAllAuditLandings } = await import("@/lib/pseo/auditPages");
  return getAllAuditLandings().map((p) => ({ slug: p.slug }));
}

function FaqSchema({ faqs }: { faqs: { q: string; a: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export default async function AuditSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = getAuditLanding(slug);
  if (!page) notFound();

  const relatedPages = page.relatedSlugs
    .map((s) => getAuditLanding(s))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <div className="page-shell">
      <Navbar />
      <main className="min-h-screen">
        <article className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
          <header className="mb-10">
            <Link
              href="/audit"
              className="mb-4 inline-block text-sm font-medium text-[#4318ff] hover:underline"
            >
              ← All audit guides
            </Link>
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-[#1B2559] md:text-4xl">
              {page.title}
            </h1>
            <p className="text-lg text-gray-600">{page.intro}</p>
          </header>

          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-[#1B2559]">Why run an audit?</h2>
            <ul className="space-y-3">
              {page.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4318ff]/10 text-[#4318ff]">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-gray-700">{b}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12 rounded-2xl border border-gray-200 bg-[#f8fafc] p-6 md:p-8">
            <h2 className="mb-4 text-xl font-semibold text-[#1B2559]">Run a free audit</h2>
            <p className="mb-6 text-gray-600">
              Enter your website URL to get an actionable SEO score and prioritized fixes in under 30
              seconds.
            </p>
            <AuditCtaForm />
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-xl font-semibold text-[#1B2559]">Frequently asked questions</h2>
            <dl className="space-y-6">
              {page.faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <dt className="mb-2 font-medium text-[#1B2559]">{faq.q}</dt>
                  <dd className="text-gray-600">{faq.a}</dd>
                </div>
              ))}
            </dl>
            <FaqSchema faqs={page.faqs} />
          </section>

          <aside className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1B2559]">Related audit guides</h2>
            <ul className="space-y-2">
              {relatedPages.slice(0, 5).map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/audit/${p.slug}`}
                    className="text-[#4318ff] hover:underline"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/pricing"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#4318ff]"
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#4318ff]"
              >
                Contact
              </Link>
            </div>
          </aside>
        </article>
      </main>
      <SEOContentWrapper />
      <Footer />
    </div>
  );
}
