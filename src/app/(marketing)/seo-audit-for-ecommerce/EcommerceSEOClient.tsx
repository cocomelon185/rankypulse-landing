"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { ShoppingCart, AlertCircle, CheckCircle, TrendingUp, DollarSign } from "lucide-react";

export default function EcommerceSEOClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<ShoppingCart className="h-7 w-7" />}
          title="SEO Audit for E-commerce"
          subtitle="E-commerce specific SEO strategies. Increase product visibility, reduce CAC, and grow revenue through organic search."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why E-commerce SEO is Different</h2>
            <p className="text-gray-600">
              E-commerce SEO is directly tied to revenue. Every ranking improvement affects sales. Unlike content sites, e-commerce faces unique challenges: hundreds of product pages, variant management, inventory changes, seasonality, and pricing dynamics.
            </p>
            <p className="text-gray-600">
              Successful e-commerce SEO requires systematic optimization across product pages, categories, technical foundation, and content strategy. The payoff is enormous — organic traffic for product keywords converts at 2-3x higher rates than paid ads because it's high-intent buyer traffic.
            </p>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">E-commerce SEO Challenges</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: AlertCircle, color: "text-red-500", title: "Product Variants", desc: "Multiple URLs for colors, sizes, materials. Consolidated vs separate indexing decision critical" },
                { icon: AlertCircle, color: "text-red-500", title: "Duplicate Content", desc: "Similar product descriptions, category copy, and pagination create extensive duplicates" },
                { icon: AlertCircle, color: "text-red-500", title: "Site Speed", desc: "Heavy product images, filters, reviews slow sites. Core Web Vitals suffer with poor performance" },
                { icon: AlertCircle, color: "text-red-500", title: "Inventory Changes", desc: "Products go out of stock, pages are deleted or merged. Requires careful redirects" },
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900">E-commerce SEO Best Practices</h2>
            <div className="space-y-4">
              {[
                { title: "Unique Product Descriptions", desc: "Don't use manufacturer copy. Write unique, keyword-rich descriptions that differentiate from competitors" },
                { title: "Keyword-Rich Titles", desc: "Include primary keyword + descriptor. Limit 60 chars. Example: 'Wool Running Socks - Moisture Wicking' not just 'Running Socks'" },
                { title: "Product Schema Markup", desc: "Implement Product schema with price, availability, rating. Improves SERP appearance and CTR" },
                { title: "Handle Variants Strategically", desc: "Consolidate variants under main product page with selection options. Avoid duplicate content penalties" },
                { title: "Optimize Category Pages", desc: "Treat categories as important rank targets. Unique descriptions, internal links, facet management" },
                { title: "Image Optimization", desc: "Compress heavily, optimize alt text, use multiple images, implement lazy-loading for speed" },
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900">E-commerce Content Strategy</h2>
            <div className="space-y-4">
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Product Pages (Decision-Stage)</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Rank for "[Product Type]", "best [product]", "[Brand] [Product]". Target buying intent keywords
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Category Pages (Evaluation-Stage)</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Rank for "[Product Category]", "[Product] types", "[Feature] products". Guide comparison decisions
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Blog Content (Awareness-Stage)</h3>
                <p className="mt-2 text-sm text-gray-600">
                  How-to guides, buying guides, trends. Target "[Product] guide", "how to choose [Product]", "[Problem] solution"
                </p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">E-commerce Metrics That Matter</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Revenue from Organic:</strong> Not just traffic. Track sales attributed to organic search specifically</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Product Ranking Distribution:</strong> How many products rank in top 10, 20, 100? Track visibility growth</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Organic AOV & Conversion Rate:</strong> Organic buyers often have higher AOV than paid. Measure it</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick E-commerce SEO Wins</h2>
            <div className="space-y-3">
              {[
                "Write unique product descriptions (300+ words) on all products, don't use manufacturer copy",
                "Implement Product schema markup on all product pages",
                "Optimize all product titles to include keyword + descriptor",
                "Add internal links from category pages to best-selling products",
                "Set canonical tags to prevent duplicate content issues from variants",
              ].map((win, idx) => (
                <Card key={idx} extra="p-4 border border-green-200 bg-green-50">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                    <span className="text-sm text-gray-700">{win}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Run Free E-commerce Audit</Button>
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
