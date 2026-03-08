"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { Zap, CheckCircle, AlertCircle, TrendingUp, Search, BarChart3, Code2 } from "lucide-react";

export default function SEOAuditToolClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Search className="h-7 w-7" />}
          title="Free SEO Audit Tool"
          subtitle="Get a complete website analysis in seconds. Identify technical issues, on-page problems, and quick wins to improve your search rankings."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Hero Section */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Complete SEO Audit in Seconds</h2>
            <p className="text-gray-600">
              A complete SEO audit is the foundation of any successful SEO strategy. It reveals what's working, what needs fixing, and what opportunities you're missing. Without a proper audit, you're flying blind—making decisions based on guesses instead of data.
            </p>
            <p className="text-gray-600">
              Our free SEO audit tool analyzes your entire website and provides actionable recommendations across technical SEO, on-page optimization, performance, and more. Get detailed insights in seconds, not days. Understand exactly what's holding your site back from ranking higher.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">What Our SEO Audit Analyzes</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Technical Issues</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Crawlability problems, indexation errors, robots.txt issues, sitemap quality, and site structure problems that prevent ranking.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Search className="h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">On-Page Problems</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Missing meta tags, duplicate content, keyword optimization gaps, heading structure issues, and HTML improvements.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Core Web Vitals, page speed, mobile usability, and performance diagnostics that affect both rankings and user experience.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 shrink-0 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Link Analysis</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Broken links, internal linking structure, link distribution, and anchor text optimization across your entire site.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">How Our Audit Tool Works</h2>
            <div className="space-y-4">
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Submit Your URL</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Enter your website URL and we'll immediately begin analyzing your entire site structure, pages, and content.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 border border-green-200 bg-green-50">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Deep Website Crawl</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Our crawler visits every page, analyzes technical elements, checks performance, and identifies issues that impact rankings.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 border border-purple-200 bg-purple-50">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Get Actionable Report</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Receive a detailed report with prioritized recommendations, severity levels, and specific steps to fix each issue.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Why Audit Matters */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Why Regular SEO Audits Matter</h2>
            <div className="space-y-4">
              {[
                { title: "Find Hidden Issues", desc: "Discover problems you didn't know existed. Most sites have 10+ issues preventing them from ranking higher." },
                { title: "Prioritize Fixes", desc: "Know exactly what to fix first. Our audit ranks issues by impact so you can focus on high-value improvements." },
                { title: "Track Progress", desc: "Run audits regularly to measure improvements. See the impact of your SEO efforts with concrete data." },
                { title: "Competitive Edge", desc: "Understand what competitors miss. Better audits lead to better strategies and higher rankings than competitors." },
                { title: "Save Time & Money", desc: "Automate the audit process. No need for expensive consultants—get professional-grade audits instantly." },
                { title: "Improve User Experience", desc: "Many audit issues affect both SEO and user experience. Fix them for better rankings and visitor engagement." },
              ].map((item, idx) => (
                <Card key={idx} extra="p-6 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Audit Coverage */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Comprehensive Audit Coverage</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Code2, title: "Technical SEO", items: ["Robots.txt issues", "Sitemap quality", "Canonicalization", "Structured data", "Mobile friendliness"] },
                { icon: BarChart3, title: "Content & On-Page", items: ["Meta tags", "Heading structure", "Keyword optimization", "Content length", "Internal linking"] },
                { icon: TrendingUp, title: "Performance", items: ["Core Web Vitals", "Page speed", "Image optimization", "JavaScript issues", "CSS delivery"] },
                { icon: AlertCircle, title: "Errors & Warnings", items: ["Broken links", "Redirect chains", "Duplicate content", "404 errors", "Security issues"] },
              ].map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Card key={idx} extra="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Icon className="h-6 w-6 shrink-0 text-indigo-500" />
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "How long does a full SEO audit take?",
                  a: "Our free audit typically completes in 2-5 minutes depending on your site size. Larger sites with thousands of pages may take up to 15 minutes for a complete analysis."
                },
                {
                  q: "Is the audit really free?",
                  a: "Yes, you get a complete free SEO audit with no credit card required. We analyze up to 50 pages for free. Premium accounts allow auditing larger sites with more detailed reports."
                },
                {
                  q: "How often should I run an audit?",
                  a: "Run a new audit monthly to track progress and catch new issues. Website changes, algorithm updates, and competitive pressure make regular audits essential for staying ahead."
                },
                {
                  q: "What do I do with the audit results?",
                  a: "Prioritize high-impact issues first. Create a roadmap to address technical problems, improve on-page elements, and optimize performance. Focus on issues with the most significant ranking impact."
                },
                {
                  q: "Can I export or share the audit report?",
                  a: "Yes, you can view, export, and share detailed audit reports. Premium users can customize reports with branding and filter results by issue type or severity."
                },
              ].map((faq, idx) => (
                <Card key={idx} extra="p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card extra="p-8 bg-gradient-to-r from-indigo-600 to-blue-600">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Audit Your Website?
              </h2>
              <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                Get your free comprehensive SEO audit in minutes. Discover exactly what's holding your site back from ranking higher and get a clear roadmap to improve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/audit">
                  <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                    Start Free Audit
                    <Zap size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    View Pricing Plans
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
