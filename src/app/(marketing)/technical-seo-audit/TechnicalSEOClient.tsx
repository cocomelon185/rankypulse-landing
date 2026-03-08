"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { Zap, CheckCircle, AlertCircle, TrendingUp, Code2, Layers } from "lucide-react";

export default function TechnicalSEOClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Code2 className="h-7 w-7" />}
          title="Technical SEO Audit"
          subtitle="Identify crawlability, indexation, and site structure issues that prevent your website from ranking. Get detailed recommendations to fix your technical foundation."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Hero Section */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">What is Technical SEO?</h2>
            <p className="text-gray-600">
              Technical SEO focuses on the backend structure and foundation of your website. It ensures that search engines can crawl, index, and understand your site properly. Without solid technical SEO, even great content struggles to rank because search engines can't properly analyze your pages.
            </p>
            <p className="text-gray-600">
              Our Technical SEO Audit identifies critical issues like broken redirects, duplicate content, slow page load times, mobile usability problems, XML sitemap errors, and robots.txt misconfiguration. We provide step-by-step fixes so you can resolve issues quickly.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Crawlability Analysis</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Find pages that search engines can't reach due to blocked resources, broken links, or redirect chains. We show exactly what prevents proper crawling.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Indexation Issues</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Detect duplicate content, noindex tags, meta robots blocks, and canonicalization errors preventing pages from being indexed.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Layers className="h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Site Structure Review</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Analyze your information architecture, URL structure, and internal linking patterns. We identify organizational improvements for better crawling.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 shrink-0 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Check page speed, Core Web Vitals, mobile-friendliness, and server response times that impact rankings and user experience.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 shrink-0 text-purple-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Redirect Chain Detection</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Find redirect chains (A→B→C), improper 301/302 usage, and missing WWW handling that waste crawl budget and slow ranking updates.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Code2 className="h-6 w-6 shrink-0 text-indigo-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Structured Data Validation</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Check Schema.org markup, JSON-LD implementation, and rich snippet eligibility to ensure search engines understand your content.
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
                  <h3 className="font-semibold text-gray-900">Enter Your Website URL</h3>
                  <p className="text-sm text-gray-600">
                    Simply paste your website URL and our crawler immediately begins analyzing your technical foundation.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Deep Technical Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Our system crawls key pages, checks redirects, validates metadata, tests mobile responsiveness, and measures performance metrics.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Get Detailed Report</h3>
                  <p className="text-sm text-gray-600">
                    Receive a comprehensive report with severity ratings, explanation of each issue, and copy-ready fixes you can implement immediately.
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
                <span>Site migration or domain change — verify redirects are set up correctly</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Website redesign — ensure crawlability is maintained during the relaunch</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Ranking drops — identify technical issues causing visibility loss</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Slow page speed — get performance optimization recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Low indexation — find and fix issues preventing pages from being indexed</span>
              </li>
            </ul>
          </div>

          {/* RankyPulse vs Competitors */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Why RankyPulse?</h2>
            <p className="mb-4 text-gray-600">
              While other tools provide basic technical checks, RankyPulse goes deeper with AI-powered insights and copy-ready fixes. We don't just tell you what's wrong — we tell you exactly how to fix it and why it matters for your rankings.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <Zap className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Copy-Ready Fixes:</strong> Not just problems listed, but exact solutions ready to implement</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Priority Ranking:</strong> Identify which issues have the biggest impact on rankings first</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Continuous Monitoring:</strong> Upgrade to track technical metrics over time and verify fixes work</span>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  What's the difference between technical SEO and on-page SEO?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Technical SEO focuses on site architecture, crawlability, and performance (redirects, speed, indexation). On-page SEO involves content optimization (keywords, titles, descriptions). Both are essential for ranking.
                </p>
              </details>
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  How long does an audit take?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Most audits complete in 2-5 minutes depending on site size. You'll get a comprehensive report instantly once the crawl is complete.
                </p>
              </details>
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  Can this audit find all my technical issues?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Our audit covers the most common and impactful technical issues. For extremely complex sites, you may want server log analysis as a supplement.
                </p>
              </details>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Run Free Technical Audit</Button>
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
