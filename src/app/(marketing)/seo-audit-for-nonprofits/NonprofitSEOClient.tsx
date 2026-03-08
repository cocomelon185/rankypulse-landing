"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { Heart, CheckCircle, Users, TrendingUp, Target } from "lucide-react";

export default function NonprofitSEOClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Heart className="h-7 w-7" />}
          title="SEO Audit for Nonprofits"
          subtitle="Free and affordable SEO strategies designed for mission-driven organizations. Increase donor awareness, volunteer recruitment, and impact."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why Nonprofits Need SEO</h2>
            <p className="text-gray-600">
              Nonprofits have limited marketing budgets, making SEO uniquely valuable. Unlike paid ads, organic search doesn't charge per click. A single blog post can bring qualified donors or volunteers for years. Search visibility is foundational for mission impact.
            </p>
            <p className="text-gray-600">
              People searching for "how to help homeless" or "volunteer animal rescue near me" have genuine interest in your mission. Being visible for these searches matters profoundly. RankyPulse offers free and affordable solutions specifically designed for nonprofit budgets.
            </p>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Key SEO Opportunities for Nonprofits</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Users, title: "Volunteer Recruitment", desc: "Rank for \"volunteer [your city]\", \"volunteer [your cause]\". Connect with passionate helpers" },
                { icon: TrendingUp, title: "Donor Awareness", desc: "Content about your cause increases awareness and trust. Donors give to organizations they know" },
                { icon: Target, title: "Community Engagement", desc: "Educational content about your cause/mission builds community and positions you as authority" },
                { icon: Heart, title: "Grant Eligibility", desc: "Visibility increases likelihood of discovery by grant-makers researching nonprofits" },
              ].map((item, idx) => (
                <Card key={idx} extra="p-6">
                  <div className="flex items-start gap-3">
                    <item.icon className="h-6 w-6 shrink-0 text-red-500" />
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Nonprofit SEO Essentials</h2>
            <div className="space-y-4">
              {[
                { title: "Google Nonprofit Program", desc: "Free Google Ads, Google Maps, and discounted tools for eligible 501(c)(3) organizations" },
                { title: "Clear Mission Statement", desc: "Homepage should immediately explain what you do and why it matters" },
                { title: "Volunteer/Donor Pages", desc: "Clear CTAs and pathways for people wanting to help. Make it easy to give or volunteer" },
                { title: "Local Search Optimization", desc: "Optimize Google Business Profile, collect reviews, ensure correct location info everywhere" },
                { title: "Impact-Focused Content", desc: "Stories, impact data, testimonials build credibility and emotional connection" },
                { title: "Transparent Information", desc: "Financials, board members, programs. Transparency builds trust and donor confidence" },
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Content Strategy for Nonprofits</h2>
            <p className="mb-4 text-gray-600">Focus on content around your cause and mission:</p>
            <div className="space-y-3">
              {[
                "How-to guides addressing problems your nonprofit solves",
                "Educational content about your cause area",
                "Impact stories and testimonials from people you've helped",
                "Research and statistics relevant to your mission",
                "Resource guides and toolkits for your community",
                "Volunteer spotlights and success stories",
              ].map((strategy, idx) => (
                <Card key={idx} extra="p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 shrink-0 text-red-500" />
                    <span className="text-sm text-gray-700">{strategy}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick Wins for Your Nonprofit</h2>
            <div className="space-y-3">
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Optimize Google Business Profile</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Free, takes 30 minutes, massive local visibility impact. Claim and complete your nonprofit profile
                </p>
              </Card>
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Start a Blog</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Share your story and expertise. Blog content builds authority and attracts donors/volunteers searching for your cause
                </p>
              </Card>
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Get Nonprofit Reviews</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Ask donors, volunteers, and people you've helped for Google reviews. Reviews build trust and boost local visibility
                </p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Free & Discounted Tools for Nonprofits</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Google Nonprofit Essentials:</strong> Free Google Ads, Analytics, Search Console, Google Workspace</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Semrush for nonprofits:</strong> Free advanced SEO tools for eligible organizations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Moz for nonprofits:</strong> SEO tools and reporting available at reduced cost</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>RankyPulse:</strong> Affordable plans specifically for nonprofit budgets</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Free Audit for Your Nonprofit</h3>
            <p className="mb-6 text-gray-600">
              RankyPulse offers special pricing for nonprofits. Run a free SEO audit and get a roadmap for increasing your mission's impact through search visibility.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/audit">
                <Button size="lg">Run Free Audit</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">Nonprofit Pricing</Button>
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
