"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { Zap, TrendingUp, Users, BarChart3, CheckCircle } from "lucide-react";

export default function SaaSSEOClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Zap className="h-7 w-7" />}
          title="SEO Audit for SaaS"
          subtitle="SaaS-specific SEO strategy. Convert high-intent keywords into free trial signups and product-led growth with targeted organic marketing."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why SaaS Needs Different SEO</h2>
            <p className="text-gray-600">
              SaaS companies face unique SEO challenges and opportunities. Success isn't measured just in traffic — it's measured in qualified trial signups and customer acquisition cost. SaaS buyers search with specific intent: "software for X", "[tool] vs [competitor]", "how to [task]".
            </p>
            <p className="text-gray-600">
              The best SaaS SEO strategy combines high-intent product keywords with educational content that builds awareness and preference. The goal is moving prospects through their buyer's journey via organic search.
            </p>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">SaaS-Specific Opportunities</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Users, color: "text-blue-500", title: "Comparison Keywords", desc: "\"X vs Y\" searches are high-intent. Rank for comparisons with competitors to capture evaluating prospects" },
                { icon: BarChart3, color: "text-green-500", title: "Educational Content", desc: "Free resources, how-tos, templates position your brand as expert and drive awareness early in buyer journey" },
                { icon: TrendingUp, color: "text-purple-500", title: "Integrations & Addons", desc: "Content around integrations with popular tools creates link opportunities and attracts users researching compatibility" },
                { icon: CheckCircle, color: "text-orange-500", title: "Use Case Keywords", desc: "\"[Industry] CRM\" or \"[Feature] tool\" let you target specific verticals and use cases" },
              ].map((item, idx) => (
                <Card key={idx} extra="p-6">
                  <div className="flex items-start gap-3">
                    <item.icon className={`h-6 w-6 shrink-0 ${item.color}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">SaaS SEO Success Strategy</h2>
            <div className="space-y-4">
              {[
                { title: "Product Keyword Targeting", desc: "Rank for direct product keywords: \"[Your SaaS Name]\", \"[Category] software\", \"[Feature] tool\"" },
                { title: "Comparison Content", desc: "Create vs pages comparing you to alternatives. These convert evaluating buyers at decision stage" },
                { title: "Alternative Pages", desc: "\"Alternatives to [Competitor]\" captures prospects actively looking to switch solutions" },
                { title: "Use Case Content", desc: "Target specific industries and use cases: \"CRM for nonprofits\", \"expense tracking for freelancers\"" },
                { title: "Free Resource Hub", desc: "Templates, guides, checklists build authority, create backlink opportunities, and drive qualified visitors" },
                { title: "FAQ & Objection Content", desc: "Address common questions and concerns prospects have: \"Is [tool] secure?\", \"[tool] pricing explained\"" },
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

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">SaaS Content Strategy</h2>
            <p className="mb-4 text-gray-600">Balance product-focused and educational content for complete coverage:</p>
            <div className="space-y-4">
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Decision-Stage Content (30%)</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Product pages, pricing, comparisons, reviews. Target "best", "[tool] vs", "[tool] pricing" keywords
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Consideration-Stage Content (40%)</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Feature guides, use case content, case studies. Target "how to", "[industry] [tool]", "[feature] best practices"
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Awareness-Stage Content (30%)</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Problem-focused content, guides, resources. Target "[problem] solution", "how to [achieve result]"
                </p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">90-Day SaaS SEO Roadmap</h2>
            <div className="space-y-3">
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Month 1: Foundation & Research</h3>
                <p className="mt-2 text-sm text-gray-600">SEO audit, keyword research, competitor analysis, identify core 20-30 target keywords</p>
              </Card>
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Month 2: Content Creation</h3>
                <p className="mt-2 text-sm text-gray-600">Create comparison pages, use case content, improve product pages, launch comparison content</p>
              </Card>
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Month 3: Growth & Scaling</h3>
                <p className="mt-2 text-sm text-gray-600">Build awareness content, start link building, monitor rankings, optimize for conversion</p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">SaaS SEO Metrics That Matter</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Trial Signups from Organic:</strong> Track organic leads, not just traffic. What's CAC from organic?</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>High-Intent Keyword Rankings:</strong> Product keyword rankings matter more than informational keywords</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Content Conversion Rate:</strong> Not all organic traffic is equal. Measure which pages convert to trials</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Run Free SaaS SEO Audit</Button>
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
