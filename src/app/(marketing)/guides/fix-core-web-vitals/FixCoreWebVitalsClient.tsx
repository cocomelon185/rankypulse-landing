"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { BookOpen, Zap, AlertCircle, CheckCircle } from "lucide-react";

export default function FixCoreWebVitalsClient() {
  const metrics = [
    {
      name: "Largest Contentful Paint (LCP)",
      measures: "Load speed — when main content appears on screen",
      target: "Under 2.5 seconds",
      poor: "Over 4 seconds",
      issues: [
        "Slow server response times",
        "Render-blocking JavaScript/CSS",
        "Large unoptimized images",
        "Third-party scripts",
        "Client-side rendering delays",
      ],
      fixes: [
        "Enable server compression (gzip)",
        "Minimize and defer JavaScript",
        "Optimize and lazy-load images",
        "Use a CDN for static assets",
        "Upgrade server resources or use faster hosting",
        "Remove or defer third-party scripts",
      ],
    },
    {
      name: "First Input Delay (FID) / Interaction to Next Paint (INP)",
      measures: "Responsiveness — how quickly page responds to user input",
      target: "Under 100ms",
      poor: "Over 300ms",
      issues: [
        "Heavy JavaScript execution",
        "Main thread blocked by tasks",
        "Unoptimized event handlers",
        "Large JavaScript bundles",
        "Inefficient rendering logic",
      ],
      fixes: [
        "Break up long tasks into smaller chunks",
        "Defer non-critical JavaScript",
        "Use Web Workers for heavy computation",
        "Optimize event handlers and remove unused code",
        "Implement code splitting for faster downloads",
      ],
    },
    {
      name: "Cumulative Layout Shift (CLS)",
      measures: "Visual stability — prevents unexpected content shifts",
      target: "Under 0.1",
      poor: "Over 0.25",
      issues: [
        "Images without specified dimensions",
        "Ads and embeds without placeholders",
        "Fonts loading and changing layout",
        "Dynamically injected content",
        "DOM elements with late size discovery",
      ],
      fixes: [
        "Always specify width/height on images and videos",
        "Reserve space for ads and embeds",
        "Use font-display: swap for web fonts",
        "Add placeholders for dynamic content",
        "Avoid DOM mutations that shift layout",
      ],
    },
  ];

  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Zap className="h-7 w-7" />}
          title="How to Fix Core Web Vitals"
          subtitle="Master the three key metrics Google uses to rank pages. Improve LCP, FID, and CLS with actionable, proven tactics."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Introduction */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why Core Web Vitals Matter</h2>
            <p className="text-gray-600">
              Google has made it clear: Core Web Vitals directly impact rankings. Pages that score poorly on these metrics lose ranking positions, while pages that optimize them gain competitive advantage. Beyond SEO, improving these metrics also improves user experience and reduces bounce rates.
            </p>
            <p className="text-gray-600">
              Core Web Vitals measure three critical aspects of user experience: how fast your page loads (LCP), how quickly it responds to user input (FID/INP), and how stable it appears as it loads (CLS). This guide shows you exactly how to fix each metric.
            </p>
          </div>

          {/* Metrics Deep Dive */}
          <div className="space-y-8">
            {metrics.map((metric, idx) => (
              <Card key={idx} extra="p-6 border border-gray-200">
                <div className="mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{metric.measures}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-green-50 p-4">
                      <p className="text-xs font-semibold text-green-900 uppercase">Target (Good)</p>
                      <p className="mt-1 text-lg font-bold text-green-700">{metric.target}</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-4">
                      <p className="text-xs font-semibold text-red-900 uppercase">Poor</p>
                      <p className="mt-1 text-lg font-bold text-red-700">{metric.poor}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">Common Issues</h4>
                    <ul className="mt-3 space-y-2">
                      {metric.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <AlertCircle className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Fixes</h4>
                    <ul className="mt-3 space-y-2">
                      {metric.fixes.map((fix, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Wins */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick Wins (Do These First)</h2>
            <p className="mb-4 text-gray-600">
              These fixes have the biggest impact and take the least time:
            </p>
            <div className="space-y-3">
              {[
                "Compress images: Use modern formats (WebP) and tools like TinyPNG to reduce file sizes",
                "Lazy-load images: Load images only when they're about to appear on screen",
                "Minimize CSS/JavaScript: Remove unused code and defer non-critical JavaScript",
                "Enable gzip compression: Compress HTML, CSS, JS on your server",
                "Use a CDN: Distribute content from servers close to your users",
                "Specify image dimensions: Add width/height attributes to prevent layout shifts",
              ].map((win, idx) => (
                <Card key={idx} extra="p-4 border border-green-200 bg-green-50">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{win}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Testing Tools */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Tools to Measure & Improve</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: "PageSpeed Insights", description: "Free Google tool showing CWV scores and recommendations", link: "https://pagespeed.web.dev" },
                { name: "Google Search Console", description: "See real-user Core Web Vitals data for your site", link: "https://search.google.com/search-console" },
                { name: "WebPageTest", description: "Detailed performance waterfall and optimization recommendations", link: "https://webpagetest.org" },
                { name: "Chrome DevTools", description: "Inspect rendering, JavaScript execution, and resource loading", link: "https://developer.chrome.com/docs/devtools" },
              ].map((tool, idx) => (
                <Card key={idx} extra="p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{tool.description}</p>
                  <p className="mt-3 text-xs text-indigo-600">→ {tool.link}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Expected Timeline */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Timeline to Improvement</h2>
            <div className="space-y-4">
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Week 1: Quick Wins</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Image compression, lazy-loading, gzip compression. Expect 20-40% improvement in most metrics.
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Weeks 2-4: Medium Effort</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Code minification, JavaScript deferral, CSS optimization, CDN setup. Expected improvement: 40-60%.
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Months 2-3: Structural Changes</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Server upgrades, caching strategies, architectural improvements. Expected improvement: 60-90%+.
                </p>
              </Card>
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Pro Tips for Sustained Improvement</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Monitor continuously:</strong> Core Web Vitals change as you add content and features. Check monthly.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Use real-user data:</strong> Google Search Console shows real user metrics, not lab estimates.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Test on mobile:</strong> 70% of your users are on mobile. Optimize for mobile first.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Watch third-party code:</strong> Ad networks, analytics, and tracking scripts often tank Core Web Vitals.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Document baselines:</strong> Record your starting metrics so you can celebrate improvements.</span>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Get a Free Core Web Vitals Report</h3>
            <p className="mb-6 text-gray-600">
              RankyPulse measures your Core Web Vitals and gives specific optimization recommendations. Run a free audit today and see exactly what to fix.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/audit">
                <Button size="lg">Run Free Performance Audit</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">View Plans</Button>
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
