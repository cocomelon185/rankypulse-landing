"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { Link2, AlertTriangle, Lightbulb, TrendingUp, MapPin, CheckCircle } from "lucide-react";

export default function InternalLinkCheckerClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Link2 className="h-7 w-7" />}
          title="Internal Link Checker"
          subtitle="Discover broken internal links, orphaned pages with no internal links, and linking opportunities. Strengthen your site's crawlability and authority distribution."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Hero Section */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Optimize Your Internal Linking Structure</h2>
            <p className="text-gray-600">
              Internal links are the glue that holds your site together. They help search engines discover all your pages, establish site hierarchy, and distribute authority to important content. A broken or poorly planned internal linking structure wastes SEO potential and frustrates visitors.
            </p>
            <p className="text-gray-600">
              Our Internal Link Checker identifies broken links that lead to 404 errors, finds orphaned pages with no internal links, and reveals linking opportunities to strengthen your site's structure. Improve crawlability, user experience, and ranking potential in minutes.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Broken Link Detection</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Find all internal links pointing to broken pages (404 errors, redirects, removed content). See exactly which pages contain the broken links.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 shrink-0 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Orphaned Pages Discovery</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Identify pages with no internal links from other pages. These orphaned pages are harder to discover and might not be indexed properly.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-6 w-6 shrink-0 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Linking Opportunities</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Find relevant pages that should link to each other based on topic. Close gaps in your internal linking strategy.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Link Flow Analysis</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      See how authority flows through your site via internal links. Identify pages that should get more prominent linking for better ranking potential.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Link2 className="h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Anchor Text Review</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Check anchor text quality and relevance. Ensure your link text provides context to both users and search engines.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Visual Site Map</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      See a visual representation of how pages connect. Understand your site structure and identify weak connections.
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
                  <h3 className="font-semibold text-gray-900">Submit Your URL</h3>
                  <p className="text-sm text-gray-600">
                    Enter your website URL and we begin crawling all pages and their internal links.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Complete Link Analysis</h3>
                  <p className="text-sm text-gray-600">
                    We analyze every internal link, check for broken destinations, and map your site's linking structure.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Get Actionable Report</h3>
                  <p className="text-sm text-gray-600">
                    Receive detailed recommendations for fixing broken links, optimizing structure, and adding strategic internal links.
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
                <span>Large site maintenance — regularly check for broken links and orphaned pages</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Content reorganization — verify linking integrity after moving or deleting pages</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Site migration — ensure all internal links are preserved and working</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>SEO strategy improvement — identify opportunities to strengthen your internal link architecture</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Authority distribution — optimize linking to boost rankings of important pages</span>
              </li>
            </ul>
          </div>

          {/* RankyPulse vs Competitors */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Why RankyPulse?</h2>
            <p className="mb-4 text-gray-600">
              While generic link checkers find problems, RankyPulse helps you understand the impact and shows you exactly where to add strategic links for maximum SEO benefit.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Priority Ranking:</strong> See which broken links have the biggest impact on SEO</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Suggestions:</strong> Get specific pages you should link together</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Authority Flow:</strong> Understand how link juice flows through your site</span>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  Do broken internal links affect SEO?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Yes, significantly. Broken links hurt user experience, waste crawl budget, and can prevent important pages from being indexed. Always fix them.
                </p>
              </details>
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  How many internal links should each page have?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  There's no magic number, but 3-5 contextual internal links per page is typical. More links dilute authority; too few leaves crawling potential untapped.
                </p>
              </details>
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  What are orphaned pages and how bad are they?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Orphaned pages have no internal links from other pages. They're harder for search engines to find and harder for users to discover. Consider linking to them if they're valuable.
                </p>
              </details>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Run Free Link Audit</Button>
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
