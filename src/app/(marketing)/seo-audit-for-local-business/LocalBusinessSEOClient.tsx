"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { MapPin, CheckCircle, Star, Users, TrendingUp } from "lucide-react";

export default function LocalBusinessSEOClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<MapPin className="h-7 w-7" />}
          title="Local SEO Audit"
          subtitle="Dominate local search results for your area. Rank in Google Maps, get more phone calls and foot traffic, and compete effectively with big chains."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why Local SEO Is Critical</h2>
            <p className="text-gray-600">
              "Near me" searches now represent 30%+ of all mobile searches. Customers actively looking for your services use phrases like "plumber near me", "best coffee [city]", "dentist open now". Being invisible for these searches means losing business to competitors.
            </p>
            <p className="text-gray-600">
              Local SEO success comes from 3 critical elements: Google Business Profile optimization, local citations consistency, and review generation. Unlike national SEO, local results are often determined in hours after optimization. The ROI is immediate and measurable in phone calls and walk-ins.
            </p>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">The Local SEO "3 Pack"</h2>
            <p className="mb-4 text-gray-600">
              Google's local pack shows 3 map results above organic listings for local searches. Ranking in this 3-pack is incredibly valuable — far more visibility than position #10 in organic.
            </p>
            <div className="space-y-4">
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">1. Google Business Profile Optimization</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Complete, accurate profile with photos, hours, service areas, posts. This is the #1 factor determining local rankings
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">2. Online Citations</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Consistent business name, address, phone number across directories (Yelp, Apple Maps, local directories)
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">3. Reviews & Ratings</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Google reviews heavily influence rankings. Higher ratings and more reviews boost visibility significantly
                </p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Local SEO Action Plan</h2>
            <div className="space-y-4">
              {[
                { title: "Claim & Optimize Google Business Profile", desc: "Add all information, photos, business hours, service areas, categories. Update post regularly" },
                { title: "Get Consistent Citations", desc: "List on Yelp, Apple Maps, Facebook, industry directories. Ensure NAP (Name, Address, Phone) consistency" },
                { title: "Generate Reviews", desc: "Ask satisfied customers for Google reviews. Respond to all reviews professionally" },
                { title: "Local Content", desc: "Create content targeting \"[service] [city]\", \"[service] near [neighborhood]\", \"[service] [city] reviews\"" },
                { title: "Schema Markup", desc: "Add LocalBusiness schema to your website. Helps Google understand your business details" },
                { title: "Local Link Building", desc: "Get links from local news sites, chambers of commerce, local associations" },
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick Wins (Do This Week)</h2>
            <div className="space-y-3">
              {[
                "Claim your Google Business Profile if not already done",
                "Add/update all photos (exterior, interior, team, work samples)",
                "Set proper business hours and mark holiday closures",
                "Add service areas if you serve multiple cities",
                "Write a compelling business description",
                "Ask 5 happy customers for Google reviews",
              ].map((win, idx) => (
                <Card key={idx} extra="p-4 border border-green-200 bg-green-50">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 shrink-0 text-yellow-500" />
                    <span className="text-sm text-gray-700">{win}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">90-Day Local SEO Roadmap</h2>
            <div className="space-y-3">
              <Card extra="p-6 border border-indigo-200 bg-indigo-50">
                <h3 className="font-semibold text-gray-900">Month 1: Foundation</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Audit local presence, claim/optimize GBP, set up local citations, get first 10-15 reviews
                </p>
              </Card>
              <Card extra="p-6 border border-indigo-200 bg-indigo-50">
                <h3 className="font-semibold text-gray-900">Month 2: Growth</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Increase citations, get 20+ reviews, create local content, respond to all reviews
                </p>
              </Card>
              <Card extra="p-6 border border-indigo-200 bg-indigo-50">
                <h3 className="font-semibold text-gray-900">Month 3: Expansion & Optimization</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Reach 50+ reviews, build local backlinks, optimize website for local SEO, measure impact
                </p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Measuring Local SEO Success</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Local Pack Rankings:</strong> Are you in the 3-pack for your key search terms?</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Phone Calls & Leads:</strong> Track phone calls from Google Maps (available in GBP analytics)</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Foot Traffic:</strong> Google Maps shows visitor activity. Track growth as visibility improves</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Website Visits from Maps:</strong> GBP shows click-throughs to your website from the listing</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span><strong>Review Count & Rating:</strong> More reviews + higher rating = better local rankings</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Common Local SEO Mistakes</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-red-600 mt-2 shrink-0" />
                <span><strong>Incomplete GBP:</strong> Missing information, no photos, or blank sections hurt rankings</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-red-600 mt-2 shrink-0" />
                <span><strong>Inconsistent citations:</strong> Different names/addresses across directories confuse Google</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-red-600 mt-2 shrink-0" />
                <span><strong>Ignoring reviews:</strong> Not asking for or responding to reviews wastes ranking opportunity</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-red-600 mt-2 shrink-0" />
                <span><strong>Wrong category:</strong> Using wrong business category hurts visibility for your searches</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Run Free Local SEO Audit</Button>
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
