"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { ShoppingCart, AlertCircle, CheckCircle, TrendingUp, Zap } from "lucide-react";

export default function ShopifySEOClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<ShoppingCart className="h-7 w-7" />}
          title="SEO Audit for Shopify"
          subtitle="Shopify-specific SEO strategies to improve product visibility, compete in e-commerce search, and increase organic traffic and sales."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Hero */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why Shopify SEO Is Different</h2>
            <p className="text-gray-600">
              Shopify is an excellent e-commerce platform, but it has unique SEO challenges. Duplicate content issues, parameter handling, slow loading speeds, and complex site structures can prevent your products from ranking well. Strategic SEO optimization is essential for competing in product search results.
            </p>
            <p className="text-gray-600">
              Shopify stores that optimize SEO can significantly increase organic traffic and reduce customer acquisition costs. Product pages are high-intent searches — customers actively looking to buy. Ranking for these keywords directly translates to sales.
            </p>
          </div>

          {/* Shopify-Specific Challenges */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Shopify-Specific SEO Challenges</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Duplicate Content</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Product variants, collections, filters, and parameters create duplicate content. Confuses Google about which version to rank.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Slow Page Speed</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Heavy apps and Liquid templates slow load times. Core Web Vitals suffer, hurting rankings.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Limited Customization</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Platform limitations prevent some SEO optimizations. Must work within Shopify's constraints.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Filters & Facets</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Collection filters (size, color, price) create many URLs. Need noindex or robots.txt rules.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Shopify SEO Solution */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Shopify SEO Best Practices</h2>
            <div className="space-y-4">
              {[
                { title: "Use Canonical Tags", desc: "Shopify handles this automatically, but verify in product pages to consolidate duplicate variants" },
                { title: "Optimize Product Titles", desc: "Include primary keyword + descriptor. Example: 'Blue Leather Handbag - Premium Quality' not 'Product #1234'" },
                { title: "Improve Page Speed", desc: "Minimize apps, lazy-load images, enable compression, use Shopify's free CDN for assets" },
                { title: "Leverage Alt Text", desc: "Describe images for accessibility and image search. Include keywords naturally" },
                { title: "Fix Facets & Filters", desc: "Noindex filtered/sorted collection pages to prevent crawl budget waste" },
                { title: "Schema Markup", desc: "Use Product schema with price, availability, rating. Shopify adds this automatically" },
                { title: "Internal Linking", desc: "Link from collection pages to best-selling products. Build topical relevance" },
                { title: "Content Strategy", desc: "Create blog content answering 'how to choose', 'best for', 'comparison' queries" },
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

          {/* Quick Wins */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick Wins for Your Shopify Store</h2>
            <div className="space-y-4">
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Audit & Fix Title Tags</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Many Shopify stores use default Shopify titles. Update all product titles to include keywords and be compelling.
                </p>
              </Card>
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Optimize Meta Descriptions</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Create unique descriptions for each product (155-160 chars). Include keyword and compelling offer or benefit.
                </p>
              </Card>
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Add Product Descriptions</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Thin product pages with minimal text rank poorly. Add detailed, keyword-rich descriptions (300+ words).
                </p>
              </Card>
              <Card extra="p-6 border border-green-200 bg-green-50">
                <h3 className="font-semibold text-gray-900">Start a Blog</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Blog content ranks for informational queries that drive awareness. Link to product pages from blog posts.
                </p>
              </Card>
            </div>
          </div>

          {/* 90-Day Plan */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">90-Day Shopify SEO Roadmap</h2>
            <div className="space-y-4">
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Month 1: Foundation</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Run SEO audit, identify top product keywords, analyze competitors, fix critical technical issues
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Month 2: Optimization</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Update all product titles/descriptions, improve page speed, implement schema, start blog, optimize images
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Month 3: Growth</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Create blog content, build internal links, improve Core Web Vitals, monitor rankings, plan Q2 strategy
                </p>
              </Card>
            </div>
          </div>

          {/* Case Study */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Case Study: Boutique Fashion Store</h2>
            <Card extra="p-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">BEFORE</p>
                  <p className="text-gray-600">10 products ranking, poor titles, thin descriptions, no blog, slow pages</p>
                </div>
                <div className="h-px bg-gray-200" />
                <div>
                  <p className="text-sm font-semibold text-indigo-600">ACTIONS</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Optimized 50 product titles and descriptions</li>
                    <li>• Improved page speed (LCP from 4.2s to 2.1s)</li>
                    <li>• Started blog with 8 posts targeting long-tail keywords</li>
                    <li>• Added internal links from blog to products</li>
                  </ul>
                </div>
                <div className="h-px bg-gray-200" />
                <div>
                  <p className="text-sm font-semibold text-indigo-600">RESULTS (6 months)</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• 145 products ranking in Google</li>
                    <li>• 35 new product pages ranking in top 10</li>
                    <li>• 120% increase in organic traffic</li>
                    <li>• $84K additional revenue from organic</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Run Free Shopify Audit</Button>
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
