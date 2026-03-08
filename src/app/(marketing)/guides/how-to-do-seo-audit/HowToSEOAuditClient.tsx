"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { BookOpen, CheckCircle, AlertCircle } from "lucide-react";

export default function HowToSEOAuditClient() {
  const steps = [
    {
      number: 1,
      title: "Establish Your Baseline Metrics",
      description: "Before you start finding issues, document your current state. This lets you measure improvements later.",
      tasks: [
        "Current rankings for target keywords (tool: Google Search Console, Semrush, Ahrefs)",
        "Organic traffic from Google (tool: Google Analytics 4)",
        "Site health status (tool: Google Search Console)",
        "Core Web Vitals scores (tool: PageSpeed Insights)",
        "Domain authority (tool: Moz, SEMrush, Ahrefs)",
      ],
    },
    {
      number: 2,
      title: "Technical SEO Audit",
      description: "Check the technical foundation that enables everything else.",
      tasks: [
        "Crawlability: Check robots.txt, sitemaps, and crawl errors in GSC",
        "Indexation: Verify pages are indexed (site:domain.com in Google)",
        "Core Web Vitals: Test with PageSpeed Insights",
        "Mobile-friendliness: Test on actual mobile devices",
        "HTTPS/SSL: Ensure SSL certificate is valid",
        "Internal links: Find broken links and redirect chains",
      ],
    },
    {
      number: 3,
      title: "On-Page SEO Audit",
      description: "Analyze how well individual pages are optimized for search intent.",
      tasks: [
        "Title tags: 50-60 characters, keyword included, unique",
        "Meta descriptions: 155-160 characters, action-oriented",
        "H1 tags: Present, unique, includes primary keyword",
        "Heading structure: Logical H1→H2→H3 hierarchy",
        "Content quality: Comprehensive, original, useful",
        "Keyword relevance: Naturally included, not stuffed",
      ],
    },
    {
      number: 4,
      title: "Content & Keywords Audit",
      description: "Evaluate keyword targeting and content strategy.",
      tasks: [
        "Keyword rankings: Which keywords rank and where",
        "Content gaps: Topics competitors rank for that you don't",
        "Duplicate content: Find and consolidate similar pages",
        "Thin content: Identify pages with little value",
        "User intent: Does content match search intent",
        "Content updates: Which pages need refreshing",
      ],
    },
    {
      number: 5,
      title: "Link Profile Audit",
      description: "Analyze both internal and external links.",
      tasks: [
        "Backlinks: Quality, relevance, diversity (tool: Ahrefs, SEMrush)",
        "Link velocity: Are you gaining or losing links",
        "Anchor text: Is it natural and varied",
        "Toxic links: Check for spammy or irrelevant links",
        "Internal linking: Authority distribution, orphaned pages",
        "Link quality: Domain authority of linking sites",
      ],
    },
    {
      number: 6,
      title: "Competitive Analysis",
      description: "Learn what's working for your top competitors.",
      tasks: [
        "Competitor keywords: Which ones rank them",
        "Competitor content: What formats and topics work",
        "Competitor backlinks: Where they get links from",
        "Market gaps: Opportunities they're missing",
        "Your advantages: Unique angles you can own",
        "Difficulty assessment: Which keywords are achievable",
      ],
    },
    {
      number: 7,
      title: "User Experience Audit",
      description: "Ensure your site works well for visitors.",
      tasks: [
        "Page load speed: Goal is under 3 seconds",
        "Navigation: Is finding content intuitive",
        "Mobile experience: Works well on small screens",
        "Forms: Easy to complete, clear CTAs",
        "Readability: Good contrast, readable font sizes",
        "Design: Modern, professional, trustworthy",
      ],
    },
    {
      number: 8,
      title: "Create Your Action Plan",
      description: "Prioritize findings and create an implementation roadmap.",
      tasks: [
        "Categorize: Group issues by impact and effort",
        "Prioritize: Quick wins first, then high-impact projects",
        "Assign: Who owns each fix and when",
        "Timeline: Set realistic deadlines",
        "Track: Monitor progress and measure results",
        "Iterate: Audit again in 3-6 months",
      ],
    },
  ];

  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<BookOpen className="h-7 w-7" />}
          title="How to Do an SEO Audit"
          subtitle="Master the complete SEO audit process in 8 steps. Learn what to check, how to prioritize, and create an action plan that drives results."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Introduction */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">The Complete SEO Audit Process</h2>
            <p className="text-gray-600">
              An SEO audit is a systematic review of your website to identify why it's not ranking as well as it could. The goal is to find fixable issues, understand competitive dynamics, and create a data-driven roadmap to improve visibility and traffic.
            </p>
            <p className="text-gray-600">
              This guide walks through all 8 steps of a professional SEO audit. Follow them in order to get a complete picture of your SEO health and opportunities.
            </p>
          </div>

          {/* Step-by-Step */}
          <div className="space-y-8">
            {steps.map((step) => (
              <Card key={step.number} extra="p-6 border border-gray-200">
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                <ul className="space-y-2 ml-14">
                  {step.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* Common Issues */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Common Issues Found in SEO Audits</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { title: "Technical Issues", items: ["Slow page speed", "Broken internal links", "Mobile usability problems", "Crawlability issues"] },
                { title: "On-Page Issues", items: ["Weak title tags", "Poor meta descriptions", "Duplicate content", "Thin content pages"] },
                { title: "Content Issues", items: ["Missing keyword targeting", "Content gaps vs competitors", "Outdated information", "Low quality content"] },
                { title: "Link Issues", items: ["Low backlink count", "Toxic link profile", "Poor internal linking", "Weak domain authority"] },
              ].map((category, idx) => (
                <Card key={idx} extra="p-6 border border-gray-200">
                  <h3 className="mb-3 font-semibold text-gray-900">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <AlertCircle className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          {/* How to Prioritize */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">How to Prioritize Your Fixes</h2>
            <p className="mb-4 text-gray-600">
              You can't fix everything at once. Use this framework to prioritize:
            </p>
            <div className="space-y-4">
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Do First: Quick Wins</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Low effort, measurable impact. Examples: fix broken links, update 10 meta descriptions, add missing H1 tags.
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Do Next: High Impact Projects</h3>
                <p className="mt-2 text-sm text-gray-600">
                  High effort but significant potential impact. Examples: improve Core Web Vitals, consolidate duplicate content, restructure navigation.
                </p>
              </Card>
              <Card extra="p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900">Do Last: Long-Term Strategic Work</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Very high effort, compounding benefits over time. Examples: build backlink profile, expand content significantly, rebuild site architecture.
                </p>
              </Card>
            </div>
          </div>

          {/* Measurement */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Measuring Audit Success</h2>
            <p className="mb-4 text-gray-600">
              After implementing your audit recommendations, track these metrics to measure success:
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Organic traffic:</strong> Overall increase from Google (target: 20-30% in 3 months)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Keyword rankings:</strong> Track target keywords moving up (tool: GSC, Semrush)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Pages indexed:</strong> Check Google Search Console for indexation growth</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Core Web Vitals:</strong> All metrics in "good" range per PageSpeed Insights</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>User behavior:</strong> Lower bounce rate, longer average session duration</span>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Get a Professional SEO Audit in Minutes</h3>
            <p className="mb-6 text-gray-600">
              Instead of manually following all these steps, let RankyPulse do the heavy lifting. Our automated audit covers all areas and gives you a prioritized action plan.
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
