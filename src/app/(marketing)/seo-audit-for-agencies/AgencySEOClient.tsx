"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/horizon";
import { Building2, CheckCircle, BarChart3, Users, Zap } from "lucide-react";

export default function AgencySEOClient() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Building2 className="h-7 w-7" />}
          title="SEO Audit for Agencies"
          subtitle="Scale your SEO services with white-label solutions. Improve client results, streamline reporting, and grow your agency profitably."
        />

        <div className="mx-auto max-w-4xl space-y-12">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">Why Agencies Need Dedicated Tools</h2>
            <p className="text-gray-600">
              Agencies wear multiple hats: delivering results, managing clients, reporting, and scaling services. The right SEO tools directly impact your bottom line. Better tools mean better client results, faster delivery, and stronger client retention.
            </p>
            <p className="text-gray-600">
              RankyPulse provides white-label SEO solutions designed specifically for agencies. Brand reports as your own, save time on audits, improve client results faster, and scale your services without proportional headcount growth.
            </p>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Agency Challenges We Solve</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Users, title: "Audit Time & Costs", desc: "Manual audits consume precious time. Automate with consistent, professional reports" },
                { icon: BarChart3, title: "Client Reporting", desc: "Clients expect clear, actionable reports. Customize and rebrand RankyPulse audits" },
                { icon: Zap, title: "Service Scaling", desc: "Scale services without adding team members. Deliver more with the same headcount" },
                { icon: CheckCircle, title: "Results Delivery", desc: "Your clients need consistent improvements. Focus on strategy, let automation handle audits" },
              ].map((item, idx) => (
                <Card key={idx} extra="p-6">
                  <div className="flex items-start gap-3">
                    <item.icon className="h-6 w-6 shrink-0 text-indigo-500" />
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900">RankyPulse for Agencies</h2>
            <div className="space-y-4">
              {[
                { title: "White-Label Solution", desc: "Rebrand all reports, audits, and client materials with your agency logo and colors" },
                { title: "Bulk Audit Capability", desc: "Run audits for multiple clients at once. Save hours on repetitive audit work" },
                { title: "Custom Reporting", desc: "Build reports focused on your client's goals. Include only relevant metrics and recommendations" },
                { title: "Competitor Benchmarking", desc: "Help clients see how they compare to competitors. Justify SEO spend with competitive analysis" },
                { title: "Client Dashboard", desc: "Give clients access to performance data. Reduce support requests with self-service insights" },
                { title: "Reseller Pricing", desc: "Agency-friendly pricing tiers. Higher margins on services delivered through RankyPulse" },
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Agency Workflows</h2>
            <div className="space-y-4">
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Onboarding Workflow</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Run free audit on new client site. Use findings to scope projects and set expectations. Show quick wins from day one.
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Monthly Reporting Workflow</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Track changes, measure improvements, customize reports for each client. Share progress and build trust with data.
                </p>
              </Card>
              <Card extra="p-6 border border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-gray-900">Project Delivery Workflow</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Identify issues, prioritize recommendations, track implementation. Measure impact of your SEO work with confidence.
                </p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Growing Your SEO Service</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Faster Audit Delivery:</strong> Deliver audits in hours, not days. Set client expectations immediately</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Better Client Results:</strong> Systematic approach ensures nothing is missed. Better results = better retention</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Clear ROI Justification:</strong> Metrics-based approach makes it easy to justify SEO spend to clients</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>Scalable Delivery Model:</strong> Do more with existing team. Automate repetitive work, focus on strategy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span><strong>New Service Lines:</strong> White-label reporting unlocks new revenue from existing client relationships</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/audit">
              <Button size="lg">See the Platform in Action</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">Agency Pricing</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
