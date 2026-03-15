"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Briefcase, Code2, Check } from "lucide-react";
import { EffortImpactBadge } from "@/components/audit/v2/EffortImpactBadge";

type Tab = "agencies" | "freelancers" | "developers";

interface TabContent {
  headline: string;
  sub: string;
  points: string[];
  visual: React.ReactNode;
}

function AgencyVisual() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#7B5CF5]/20 bg-[#7B5CF5]/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-[#7B5CF5]/30" />
        <span className="text-xs font-semibold text-[#7B5CF5]">ACME Digital Agency</span>
        <span className="ml-auto rounded-full border border-[#7B5CF5]/30 bg-[#7B5CF5]/10 px-2 py-0.5 text-[10px] text-[#7B5CF5]">
          White-Label
        </span>
      </div>
      <div className="space-y-2">
        {[
          { label: "Client: TechCorp.io", score: 74, color: "#10B981" },
          { label: "Client: FashionBrand.co", score: 38, color: "#FF642D" },
          { label: "Client: LocalBiz.net", score: 61, color: "#f59e0b" },
        ].map((c) => (
          <div key={c.label} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
            <span className="text-xs text-slate-400">{c.label}</span>
            <span className="text-sm font-bold" style={{ color: c.color }}>{c.score}/100</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 rounded-lg border border-[#7B5CF5]/30 bg-[#7B5CF5]/10 py-1.5 text-xs font-semibold text-[#7B5CF5]">
          Share Report
        </button>
        <button className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] py-1.5 text-xs font-semibold text-slate-400">
          Export PDF
        </button>
      </div>
    </div>
  );
}

function FreelancerVisual() {
  return (
    <div className="overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
        Next Fix · #1 Priority
      </p>
      <div className="rounded-lg border border-white/[0.06] bg-[#0E1117] p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
            🔴 Critical
          </span>
          <EffortImpactBadge timeEstimateMinutes={5} impact="HIGH" />
        </div>
        <p className="mb-1 text-sm font-semibold text-white">Missing canonical tags</p>
        <p className="text-xs leading-relaxed text-slate-500">
          Canonical tags prevent duplicate content signals and consolidate PageRank to your preferred URL.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">AI Fix Snippet</p>
          <code className="font-mono text-[11px] text-emerald-300">
            {'<link rel="canonical" href="https://site.com/page/" />'}
          </code>
        </div>
      </div>
    </div>
  );
}

function DeveloperVisual() {
  return (
    <div className="overflow-hidden rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
          hreflang
        </span>
        <span className="text-xs text-slate-500">• 3 affected pages</span>
        <span className="ml-auto text-xs font-semibold text-emerald-400">+420–800 visits/mo</span>
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-[#0E1117] p-4 font-mono text-xs">
        <p className="text-slate-600">{`<!-- Add to <head> for each locale -->`}</p>
        <p className="mt-1 text-slate-300">
          <span className="text-cyan-400">{"<link"}</span>
          <span className="text-[#FF642D]">{` rel=`}</span>
          <span className="text-emerald-300">{`"alternate"`}</span>
        </p>
        <p className="text-slate-300">
          {"      "}
          <span className="text-[#FF642D]">{`hreflang=`}</span>
          <span className="text-emerald-300">{`"en"`}</span>
        </p>
        <p className="text-slate-300">
          {"      "}
          <span className="text-[#FF642D]">{`href=`}</span>
          <span className="text-emerald-300">{`"https://site.com/en/"`}</span>
          <span className="text-cyan-400">{" />"}</span>
        </p>
      </div>
      <div className="mt-3 flex gap-2">
        {["HTML", "Next.js", "WordPress", "PHP"].map((lang) => (
          <span key={lang} className="rounded border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-500">
            {lang}
          </span>
        ))}
      </div>
    </div>
  );
}

const TABS: Record<Tab, TabContent> = {
  agencies: {
    headline: "The ultimate Sales & Pitch tool.",
    sub: "Close clients with benchmarks, keep them with results. Your brand, your reports.",
    points: [
      "Custom logo & brand colors on every report",
      "Niche benchmarks that make prospects say 'we need you'",
      "Password-protected share links for each client",
      "Client retention dashboard to track monthly progress",
    ],
    visual: <AgencyVisual />,
  },
  freelancers: {
    headline: "Turn 5 hours of auditing into 5 minutes.",
    sub: "Deliver professional-grade audits instantly. Bill for strategy, not spreadsheet work.",
    points: [
      "AI Fix Assistant with copy-paste code snippets",
      "One-click branded PDF export per client",
      "Effort/Impact scoring to prioritize the right fixes",
      "Glossary tooltips so non-technical clients get it",
    ],
    visual: <FreelancerVisual />,
  },
  developers: {
    headline: "Clean code, actionable tasks, zero fluff.",
    sub: "No more vague recommendations. Get exact fixes with SERP before/after previews.",
    points: [
      "Code snippets in HTML, Next.js, WordPress & more",
      "SERP before/after preview for every fix",
      "Fix queue with roadmap and priority scoring",
      "Effort/Impact matrix so you ship the right thing first",
    ],
    visual: <DeveloperVisual />,
  },
};

const TAB_CONFIG: { id: Tab; label: string; icon: React.ReactNode; color: string; activeClasses: string }[] = [
  {
    id: "agencies",
    label: "Agencies",
    icon: <Building2 size={15} />,
    color: "#7B5CF5",
    activeClasses: "border-[#7B5CF5]/50 bg-[#7B5CF5]/10 text-[#7B5CF5]",
  },
  {
    id: "freelancers",
    label: "Freelancers",
    icon: <Briefcase size={15} />,
    color: "#10B981",
    activeClasses: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  },
  {
    id: "developers",
    label: "Developers",
    icon: <Code2 size={15} />,
    color: "#06b6d4",
    activeClasses: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
  },
];

export function PersonaTabs() {
  const [active, setActive] = useState<Tab>("agencies");
  const content = TABS[active];
  const tabConfig = TAB_CONFIG.find((t) => t.id === active)!;

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <p className="mb-3 font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600">
          Persona-specific solutions
        </p>
        <h2
          className="font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
          style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
        >
          Built for how{" "}
          <span className="italic" style={{ color: tabConfig.color }}>
            you
          </span>{" "}
          work.
        </h2>
      </motion.div>

      {/* Tab bar */}
      <div className="mb-10 flex justify-center gap-3">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              active === tab.id
                ? tab.activeClasses
                : "border-white/8 bg-white/[0.02] text-slate-500 hover:border-white/15 hover:text-slate-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="grid items-center gap-10 lg:grid-cols-2"
        >
          {/* Left: copy */}
          <div>
            <h3 className="mb-3 font-['Fraunces'] text-2xl font-bold text-white lg:text-3xl">
              {content.headline}
            </h3>
            <p className="mb-8 text-base leading-relaxed text-slate-400">{content.sub}</p>
            <ul className="space-y-3">
              {content.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: tabConfig.color }}
                  />
                  <span className="text-sm leading-relaxed text-slate-300">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: visual */}
          <div>{content.visual}</div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
