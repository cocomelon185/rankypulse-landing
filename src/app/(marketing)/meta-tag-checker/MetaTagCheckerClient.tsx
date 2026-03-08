"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { Eye, Share2, Search, AlertCircle, CheckCircle, Tag } from "lucide-react";

export default function MetaTagCheckerClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Tag className="h-7 w-7" />}
          title="Meta Tag Checker"
          subtitle="Validate your title tags, meta descriptions, Open Graph tags, and Twitter cards. Ensure optimal appearance in search results and social media sharing."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Hero Section */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Master Your Meta Tags</h2>
            <p className="text-gray-600">
              Meta tags are the first impression your content makes. They appear in search results, browser tabs, and social media previews. Poorly optimized meta tags reduce click-through rates and hurt social sharing performance. Our Meta Tag Checker helps you optimize every tag for maximum impact.
            </p>
            <p className="text-gray-600">
              Check title tag length, meta description optimization, Open Graph implementation, Twitter card formatting, and much more. Get instant recommendations to improve your click-through rates and social sharing.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Search className="h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Title Tag Analysis</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Check optimal length (50-60 characters), keyword placement, and uniqueness. Ensure your titles stand out in search results and aren't truncated on mobile.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Eye className="h-6 w-6 shrink-0 text-purple-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Meta Description Review</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Verify length (155-160 characters), keyword inclusion, and compelling copy. We show you exactly how it appears in search results.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Share2 className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">OG Tag Generator</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Check Open Graph tags for Facebook, LinkedIn, and Pinterest sharing. Validate og:title, og:image, og:description, and og:url implementation.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Share2 className="h-6 w-6 shrink-0 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Twitter Card Validation</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Verify twitter:card type, twitter:title, twitter:description, and twitter:image. Optimize how your content appears when shared on Twitter.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Duplicate Detection</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Find duplicate title tags and meta descriptions across your site. Ensure uniqueness for better CTR and search engine understanding.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-Time Preview</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      See exactly how your titles and descriptions appear in Google search results, Facebook, Twitter, and LinkedIn before publishing.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">How It Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Enter Page URL</h3>
                  <p className="text-sm text-gray-600">
                    Simply paste the URL of any page and our tool crawls the meta tags instantly.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Extract & Analyze</h3>
                  <p className="text-sm text-gray-600">
                    We extract all meta tags (title, description, OG tags, Twitter cards) and check them against SEO best practices.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Get Recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Receive actionable recommendations with before/after previews so you know exactly what to change.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Common Use Cases</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Improving click-through rates — optimize titles and descriptions for better appearance in search results</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Social media sharing — ensure beautiful previews on Facebook, LinkedIn, and Twitter</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Consistency audits — find duplicate titles and descriptions across your site</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Content optimization — audit tags before publishing or after updates</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Brand monitoring — verify your brand's meta tags on competitor sites</span>
              </li>
            </ul>
          </div>

          {/* RankyPulse vs Competitors */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Why RankyPulse?</h2>
            <p className="mb-4 text-gray-600">
              Other tools show you what's missing. RankyPulse shows you exactly how to fix it with clear, actionable recommendations and side-by-side previews of your changes.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Real Preview:</strong> See exactly how your tags appear in Google, Facebook, and Twitter</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Batch Checking:</strong> Upgrade to check meta tags across entire categories</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Social Analytics:</strong> Track how your meta optimization affects social shares over time</span>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  What's the ideal meta description length?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Most devices show 155-160 characters. Our tool shows you the exact length and how it appears on desktop, mobile, and tablets.
                </p>
              </details>
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  Do meta tags directly affect Google rankings?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Meta descriptions don't directly affect rankings but impact click-through rates. Title tags do influence ranking potential. Both affect user behavior significantly.
                </p>
              </details>
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  Which is more important: title tags or meta descriptions?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Both matter. Title tags affect rankings and appear in tabs/search results. Meta descriptions don't affect rankings but drive clicks. Optimize both.
                </p>
              </details>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Run Free Meta Check</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">View Plans</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
