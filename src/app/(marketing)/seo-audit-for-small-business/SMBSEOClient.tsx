"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { Target, TrendingUp, DollarSign, Users, CheckCircle, AlertCircle } from "lucide-react";

export default function SMBSEOClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Target className="h-7 w-7" />}
          title="SEO Audit for Small Business"
          subtitle="Proven SEO strategies designed for small teams and tight budgets. Focus on high-ROI tactics that deliver real business results."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Hero */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why SEO Is Critical for Small Business</h2>
            <p className="text-gray-600">
              Small businesses can't outspend larger competitors in advertising. SEO is the great equalizer — a way to compete effectively by being visible in organic search when customers are actively looking for your products or services.
            </p>
            <p className="text-gray-600">
              Unlike paid ads that stop working the moment you stop paying, SEO traffic compounds over time. An investment in SEO today pays dividends for months and years. For small businesses with limited marketing budgets, SEO offers the best return on investment.
            </p>
          </div>

          {/* Key Challenges */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Challenges Small Businesses Face</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Limited Budget</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Can't afford expensive agencies or tools. Need realistic, high-ROI tactics that deliver with limited resources.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Small Team</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Marketing is wearing multiple hats. Need simple, actionable steps you can implement without specialists.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Competing with Bigger Players</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Large competitors have bigger budgets and established authority. Must focus on underserved niches and local SEO.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-6 w-6 shrink-0 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Measuring ROI</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Need to show that SEO efforts are generating revenue, not just traffic. Focus on business metrics.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* RankyPulse Solution */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">RankyPulse Solution for Small Business</h2>
            <p className="mb-4 text-gray-600">
              Designed specifically for small businesses, our platform provides:
            </p>
            <div className="space-y-3">
              {[
                "Affordable pricing plans that scale with your business",
                "Simple, understandable reports without jargon or overwhelm",
                "Actionable recommendations you can implement yourself",
                "Focus on local SEO and high-intent keywords with less competition",
                "Time-efficient tools that respect your team's limited capacity",
                "Real business metrics (leads, calls, revenue) not just traffic",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Wins */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick Wins (Start This Week)</h2>
            <p className="mb-4 text-gray-600">
              These tactics are free or cheap, take minimal time, but have real impact:
            </p>
            <div className="space-y-4">
              {[
                { title: "Claim Your Google Business Profile", description: "Free listing where local customers find you. Gets you in Google Maps and local pack." },
                { title: "Optimize Your Google Business Profile", description: "Add detailed description, hours, photos, service areas. Massive local ranking impact." },
                { title: "Get Local Reviews", description: "Ask happy customers for Google reviews. Reviews boost local rankings and influence decisions." },
                { title: "Fix Title Tags & Meta Descriptions", description: "Add your city/service. Improve click-through rates from search results immediately." },
                { title: "Create Local Content", description: 'Write about "SEO [Your City]" or "Services Near [Your City]". Target local search intent.' },
              ].map((win, idx) => (
                <Card key={idx} extra="p-6 border border-green-200 bg-green-50">
                  <h3 className="font-semibold text-gray-900">{win.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{win.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* 90-Day Roadmap */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Your 90-Day SEO Roadmap</h2>
            <div className="space-y-4">
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Month 1: Foundation</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Claim Google Business Profile, run SEO audit, identify top 10 keywords, get baseline metrics.
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Month 2: Optimization</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Fix critical SEO issues, optimize title/meta tags, improve Google Business Profile, collect first reviews.
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Month 3: Expansion</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Create new local content, build internal links, expand keyword targeting, measure results and plan Q2.
                </p>
              </Card>
            </div>
          </div>

          {/* Case Study */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Real Results: Local Plumbing Business</h2>
            <Card extra="p-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">STARTING POINT</p>
                  <p className="text-gray-600">Local plumbing company: no Google Business Profile, poor website, ranked nowhere for local keywords</p>
                </div>
                <div className="h-px bg-gray-200" />
                <div>
                  <p className="text-sm font-semibold text-indigo-600">ACTIONS TAKEN</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Set up and optimized Google Business Profile</li>
                    <li>• Fixed on-page SEO issues</li>
                    <li>• Collected 20 Google reviews</li>
                    <li>• Created local content pages</li>
                  </ul>
                </div>
                <div className="h-px bg-gray-200" />
                <div>
                  <p className="text-sm font-semibold text-indigo-600">RESULTS (90 Days)</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Ranking #1 for "emergency plumber [city]"</li>
                    <li>• 40 new phone calls per month from organic search</li>
                    <li>• ROI: $12,000 (from $50/month investment)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Industry Trends */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">SMB SEO Trends to Watch</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Google Business Profile dominance:</strong> Local pack gets 70% of clicks. Optimizing GBP is highest-ROI tactic.</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Reviews as ranking signals:</strong> More reviews and higher ratings boost local rankings significantly.</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Mobile-first indexing:</strong> Google indexes mobile version first. Mobile experience critical.</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Schema markup importance:</strong> Structured data helps Google understand your business better.</span>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Run Free SEO Audit</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">View Affordable Plans</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
