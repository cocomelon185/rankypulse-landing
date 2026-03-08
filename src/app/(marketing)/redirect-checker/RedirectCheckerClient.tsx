"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { ArrowRight, AlertTriangle, Zap, CheckCircle, Eye, Cpu } from "lucide-react";

export default function RedirectCheckerClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<ArrowRight className="h-7 w-7" />}
          title="Redirect Checker"
          subtitle="Validate 301 redirects, detect redirect chains, and ensure proper redirect setup. Preserve SEO value and prevent crawl budget waste from improper redirects."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Hero Section */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Master Redirects for Maximum SEO Impact</h2>
            <p className="text-gray-600">
              Redirects are critical when you change URLs, migrate domains, or restructure your site. Improper redirects waste search engine crawl budget, confuse visitors, and can cause you to lose hard-earned rankings. Redirect chains (A→B→C) and 302 temporary redirects are especially problematic.
            </p>
            <p className="text-gray-600">
              Our Redirect Checker validates your 301 redirects, detects redirect chains, checks for loops, and verifies proper HTTP status codes. Ensure every redirect properly preserves your SEO value and provides a seamless user experience.
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
                    <h3 className="font-semibold text-gray-900">301 Redirect Validation</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Verify that all your redirects use the proper 301 permanent redirect status code. Ensure users and search engines follow redirects correctly.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Redirect Chain Detection</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Find redirect chains (A→B→C) that waste crawl budget and slow down both users and search engines. Simplify them to direct redirects.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Cpu className="h-6 w-6 shrink-0 text-purple-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Redirect Loop Detection</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Identify redirect loops (A→B→A) that break your site. Our tool catches these errors before they impact users and search engines.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Eye className="h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Status Code Verification</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Check HTTP status codes (301 permanent, 302 temporary, 307, 308). Use the right code for your redirect purpose to preserve SEO value.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 shrink-0 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Speed Testing</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Measure redirect response times. Slow redirects frustrate users and impact Core Web Vitals. Find and fix performance issues.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-6 w-6 shrink-0 text-indigo-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Final Destination Tracking</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Follow the complete redirect path to the final destination. Ensure users end up where you intend, not on error pages.
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
                  <h3 className="font-semibold text-gray-900">Enter Your Old or New URL</h3>
                  <p className="text-sm text-gray-600">
                    Provide any URL and our tool follows the redirect path step-by-step.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Trace Redirect Path</h3>
                  <p className="text-sm text-gray-600">
                    We follow every redirect hop, checking status codes and response times at each step.
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
                    See where problems exist and get recommendations for optimizing your redirect strategy.
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
                <span>Domain migration — verify all old URLs properly redirect to the new domain</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>URL restructuring — ensure old URLs redirect correctly to new structure</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>HTTPS migration — verify HTTP→HTTPS redirects preserve rankings</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Content consolidation — check redirects after merging pages</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Troubleshooting — debug redirect issues causing 404s or timeouts</span>
              </li>
            </ul>
          </div>

          {/* RankyPulse vs Competitors */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Why RankyPulse?</h2>
            <p className="mb-4 text-gray-600">
              Basic redirect checkers just follow the path. RankyPulse tells you if your redirects are SEO-friendly, performance-optimized, and not wasting crawl budget.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>SEO Analysis:</strong> Know if your redirects preserve page authority properly</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Batch Checking:</strong> Upgrade to check dozens of redirects at once</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Performance Monitoring:</strong> Track redirect speed over time and get alerts</span>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  What's the difference between 301 and 302 redirects?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  301 is permanent (transfers authority), 302 is temporary (keeps authority with old URL). Always use 301 for permanent moves to preserve SEO value.
                </p>
              </details>
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  How long do redirects take to preserve rankings?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Google can transfer authority with a 301 immediately, but full ranking recovery may take weeks as Google re-crawls and re-indexes. Use proper 301s.
                </p>
              </details>
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  Are redirect chains bad?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Yes. Chains waste crawl budget and slow everyone down. Always point directly to the final destination with a single 301 redirect.
                </p>
              </details>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Check Your Redirects Free</Button>
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
