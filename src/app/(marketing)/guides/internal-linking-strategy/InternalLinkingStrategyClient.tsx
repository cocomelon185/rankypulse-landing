"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { BookOpen, Link2, CheckCircle, AlertCircle } from "lucide-react";

export default function InternalLinkingStrategyClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Link2 className="h-7 w-7" />}
          title="Internal Linking Strategy"
          subtitle="Strategic internal linking distributes authority, improves crawlability, and helps search engines understand your site structure."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          {/* Introduction */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why Internal Linking Matters</h2>
            <p className="text-gray-600">
              Internal links are the most underutilized SEO lever. While everyone focuses on backlinks, internal linking is entirely within your control and has profound impact. Every internal link tells search engines: "This page is important" and passes authority (link juice) to the linked page.
            </p>
            <p className="text-gray-600">
              A strategic internal linking structure helps Google discover all your pages, understand your site's hierarchy, and allocate ranking potential efficiently. Pages with more internal links typically outrank pages with fewer links (all else equal).
            </p>
          </div>

          {/* Core Principles */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Core Principles of Internal Linking</h2>
            <div className="space-y-4">
              <Card extra="p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Hierarchy Through Links</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      More internal links = more important page. Your homepage gets the most links, then pillar pages, then supporting content. This creates a clear hierarchy.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Anchor Text Signals Intent</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      The text of your link tells search engines what the linked page is about. "Click here" provides no signal. "Best SEO audit tools" signals the page is about SEO audits.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Context Matters</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Links from contextually relevant pages pass more authority and trust. A link from a related article matters more than a link from the footer menu.
                    </p>
                  </div>
                </div>
              </Card>
              <Card extra="p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Crawlability Follows Links</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Google discovers pages by following links. If a page isn't linked from anywhere, it's much harder for Google to find it (orphaned page).
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Types of Internal Links */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Types of Internal Links</h2>
            <div className="space-y-4">
              <Card extra="p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900">Navigation Links</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Links in your main menu, footer, breadcrumbs. These are expected and help all pages, but don't pass as much authority as contextual links.
                </p>
                <p className="mt-2 text-xs font-semibold text-indigo-600">Example: Breadcrumb "Home / Blog / SEO Guide"</p>
              </Card>
              <Card extra="p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900">Contextual Links</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Links within article content that naturally point to related content. These are most powerful because they're thematically relevant and unexpected.
                </p>
                <p className="mt-2 text-xs font-semibold text-indigo-600">Example: "Learn more about core web vitals" linking to vitals article</p>
              </Card>
              <Card extra="p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900">Topical Cluster Links</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Links connecting related content in a topic cluster. Pillar page links to supporting content, and vice versa. Shows Google your topical authority.
                </p>
                <p className="mt-2 text-xs font-semibold text-indigo-600">Example: SEO pillar page linking to 10 in-depth sub-topics</p>
              </Card>
              <Card extra="p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900">Footer/Sidebar Links</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Links that appear on every page (footer or sidebar). Less valuable than contextual links but help with crawlability and navigation.
                </p>
                <p className="mt-2 text-xs font-semibold text-indigo-600">Example: Footer link to "Services" page visible on all pages</p>
              </Card>
            </div>
          </div>

          {/* Anchor Text Strategy */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Anchor Text Best Practices</h2>
            <p className="mb-4 text-gray-600">
              Anchor text tells search engines what your linked page is about. Strategic anchor text improves rankings for target keywords.
            </p>
            <div className="space-y-4">
              <Card extra="p-4 border border-green-200 bg-green-50">
                <h3 className="mb-2 font-semibold text-gray-900">Good: Descriptive Anchor Text</h3>
                <p className="text-sm text-gray-600">"Learn how to fix Core Web Vitals" — tells both users and search engines what to expect</p>
              </Card>
              <Card extra="p-4 border border-orange-200 bg-orange-50">
                <h3 className="mb-2 font-semibold text-gray-900">Better: Keyword-Rich Anchor Text</h3>
                <p className="text-sm text-gray-600">"Core Web Vitals optimization guide" — includes target keyword while remaining natural</p>
              </Card>
              <Card extra="p-4 border border-red-200 bg-red-50">
                <h3 className="mb-2 font-semibold text-gray-900">Avoid: Generic Anchor Text</h3>
                <p className="text-sm text-gray-600">"Click here", "Read more", "Link" — provides no context about the linked page</p>
              </Card>
            </div>
          </div>

          {/* Linking Patterns */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Proven Linking Patterns</h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-semibold text-gray-900">The Silo Structure</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Organize content into topic silos. Link pages within a silo to each other and to the pillar page. Prevents link equity from flowing to unrelated topics.
                </p>
                <Card extra="p-4 bg-gray-50 border border-gray-200">
                  <p className="text-xs font-mono text-gray-600">
                    Pillar: "SEO Guide" → Article 1: "Technical SEO" → Sub-articles 1a, 1b<br />
                    → Article 2: "On-Page SEO" → Sub-articles 2a, 2b
                  </p>
                </Card>
              </div>
              <div>
                <h3 className="mb-4 font-semibold text-gray-900">The Hub-and-Spoke</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Central hub page links to all supporting content. Each supporting page links back to hub. Creates a strong topical signal.
                </p>
                <Card extra="p-4 bg-gray-50 border border-gray-200">
                  <p className="text-xs font-mono text-gray-600">
                    Central Hub "SEO Guide" ↔ Article 1, 2, 3, 4, 5<br />
                    All supporting articles link back to hub
                  </p>
                </Card>
              </div>
              <div>
                <h3 className="mb-4 font-semibold text-gray-900">The Pillar Cluster</h3>
                <p className="mb-3 text-sm text-gray-600">
                  One comprehensive pillar page covering a broad topic. Dozens of shorter, deep-dive cluster articles each focusing on specific subtopic. Bidirectional linking.
                </p>
                <Card extra="p-4 bg-gray-50 border border-gray-200">
                  <p className="text-xs font-mono text-gray-600">
                    Pillar: "Complete Guide to SEO" (5000+ words)<br />
                    ↔ Cluster articles (1500-2000 words each) on specific aspects
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* Implementation Guide */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">How to Build Your Internal Linking Strategy</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: "Map Your Content", description: "List all your content pages and group them by topic" },
                { step: 2, title: "Identify Pillars", description: "Which pages are your most important for each topic" },
                { step: 3, title: "Create Your Structure", description: "Choose silo, hub-and-spoke, or pillar-cluster model" },
                { step: 4, title: "Plan Links", description: "Document which pages should link to which others" },
                { step: 5, title: "Write Anchor Text", description: "Create keyword-rich, descriptive anchor text" },
                { step: 6, title: "Implement", description: "Add contextual links throughout your content" },
                { step: 7, title: "Monitor", description: "Track rankings for your target keywords" },
              ].map((item) => (
                <Card key={item.step} extra="p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Common Internal Linking Mistakes</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <span><strong>Generic anchor text:</strong> Using "click here" wastes the opportunity to signal keywords</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <span><strong>Too many links:</strong> More than 100 links per page dilutes authority. Be selective.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <span><strong>Linking to low-quality pages:</strong> Associate your important pages with quality content</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <span><strong>Over-optimization:</strong> Using exact keyword match anchor text on every link looks spammy. Mix it up.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <span><strong>Ignoring orphaned pages:</strong> Pages with no internal links rarely rank. Link to all important content.</span>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Audit Your Internal Linking Now</h3>
            <p className="mb-6 text-gray-600">
              Let RankyPulse analyze your internal link structure, identify orphaned pages, and find linking opportunities. Run a free audit today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/audit">
                <Button size="lg">Run Free Linking Audit</Button>
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
