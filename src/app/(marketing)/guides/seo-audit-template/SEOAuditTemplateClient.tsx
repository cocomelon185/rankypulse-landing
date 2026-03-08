"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { BookOpen, Download, FileText, CheckCircle } from "lucide-react";

export default function SEOAuditTemplateClient() {
  const templateSections = [
    {
      title: "Executive Summary",
      description: "High-level overview of audit findings, key metrics, and recommendations",
      includes: ["Current traffic and rankings", "Top 3 critical issues", "Top 3 opportunities", "Expected impact summary"],
    },
    {
      title: "Technical SEO Audit",
      description: "Systematically track all technical elements",
      includes: ["Site speed metrics", "Mobile-friendliness status", "Crawlability and indexation", "Structured data implementation", "Security (HTTPS/SSL)"],
    },
    {
      title: "On-Page SEO Tracking",
      description: "Monitor optimization of individual pages",
      includes: ["Title tag audit", "Meta description quality", "Heading structure", "Keyword targeting", "Content quality score"],
    },
    {
      title: "Content & Keywords",
      description: "Track content performance and gaps",
      includes: ["Keyword rankings by page", "Content gaps vs competitors", "Duplicate content audit", "Content freshness assessment"],
    },
    {
      title: "Link Profile Analysis",
      description: "Monitor backlinks and internal linking",
      includes: ["Backlink count and quality", "Toxic link detection", "Anchor text distribution", "Internal link map"],
    },
    {
      title: "Competitive Analysis",
      description: "Compare against top competitors",
      includes: ["Competitor keyword rankings", "Competitor backlink sources", "Content strategies comparison", "Market opportunities"],
    },
    {
      title: "Issues & Priority",
      description: "Document and prioritize all findings",
      includes: ["Issue description", "Severity/priority level", "Estimated effort to fix", "Expected impact", "Owner and deadline"],
    },
    {
      title: "Action Plan",
      description: "Create your implementation roadmap",
      includes: ["Quick wins (0-2 weeks)", "Medium-term projects (1-3 months)", "Long-term strategic initiatives", "Success metrics and timeline"],
    },
  ];

  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<FileText className="h-7 w-7" />}
          title="SEO Audit Template"
          subtitle="Free, professional SEO audit template. Track findings, prioritize issues, and create actionable roadmaps to improve rankings."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Introduction */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Audit Like the Professionals</h2>
            <p className="text-gray-600">
              A professional SEO audit isn't just about finding issues — it's about organizing them, prioritizing by impact, and creating an actionable roadmap. Our template helps you do exactly that.
            </p>
            <p className="text-gray-600">
              This template is used by SEO agencies and in-house teams to conduct thorough audits, communicate findings to stakeholders, and track implementation progress. It's organized, comprehensive, and results-oriented.
            </p>
          </div>

          {/* Template Features */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">What's Included</h2>
            <div className="space-y-4">
              {templateSections.map((section, idx) => (
                <Card key={idx} extra="p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                      <ul className="mt-3 space-y-1 text-sm text-gray-600">
                        {section.includes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* How to Use */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">How to Use This Template</h2>
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="mb-3 flex items-start gap-3">
                  <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-600">
                    Step 1
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Download & Customize</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Download the template and customize company name, audit date, and target metrics.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="mb-3 flex items-start gap-3">
                  <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-600">
                    Step 2
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Conduct Your Audit</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Follow the template sections systematically. Use the tools and resources recommended in each area.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="mb-3 flex items-start gap-3">
                  <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-600">
                    Step 3
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Document & Score</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      For each finding, document the issue, severity, and potential impact. Score issues consistently.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="mb-3 flex items-start gap-3">
                  <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-600">
                    Step 4
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Prioritize & Plan</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Use the issues to create your action plan. Prioritize by impact/effort ratio and assign owners and deadlines.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="mb-3 flex items-start gap-3">
                  <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-600">
                    Step 5
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Track Progress</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Use the template to track implementation progress. Re-audit in 3-6 months to measure impact.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring Guide */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Issue Severity & Scoring</h2>
            <p className="mb-4 text-gray-600">
              Use this scale to score each issue. This helps with prioritization and stakeholder communication.
            </p>
            <div className="space-y-3">
              <Card extra="p-4 border-l-4 border-l-red-500 bg-red-50">
                <h3 className="font-semibold text-gray-900">Critical (Score: 9-10)</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Issues directly blocking rankings or causing significant traffic loss. Fix immediately. Examples: no HTTPS, site down, major indexation issues.
                </p>
              </Card>
              <Card extra="p-4 border-l-4 border-l-orange-500 bg-orange-50">
                <h3 className="font-semibold text-gray-900">High (Score: 7-8)</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Significant issues impacting SEO performance. Fix within 2-4 weeks. Examples: poor Core Web Vitals, duplicate content, broken links.
                </p>
              </Card>
              <Card extra="p-4 border-l-4 border-l-yellow-500 bg-yellow-50">
                <h3 className="font-semibold text-gray-900">Medium (Score: 5-6)</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Moderate issues with some impact. Fix within 1-3 months. Examples: weak meta descriptions, unoptimized images, thin content.
                </p>
              </Card>
              <Card extra="p-4 border-l-4 border-l-blue-500 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Low (Score: 3-4)</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Minor issues with limited impact. Fix as part of ongoing maintenance. Examples: inconsistent heading styles, missing alt text on minor images.
                </p>
              </Card>
            </div>
          </div>

          {/* Tips for Effective Audits */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Pro Tips for Audit Success</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Be specific:</strong> "Poor performance" isn't actionable. "LCP 5.2s on homepage" is. Include metrics.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Evidence matters:</strong> Screenshot or link to each issue. Don't make claims without proof.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Show impact:</strong> Explain why each issue matters. Link to business outcomes when possible.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Provide solutions:</strong> Don't just list problems. Offer concrete next steps.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Track over time:</strong> Keep historical audits. Benchmark progress and celebrate wins.</span>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Save Time with Automated Audits</h3>
            <p className="mb-6 text-gray-600">
              Manually auditing your SEO is time-consuming. RankyPulse audits your entire site automatically, fills in the template, and prioritizes issues for you. Run it free today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/audit">
                <Button size="lg">Run Free SEO Audit</Button>
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
