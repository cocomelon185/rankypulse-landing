"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { CheckCircle, BookOpen } from "lucide-react";

export default function TechnicalSEOChecklistClient() {
  const checklistItems = [
    { category: "Site Architecture", items: ["XML sitemap created and submitted to Google Search Console", "Robots.txt file optimized and tested", "Clear URL structure with logical hierarchy", "Mobile-friendly responsive design", "HTTPS/SSL certificate properly installed"] },
    { category: "Page Speed & Performance", items: ["Core Web Vitals (LCP, FID, CLS) optimized", "Images compressed and lazy-loaded", "CSS/JavaScript minified", "Browser caching enabled", "Server response time under 200ms", "CDN implemented for global performance"] },
    { category: "Crawlability & Indexation", items: ["No blocking of resources in robots.txt", "No noindex tags on important pages", "Duplicate content identified and consolidated", "Canonicalization properly implemented", "Proper redirects (301) for old URLs", "Internal linking structure clear and logical"] },
    { category: "Mobile & User Experience", items: ["Viewport meta tag implemented", "Mobile menu and navigation easy to use", "Font sizes readable on mobile", "Form fields easy to fill on mobile", "No intrusive interstitials blocking content", "Page elements not overlapping on small screens"] },
    { category: "Structured Data & Markup", items: ["Schema.org markup implemented where relevant", "JSON-LD used for structured data", "Rich snippets eligibility verified", "No structured data validation errors", "BreadcrumbList markup for navigation", "Organization/Business schema complete"] },
    { category: "On-Page Elements", items: ["Unique title tags (50-60 characters)", "Meta descriptions (155-160 characters)", "H1 tag present and optimized", "Proper heading hierarchy (H1, H2, H3)", "Alt text on all important images", "Meta robots tags correct"] },
    { category: "Links & Redirects", items: ["No broken internal links", "Redirect chains eliminated", "No redirect loops", "External links open in appropriate way", "Anchor text descriptive and relevant", "No excessive 302 temporary redirects"] },
    { category: "Security & Trust", items: ["HTTPS everywhere (no mixed content)", "Security certificate valid and current", "No malware or hacking issues", "Privacy policy and terms accessible", "Contact information visible", "Regular security audits conducted"] },
  ];

  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<BookOpen className="h-7 w-7" />}
          title="Technical SEO Checklist"
          subtitle="A complete, actionable checklist to ensure your website's technical foundation is optimized for search engines and users."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Introduction */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why Technical SEO Matters</h2>
            <p className="text-gray-600">
              Technical SEO is the foundation of everything else. Without a solid technical foundation, your great content struggles to be discovered and ranked. Google can't properly crawl your site, users have a poor experience, and your rankings suffer.
            </p>
            <p className="text-gray-600">
              This comprehensive checklist covers all critical technical SEO elements. Use it to audit your site, identify gaps, and prioritize fixes. Most sites have 5-10 fixable technical issues that, once resolved, noticeably improve rankings.
            </p>
          </div>

          {/* Complete Checklist */}
          <div>
            <h2 className="mb-8 text-2xl font-bold text-gray-900">Complete Technical SEO Checklist</h2>
            <div className="space-y-8">
              {checklistItems.map((section) => (
                <Card key={section.category} extra="p-6 border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">{section.category}</h3>
                  <ul className="space-y-3">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1 shrink-0" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          {/* Key Concepts */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Technical SEO Concepts</h2>
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">Crawlability</h3>
                <p className="text-sm text-gray-600">
                  How easily search engines can discover and access your pages. Key factors: no robots.txt blocking, no 429 rate limiting, clear site structure, and proper redirects.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">Indexation</h3>
                <p className="text-sm text-gray-600">
                  Whether pages actually get indexed by search engines. Verify via Google Search Console. Issues: noindex tags, duplicate content, meta robots blocks, or insufficient authority.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">Core Web Vitals</h3>
                <p className="text-sm text-gray-600">
                  Google's metrics for user experience: LCP (load speed), FID (interactivity), and CLS (visual stability). Poor vitals hurt both rankings and user satisfaction.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">Site Architecture</h3>
                <p className="text-sm text-gray-600">
                  How pages are organized and connected. Good architecture: clear hierarchy, logical URL structure, internal linking patterns that reflect importance, breadcrumb navigation.
                </p>
              </div>
            </div>
          </div>

          {/* Priority Fixes */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Priority Technical SEO Fixes</h2>
            <p className="mb-4 text-gray-600">
              Start here if your site has many issues. These have the biggest immediate impact:
            </p>
            <div className="space-y-4">
              {[
                { title: "Fix Critical Core Web Vitals Issues", description: "LCP over 4 seconds, CLS over 0.25, or FID over 300ms. Impact: Rankings and user experience" },
                { title: "Eliminate Broken Internal Links", description: "Find and fix 404s from internal linking. These waste crawl budget and confuse users." },
                { title: "Consolidate Duplicate Content", description: "Use canonical tags or 301 redirects to consolidate similar pages under one URL." },
                { title: "Optimize XML Sitemap", description: "Ensure it includes important pages, excludes duplicates, and is submitted to Search Console." },
                { title: "Fix Mobile Usability Issues", description: "Test on mobile devices. Fix font sizes, button spacing, form fields, and viewport issues." },
              ].map((fix, idx) => (
                <Card key={idx} extra="p-6 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{fix.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{fix.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Tools & Resources */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Tools to Help</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card extra="p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900">Google Search Console</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Free Google tool showing indexation status, crawl errors, Core Web Vitals data, and manual actions. Essential for technical SEO.
                </p>
              </Card>
              <Card extra="p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900">PageSpeed Insights</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Free tool from Google showing Core Web Vitals and performance recommendations for mobile and desktop.
                </p>
              </Card>
              <Card extra="p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900">RankyPulse</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Automated technical audit covering all checklist items. Get copy-ready fixes for every issue found.
                </p>
              </Card>
              <Card extra="p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900">Screaming Frog SEO Spider</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Desktop crawler showing broken links, redirects, duplicate titles, and site structure issues in detail.
                </p>
              </Card>
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Pro Tips for Technical SEO Success</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Test on real mobile devices:</strong> Chrome DevTools mobile emulation doesn't catch everything. Test on actual phones.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Monitor regularly:</strong> Technical issues emerge over time. Audit quarterly and after major changes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Prioritize by impact:</strong> Not all issues are equal. Fix high-impact issues first (Core Web Vitals, broken links).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Document changes:</strong> Track what you fixed and when. Helps identify patterns and measure progress.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Automate monitoring:</strong> Use tools to continuously monitor for new technical issues. Don't wait for manual audits.</span>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Use RankyPulse to Audit Your Technical SEO</h3>
            <p className="mb-6 text-gray-600">
              Don't manually check everything on this checklist. Run our free technical SEO audit and get a detailed report with copy-ready fixes for every issue.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/audit">
                <Button size="lg">Run Free Technical Audit</Button>
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
