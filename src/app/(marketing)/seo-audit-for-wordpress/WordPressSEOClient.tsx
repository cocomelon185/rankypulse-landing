"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { Code2, AlertCircle, CheckCircle, TrendingUp, Zap } from "lucide-react";

export default function WordPressSEOClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Code2 className="h-7 w-7" />}
          title="SEO Audit for WordPress"
          subtitle="WordPress-specific SEO strategies. Optimize plugins, improve performance, fix technical issues, and boost your site's search visibility."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why WordPress Needs Specific SEO Attention</h2>
            <p className="text-gray-600">
              WordPress powers 43% of the web, but its flexibility comes with SEO complexity. Poor plugin choices, bloated code, slow loading times, and misconfigurations hurt rankings. Strategic optimization is critical for WordPress success.
            </p>
            <p className="text-gray-600">
              The good news: WordPress is incredibly SEO-friendly when configured correctly. The right plugins, theme selection, and technical setup can dramatically improve your rankings and organic traffic.
            </p>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">WordPress SEO Challenges</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: AlertCircle, color: "text-red-500", title: "Plugin Bloat", desc: "Too many plugins slow your site and add security risks. Each plugin is a potential SEO liability." },
                { icon: AlertCircle, color: "text-red-500", title: "Poor Theme Choice", desc: "Heavy, unoptimized themes tank page speed. Theme selection is critical for Core Web Vitals." },
                { icon: AlertCircle, color: "text-red-500", title: "Duplicate Content", desc: "WordPress generates duplicates via categories, tags, pagination. Needs proper handling." },
                { icon: AlertCircle, color: "text-red-500", title: "URL Structure Issues", desc: "Default permalinks and improper settings create confusing URL structures." },
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Essential WordPress SEO Setup</h2>
            <div className="space-y-4">
              {[
                { title: "Yoast SEO or Rank Math", desc: "Essential plugin for on-page optimization, XML sitemaps, and readability analysis" },
                { title: "Lightweight, Fast Theme", desc: "Use GeneratePress, Neve, or Astra. Avoid heavy, feature-packed themes" },
                { title: "Proper Permalink Structure", desc: "Use /%postname%/ or /%category%/%postname%/. Avoid default /?p=123" },
                { title: "Caching Plugin", desc: "WP Super Cache or W3 Total Cache reduces server load and improves speed" },
                { title: "Image Optimization", desc: "Smush, ImageRecycle, or ShortPixel automatically compress and optimize images" },
                { title: "Core Web Vitals Optimization", desc: "Lazy-load images, defer non-critical JavaScript, enable compression" },
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick WordPress SEO Wins</h2>
            <div className="space-y-3">
              {[
                "Disable XML sitemaps you don't need (product sitemaps if not e-commerce)",
                "Set your preferred domain (with or without www) in Settings → General",
                "Enable compression in caching plugin settings",
                "Delete unused plugins and themes",
                "Update all plugins and WordPress core immediately",
                "Set homepage to static page, not latest posts",
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

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">90-Day WordPress SEO Roadmap</h2>
            <div className="space-y-3">
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Month 1: Foundation</h3>
                <p className="mt-2 text-sm text-gray-600">Run audit, optimize theme, set up SEO plugin, improve page speed, fix duplicate content</p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Month 2: Content & Links</h3>
                <p className="mt-2 text-sm text-gray-600">Optimize existing content, internal linking, meta tags, add structured data, improve Core Web Vitals</p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Month 3: Growth & Monitoring</h3>
                <p className="mt-2 text-sm text-gray-600">Create new content, build backlinks, monitor rankings, measure results, plan Q2 strategy</p>
              </Card>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">Run Free WordPress Audit</Button>
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
