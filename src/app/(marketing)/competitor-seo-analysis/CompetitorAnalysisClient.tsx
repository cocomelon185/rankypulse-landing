"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { Zap, TrendingUp, Search, Link2, BarChart3, Target } from "lucide-react";

export default function CompetitorAnalysisClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<BarChart3 className="h-7 w-7" />}
          title="Competitor SEO Analysis"
          subtitle="Understand your competition's SEO strategy. Find keyword gaps, analyze backlinks, discover content opportunities, and identify strategic advantages."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Hero Section */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Beat Your Competitors with Data-Driven SEO</h2>
            <p className="text-gray-600">
              You can't build a winning SEO strategy without understanding what your competitors are doing. Competitor analysis reveals which keywords are driving their traffic, where their backlinks are coming from, and what content strategies are working in your market.
            </p>
            <p className="text-gray-600">
              Our Competitor SEO Analysis tool lets you analyze multiple competitors simultaneously, identify keyword gaps, see content strategies that work, and find backlink opportunities they're exploiting. Use competitive intelligence to outrank them and capture market share.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Search className="h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Keyword Gap Analysis</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Find keywords your competitors rank for that you don't. Identify quick wins and untapped opportunities in your niche.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Ranking Position Tracking</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      See where competitors rank for shared keywords. Identify your biggest challenges and easiest opportunities.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Link2 className="h-6 w-6 shrink-0 text-purple-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Backlink Source Analysis</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Discover where competitors get their backlinks. Find link-building opportunities and authority sources in your industry.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-6 w-6 shrink-0 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Content Strategy Comparison</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Analyze competitor content, identify popular formats and topics that resonate. Build a content strategy based on market demand.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Target className="h-6 w-6 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Traffic Opportunity Assessment</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Calculate potential traffic from ranking for competitor keywords. Prioritize SEO efforts by ROI potential.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 shrink-0 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Authority Strength Metrics</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      See domain authority, trust signals, and content quality metrics. Understand what makes competitors strong.
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
                  <h3 className="font-semibold text-gray-900">Enter Your Domain & Competitors</h3>
                  <p className="text-sm text-gray-600">
                    Provide your website and 2-5 competitor domains to analyze.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Competitive Data Gathering</h3>
                  <p className="text-sm text-gray-600">
                    Our system analyzes keywords, rankings, backlinks, and content for all domains.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Strategic Insights Report</h3>
                  <p className="text-sm text-gray-600">
                    Get actionable recommendations for capturing competitor keywords and traffic.
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
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>New market entry — understand what keywords and strategies work before investing</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Content planning — identify gaps and opportunities aligned with market demand</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Link building strategy — find and approach sources already linking to competitors</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Budget allocation — prioritize SEO efforts by competitive difficulty and traffic potential</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span>Quarterly planning — benchmark progress and adjust strategy based on competition</span>
              </li>
            </ul>
          </div>

          {/* RankyPulse vs Competitors */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Why RankyPulse?</h2>
            <p className="mb-4 text-gray-600">
              Most competitor tools just show data. RankyPulse shows you what to do about it with clear, actionable strategies prioritized by impact and effort.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <Zap className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Opportunity Scoring:</strong> Know which gaps matter most for your business</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Difficulty Assessment:</strong> Understand how hard it will be to rank for each keyword</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                <span><strong>Ongoing Monitoring:</strong> Upgrade to track competitive shifts in real-time</span>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  How many competitors should I analyze?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  2-3 direct competitors is ideal for focused analysis. More competitors adds complexity but reveals market trends better. Start with your top 2-3.
                </p>
              </details>
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  What should I do with competitor keyword gaps?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Prioritize gaps with high search volume, low competition, and strategic relevance. Create better content than competitors rank for to capture traffic.
                </p>
              </details>
              <details className="group rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  How often should I run competitor analysis?
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Monthly for active markets, quarterly for stable niches. Use ongoing monitoring (upgrade feature) to catch shifts as they happen.
                </p>
              </details>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Analyze Your Competitors Free</Button>
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
