"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import {
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  Zap,
  TrendingUp,
  DollarSign,
  Star,
} from "lucide-react";

const PAIN_POINTS = [
  {
    icon: Clock,
    title: "Manual audits eat your billable hours",
    desc: "Spending 3–4 hours auditing a client site by hand means fewer clients, less revenue, and burnout.",
  },
  {
    icon: FileText,
    title: "Reports look amateur",
    desc: "Cobbling together screenshots and spreadsheets doesn't build client trust or justify your rates.",
  },
  {
    icon: DollarSign,
    title: "Enterprise tools cost too much",
    desc: "Ahrefs, SEMrush, and Screaming Frog charge $99–$449/month — brutal overhead for a solo consultant.",
  },
  {
    icon: TrendingUp,
    title: "Hard to show ROI quickly",
    desc: "Clients want results fast. Without a structured audit process, proving impact in month one is nearly impossible.",
  },
];

const FEATURES = [
  {
    title: "50+ checks in ~60 seconds",
    desc: "Core Web Vitals, broken links, missing meta tags, crawl errors, structured data, redirect chains — all surfaced automatically.",
  },
  {
    title: "AI-generated fix steps",
    desc: "Every issue comes with a plain-English explanation and copy-paste code snippets. You spend less time Googling, more time delivering.",
  },
  {
    title: "White-label PDF reports",
    desc: "Brand reports with your logo and colors. Send clients a polished deliverable in minutes, not days.",
  },
  {
    title: "No install, no setup",
    desc: "100% cloud-based. Type any URL and go — no software to download, no crawl to configure.",
  },
  {
    title: "Free plan to get started",
    desc: "Audit your first clients for free. Upgrade only when your workflow demands it.",
  },
  {
    title: "Faster client onboarding",
    desc: "Run a live audit during the discovery call. Instantly show prospects the problems you'll solve. Close more deals.",
  },
];

const WORKFLOW_STEPS = [
  {
    num: "01",
    title: "Paste the client URL",
    desc: "Type any domain or page URL. RankyPulse crawls and checks 50+ SEO factors in about 60 seconds.",
  },
  {
    num: "02",
    title: "Review the audit results",
    desc: "See every issue grouped by severity. Each problem includes an AI-written fix guide — no extra research needed.",
  },
  {
    num: "03",
    title: "Generate a branded PDF",
    desc: "Export a white-label report with your logo. Professional, skimmable, and ready to send to your client.",
  },
  {
    num: "04",
    title: "Prioritize and execute",
    desc: "Use the prioritized fix list to plan your engagement. Start with high-impact, low-effort wins to prove your value fast.",
  },
];

const CHECKS = [
  "Title tag optimization",
  "Meta description quality",
  "H1/H2 structure",
  "Core Web Vitals (LCP, CLS, FID)",
  "Broken internal & external links",
  "Redirect chains",
  "Missing alt text",
  "Canonical tag issues",
  "Robots.txt & sitemap",
  "Schema markup",
  "Mobile usability",
  "HTTPS & mixed content",
  "Page speed (desktop & mobile)",
  "Crawl depth & orphan pages",
  "Duplicate content signals",
  "Open Graph & social tags",
];

const TESTIMONIALS = [
  {
    quote:
      "I used to spend half a day manually auditing new client sites. RankyPulse cut that to under an hour — including the PDF report. My clients are genuinely impressed.",
    name: "Sophie R.",
    role: "Freelance SEO Consultant",
  },
  {
    quote:
      "Running a live audit during a discovery call is a game-changer. Prospects can see exactly what's broken in real time. My close rate went up noticeably.",
    name: "Marcus T.",
    role: "Independent SEO Specialist",
  },
  {
    quote:
      "The white-label reports look more professional than what most agencies produce. It's helped me raise my rates and compete with larger firms.",
    name: "Priya L.",
    role: "Freelance Digital Marketing Consultant",
  },
];

export default function FreelancerSEOClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Briefcase className="h-7 w-7" />}
          title="SEO Audit Tool for Freelancers"
          subtitle="Audit any client site in 60 seconds. Get AI-powered fix steps and white-label PDF reports — so you can deliver more value, land more clients, and stop burning hours on manual work."
        />

        <div className="mx-auto max-w-4xl space-y-14">

          {/* Pain Points */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              The freelancer SEO struggle is real
            </h2>
            <p className="text-gray-600 mb-6">
              Most SEO audit tools are built for enterprise teams or require a steep learning curve. Freelancers need something that works immediately — without a $300/month subscription.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {PAIN_POINTS.map((item, idx) => (
                <Card key={idx} extra="p-6 border border-red-100 bg-red-50">
                  <div className="flex items-start gap-3">
                    <item.icon className="h-6 w-6 shrink-0 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your new client audit workflow
            </h2>
            <p className="text-gray-600 mb-6">
              From URL to polished client report in under 10 minutes.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {WORKFLOW_STEPS.map((step, idx) => (
                <Card key={idx} extra="p-6 border border-indigo-100 bg-indigo-50">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl font-black text-indigo-300 leading-none">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Everything a freelancer needs, nothing they don&apos;t
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {FEATURES.map((item, idx) => (
                <Card key={idx} extra="p-6">
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

          {/* Checks list */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What gets checked in every audit
            </h2>
            <p className="text-gray-600 mb-6">
              50+ technical and on-page SEO factors — all checked automatically, no configuration needed.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {CHECKS.map((check, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5"
                >
                  <Zap className="h-4 w-4 shrink-0 text-indigo-500" />
                  {check}
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What freelancers are saying
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, idx) => (
                <Card key={idx} extra="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-gray-600 italic leading-relaxed mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <cite className="not-italic">
                    <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                    <span className="block text-xs text-gray-500">{t.role}</span>
                  </cite>
                </Card>
              ))}
            </div>
          </div>

          {/* Why vs competitors */}
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why not just use Screaming Frog or Ahrefs?
            </h2>
            <p className="text-gray-600">
              Screaming Frog is powerful but requires installation, configuration, and technical expertise. Ahrefs costs $129–$449/month — a significant overhead for a solo practitioner. Both tools are built for teams with dedicated SEO staff.
            </p>
            <p className="text-gray-600 mt-3">
              RankyPulse is built for the freelancer workflow: type a URL, get results, generate a report, move on to the next client. No crawl configuration. No per-seat pricing. No learning curve. Just a fast, reliable audit that makes you look great in front of clients.
            </p>
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Run your first free audit now
            </h2>
            <p className="text-gray-600 mb-6">
              No signup required. No credit card. Just type a URL and see what&apos;s hurting your client&apos;s rankings.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/audit">
                <Button size="lg">Start Free Audit</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">See Pricing</Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Free plan available · White-label PDF reports on paid plans · Cancel anytime
            </p>
          </div>

          {/* Related pages */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Also relevant for you</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { href: "/seo-audit-for-agencies", label: "SEO Audit for Agencies" },
                { href: "/seo-audit-for-small-business", label: "Small Business SEO" },
                { href: "/blog/rankypulse-vs-screaming-frog-vs-ahrefs", label: "Tool Comparison" },
                { href: "/blog/technical-seo-audit-30-minutes", label: "30-Minute Audit Guide" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
