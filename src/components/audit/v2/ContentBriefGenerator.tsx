"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  HelpCircle,
  FileText,
  BookOpen,
  Link as LinkIcon,
  BarChart2,
  Bot,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { AddToRoadmapButton } from "./AddToRoadmapButton";

// ── Styling constants ──────────────────────────────────────────────────────────
const ACCENT     = "#FF642D";
const EMERALD    = "#10B981";
const PURPLE     = "#7B5CF5";
const TEXT_MUTED = "#64748B";
const TEXT_DIM   = "#8B9BB4";
const BORDER     = "#1E2940";

// ── Types ──────────────────────────────────────────────────────────────────────
type Intent = "Informational" | "Commercial" | "Transactional";
type UIState = "idle" | "detecting" | "brief_ready" | "generating" | "draft_ready";

interface OutlineItem {
  h2: string;
  h3s: string[];
}

interface ContentBrief {
  keyword: string;
  intent: Intent;
  titles: string[];
  outline: OutlineItem[];
  lsiKeywords: string[];
  paaQuestions: string[];
  wordCount: string;
  readingLevel: string;
  internalLinks: string[];
  draftParagraphs: [string, string];
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const BRIEFS: Record<string, ContentBrief> = {
  "saas seo audit guide": {
    keyword: "SaaS SEO Audit Guide",
    intent: "Informational",
    titles: [
      "The Complete SaaS SEO Audit Guide: Fix Rankings in 30 Days",
      "SaaS SEO Audit: A Step-by-Step Framework for Founders & Agencies",
      "How to Run a SaaS SEO Audit That Actually Drives Organic Growth",
    ],
    outline: [
      {
        h2: "What Is a SaaS SEO Audit (and Why It's Different)",
        h3s: [
          "SaaS vs. e-commerce SEO: key differences",
          "The four pillars: technical, on-page, content, links",
        ],
      },
      {
        h2: "Technical SEO Checklist for SaaS Sites",
        h3s: [
          "Core Web Vitals and page speed benchmarks",
          "Crawlability, indexing, and robots.txt",
          "Canonical tags and duplicate content",
          "Mobile-friendliness and viewport meta",
        ],
      },
      {
        h2: "On-Page SEO for SaaS Landing Pages",
        h3s: [
          "Title tags and meta descriptions",
          "Keyword mapping to product pages",
          "Internal linking across the funnel",
        ],
      },
      {
        h2: "Content Gap Analysis for SaaS",
        h3s: [
          "Finding competitors' ranking keywords",
          "Prioritising topics by traffic opportunity",
          "Building topic clusters around your core product",
        ],
      },
      {
        h2: "Link Building Strategy for SaaS",
        h3s: [
          "Identifying orphan pages",
          "HARO and digital PR for SaaS",
          "Internal link equity distribution",
        ],
      },
      {
        h2: "Tracking Progress and Reporting Results",
        h3s: [
          "Which KPIs matter for SaaS SEO",
          "Setting up rank tracking and alerts",
          "Monthly audit cadence template",
        ],
      },
    ],
    lsiKeywords: [
      "technical seo", "crawl budget", "core web vitals", "organic traffic",
      "keyword research", "backlink audit", "page speed", "site architecture",
      "content strategy", "rank tracking", "schema markup", "search intent",
    ],
    paaQuestions: [
      "How often should you run an SEO audit for a SaaS product?",
      "What tools are best for a SaaS SEO audit?",
      "How does a SaaS SEO audit differ from a regular website audit?",
      "What is the most important part of a technical SEO audit?",
    ],
    wordCount: "2,200 – 2,600",
    readingLevel: "Grade 9 (Professional)",
    internalLinks: ["/seo-audit-tool", "/guides/technical-seo-checklist", "/internal-link-checker"],
    draftParagraphs: [
      "If your SaaS product solves a real problem but your organic traffic has flatlined, the culprit is almost always a collection of small, fixable SEO issues hiding in plain sight. A SaaS SEO audit is the diagnostic process that surfaces those issues — from crawl errors and slow-loading landing pages to keyword cannibalisation across your feature pages — and turns them into a prioritised action plan your team can actually execute. Unlike a general website audit, a SaaS audit pays particular attention to the product-led content funnel, because your goal isn't just traffic: it's qualified trial sign-ups.",
      "The most effective SaaS audits follow a four-pillar framework: technical health, on-page optimisation, content gaps, and link equity. Most teams start with technical because it provides the largest lift for the least effort — fixing a missing viewport meta tag or compressing oversized JavaScript bundles can unlock ranking improvements across dozens of pages simultaneously. Once the technical foundation is solid, the on-page and content layers deliver compounding returns, especially when your audit tool gives you clear effort-vs-impact scores so you can pick the quick wins first.",
    ],
  },

  "best seo tools for agencies": {
    keyword: "Best SEO Tools for Agencies",
    intent: "Commercial",
    titles: [
      "12 Best SEO Tools for Agencies in 2025 (Ranked & Reviewed)",
      "Best Agency SEO Tools: White-Label, Reporting & Audit Platforms Compared",
      "Top SEO Platforms for Agencies: Which One Earns Its Seat in Your Stack?",
    ],
    outline: [
      {
        h2: "What Makes an SEO Tool Agency-Ready?",
        h3s: [
          "White-label reporting and custom branding",
          "Multi-client dashboard and project management",
          "API access and third-party integrations",
        ],
      },
      {
        h2: "Best All-in-One SEO Platforms for Agencies",
        h3s: [
          "RankyPulse — audit, links & keyword research in one",
          "Semrush Agency — feature depth vs. cost",
          "Ahrefs — backlink data leader",
        ],
      },
      {
        h2: "Best White-Label SEO Reporting Tools",
        h3s: [
          "Automated PDF reports with custom logos",
          "Client-facing dashboards",
          "Scheduled email delivery",
        ],
      },
      {
        h2: "Best Technical SEO Audit Tools",
        h3s: [
          "Crawl-based auditors: pros and cons",
          "Speed and Core Web Vitals monitoring",
          "On-demand vs. scheduled crawls",
        ],
      },
      {
        h2: "Pricing Comparison for Agency Plans",
        h3s: [
          "Per-seat vs. per-project pricing models",
          "Which tools offer the best ROI under $200/month",
        ],
      },
      {
        h2: "How to Choose the Right SEO Tool for Your Agency",
        h3s: [
          "Questions to ask before committing",
          "Free trial checklist",
        ],
      },
    ],
    lsiKeywords: [
      "white-label seo", "agency reporting", "rank tracker", "client dashboard",
      "keyword research tool", "backlink checker", "site audit", "seo software",
      "competitor analysis", "link building tool", "seo platform", "monthly reports",
    ],
    paaQuestions: [
      "Which SEO tool is best for running client audits?",
      "What is the best white-label SEO reporting tool?",
      "Do agencies need a separate tool for technical SEO?",
      "How much should an agency spend on SEO tools per month?",
    ],
    wordCount: "1,800 – 2,200",
    readingLevel: "Grade 10 (Business)",
    internalLinks: ["/features/action-plan", "/pricing", "/seo-audit-for-agencies"],
    draftParagraphs: [
      "Choosing the right SEO tools can be the difference between an agency that scales efficiently and one that drowns in spreadsheets. The best agency SEO platforms go far beyond simple rank tracking — they offer white-label reporting, multi-client project management, and the kind of actionable audit output that lets your team walk into a client call with a clear priority list instead of a 200-page crawl dump. In 2025, the market has consolidated around a handful of serious contenders, and the winners are the ones that save your team hours per week without sacrificing data depth.",
      "The most important criterion for an agency tool isn't raw feature count — it's how fast it turns data into a deliverable your clients can understand. A platform might crawl 100,000 pages, but if the report still requires three hours of manual formatting before it goes to the client, that's not a competitive advantage. Look for tools that output branded PDFs automatically, surface the top five issues in plain language, and give clients a live share link they can bookmark. That's the bar the best agency SEO platforms now clear.",
    ],
  },

  "internal linking strategy": {
    keyword: "Internal Linking Strategy",
    intent: "Informational",
    titles: [
      "Internal Linking Strategy: The Complete Guide to Passing PageRank Efficiently",
      "How to Build an Internal Linking Strategy That Boosts Rankings (2025)",
      "Internal Linking for SEO: A Framework for Architects, Editors & Developers",
    ],
    outline: [
      {
        h2: "Why Internal Links Are More Powerful Than Most People Think",
        h3s: [
          "How Google uses internal links to discover and rank pages",
          "PageRank sculpting: the fundamentals",
          "Internal vs. external links: different jobs, same importance",
        ],
      },
      {
        h2: "Site Architecture and Link Equity Flow",
        h3s: [
          "Flat vs. deep site structures",
          "Hub-and-spoke topic clusters",
          "Identifying your highest-authority pages",
        ],
      },
      {
        h2: "Anchor Text Best Practices",
        h3s: [
          "Exact-match, partial-match, and branded anchors",
          "Avoiding over-optimisation penalties",
          "Diversifying your anchor text profile",
        ],
      },
      {
        h2: "Finding and Fixing Orphan Pages",
        h3s: [
          "What is an orphan page and why it matters",
          "How to find orphan pages with a crawler",
          "Prioritising which orphans to rescue first",
        ],
      },
      {
        h2: "Building a Scalable Internal Linking Workflow",
        h3s: [
          "Automating link suggestions with AI tools",
          "Editorial checklists for writers",
          "Quarterly link audit process",
        ],
      },
    ],
    lsiKeywords: [
      "pagerank", "link equity", "anchor text", "orphan pages", "site architecture",
      "topic clusters", "crawl depth", "silo structure", "pillar pages", "link juice",
      "contextual links", "navigational links",
    ],
    paaQuestions: [
      "How many internal links should a page have?",
      "Does internal linking really help SEO?",
      "What is the best anchor text for internal links?",
      "How do you fix orphan pages in SEO?",
    ],
    wordCount: "1,600 – 2,000",
    readingLevel: "Grade 8 (Accessible)",
    internalLinks: ["/internal-link-checker", "/guides/technical-seo-checklist", "/seo-audit-tool"],
    draftParagraphs: [
      "Internal linking is the most underrated lever in SEO — and the one that requires no external approval, no budget, and no waiting for Google to update its index. Every internal link you place is a direct signal to Google about which pages matter most, how they relate to each other, and how deeply it should crawl your site. Done well, a strong internal linking strategy can push important pages from page two to page one without a single new backlink, simply by redistributing the authority that already exists across your domain.",
      "The foundation of any effective strategy is understanding your site's link equity flow. Think of your homepage as a reservoir: every page it links to receives a portion of that equity, and those pages pass a fraction along to the pages they link to in turn. The goal is to ensure your highest-value commercial and product pages — the ones that directly generate revenue — sit as close to that reservoir as possible, ideally within two or three clicks from the homepage. Orphan pages, by contrast, receive zero equity because no other page links to them, which is why finding and rescuing them is always the first task in any internal linking audit.",
    ],
  },
};

// ── Intent detection ───────────────────────────────────────────────────────────
function detectIntent(keyword: string): Intent {
  const kw = keyword.toLowerCase();
  if (/\b(buy|price|pricing|discount|free trial|download|get|purchase|coupon)\b/.test(kw))
    return "Transactional";
  if (/\b(best|top|vs|versus|review|compare|alternative|alternatives|ranked)\b/.test(kw))
    return "Commercial";
  return "Informational";
}

// ── Fallback brief generator ───────────────────────────────────────────────────
function generateFallbackBrief(keyword: string): ContentBrief {
  const intent = detectIntent(keyword);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return {
    keyword,
    intent,
    titles: [
      `The Complete ${cap(keyword)} Guide for 2025`,
      `${cap(keyword)}: Everything You Need to Know`,
      `How to Master ${cap(keyword)} and Drive Real Results`,
    ],
    outline: [
      { h2: `What Is ${cap(keyword)}?`, h3s: ["Core definition and scope", "Why it matters for your business"] },
      { h2: "Key Components and Best Practices", h3s: ["Step-by-step breakdown", "Common mistakes to avoid", "Tools and resources"] },
      { h2: "Advanced Techniques", h3s: ["Going beyond the basics", "Expert tips from practitioners"] },
      { h2: "How to Measure Success", h3s: ["KPIs and metrics", "Reporting cadence"] },
      { h2: "Next Steps", h3s: ["Building your action plan", "Further reading"] },
    ],
    lsiKeywords: [
      "strategy", "best practices", "tools", "tips", "how to",
      "guide", "checklist", "framework", "process", "results",
    ],
    paaQuestions: [
      `What is the best way to approach ${keyword}?`,
      `How long does ${keyword} take to show results?`,
      `What tools are recommended for ${keyword}?`,
      `Is ${keyword} worth the investment?`,
    ],
    wordCount: "1,500 – 2,000",
    readingLevel: "Grade 9 (Professional)",
    internalLinks: ["/seo-audit-tool", "/guides/technical-seo-checklist"],
    draftParagraphs: [
      `If you've been searching for a definitive guide to ${keyword}, you're in the right place. Whether you're just getting started or looking to level up an existing approach, understanding the fundamentals — and the common pitfalls — is what separates practitioners who see results from those who spin their wheels for months without meaningful progress. This guide breaks the topic into actionable steps you can implement this week, not someday.`,
      `The most important thing to understand about ${keyword} is that it's not a one-time task — it's an ongoing system. The teams that consistently outperform their competitors aren't doing anything dramatically different; they've simply built habits and checklists that keep the fundamentals working in the background while they focus creative energy on higher-level strategy. By the end of this guide, you'll have a clear framework to do exactly that.`,
    ],
  };
}

// ── Look up brief ──────────────────────────────────────────────────────────────
function lookUpBrief(keyword: string): ContentBrief {
  const key = keyword.trim().toLowerCase();
  return BRIEFS[key] ?? generateFallbackBrief(keyword);
}

// ── Slugify ────────────────────────────────────────────────────────────────────
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Intent badge config ────────────────────────────────────────────────────────
const INTENT_CONFIG: Record<Intent, { bg: string; border: string; text: string; dot: string }> = {
  Informational: {
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.25)",
    text: "#60A5FA",
    dot: "#3B82F6",
  },
  Commercial: {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    text: "#FCD34D",
    dot: "#F59E0B",
  },
  Transactional: {
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    text: "#34D399",
    dot: EMERALD,
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} style={{ color: ACCENT }} />
      <span
        className="text-[10px] font-bold uppercase tracking-[2px]"
        style={{ color: TEXT_MUTED }}
      >
        {label}
      </span>
    </div>
  );
}

function GlassCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="rounded-xl border p-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(8px)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ContentBriefGenerator() {
  const [keyword, setKeyword] = useState("");
  const [uiState, setUiState] = useState<UIState>("idle");
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [expandedH2s, setExpandedH2s] = useState<Set<number>>(new Set([0]));
  const [copiedTitleIdx, setCopiedTitleIdx] = useState<number | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [draftPhase, setDraftPhase] = useState(0);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleDetect = () => {
    if (!keyword.trim() || uiState === "detecting") return;
    setUiState("detecting");
    setBrief(null);
    setExpandedH2s(new Set([0]));
    setTimeout(() => {
      const result = lookUpBrief(keyword.trim());
      setBrief(result);
      setUiState("brief_ready");
    }, 700);
  };

  const handleReset = () => {
    setKeyword("");
    setBrief(null);
    setUiState("idle");
    setDraftPhase(0);
    setCopiedDraft(false);
  };

  const handleGenerateDraft = () => {
    if (uiState !== "brief_ready") return;
    setUiState("generating");
    setDraftPhase(0);
    const phases = [0, 1, 2];
    phases.forEach((p) => {
      setTimeout(() => setDraftPhase(p), p * 600);
    });
    setTimeout(() => {
      setUiState("draft_ready");
    }, 1800);
  };

  const handleCopyTitle = async (title: string, idx: number) => {
    await navigator.clipboard.writeText(title);
    setCopiedTitleIdx(idx);
    toast.success("Title copied!");
    setTimeout(() => setCopiedTitleIdx(null), 2000);
  };

  const handleCopyDraft = async () => {
    if (!brief) return;
    await navigator.clipboard.writeText(brief.draftParagraphs.join("\n\n"));
    setCopiedDraft(true);
    toast.success("Draft copied to clipboard!", {
      description: "Paste it directly into your editor or CMS.",
    });
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const toggleH2 = (idx: number) => {
    setExpandedH2s((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const draftPhaseLabels = ["Generating outline…", "Writing intro…", "Building body…"];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6 bg-[#0B0F17] min-h-screen">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} style={{ color: ACCENT }} />
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: ACCENT }}
          >
            Content Brief Generator
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          Turn Any Keyword into a{" "}
          <span style={{ color: ACCENT }}>Ready-to-Write</span> Brief
        </h1>
        <p className="text-sm mt-2" style={{ color: TEXT_DIM }}>
          Intent detection · SEO titles · H2/H3 outline · LSI keywords · First draft preview
        </p>
      </div>

      {/* Keyword Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: TEXT_MUTED }}
            />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDetect()}
              placeholder="e.g. SaaS SEO Audit Guide"
              className="w-full rounded-xl border py-3 pl-9 pr-4 text-sm text-white placeholder-[#64748B] outline-none transition-all focus:ring-1"
              style={{
                background: "#151B27",
                borderColor: BORDER,
                // @ts-expect-error CSS custom property
                "--tw-ring-color": ACCENT,
              }}
            />
          </div>
          <button
            onClick={handleDetect}
            disabled={!keyword.trim() || uiState === "detecting"}
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: ACCENT }}
          >
            {uiState === "detecting" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            Detect Intent
          </button>
          {(uiState === "brief_ready" || uiState === "generating" || uiState === "draft_ready") && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border px-4 py-3 text-xs font-medium transition-all hover:opacity-80"
              style={{ borderColor: BORDER, background: "#151B27", color: TEXT_MUTED }}
            >
              <RotateCcw size={12} />
              New
            </button>
          )}
        </div>

        {/* Intent Badge */}
        <AnimatePresence>
          {brief && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs" style={{ color: TEXT_MUTED }}>
                Detected intent:
              </span>
              {(() => {
                const cfg = INTENT_CONFIG[brief.intent];
                return (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
                    style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: cfg.dot }}
                    />
                    {brief.intent}
                  </span>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brief Panel */}
      <AnimatePresence>
        {brief && (uiState === "brief_ready" || uiState === "generating" || uiState === "draft_ready") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* A — Suggested Titles */}
            <GlassCard delay={0}>
              <SectionLabel icon={FileText} label="Suggested Titles" />
              <div className="space-y-2.5">
                {brief.titles.map((title, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                      style={{ background: `${ACCENT}18`, color: ACCENT }}
                    >
                      {idx + 1}
                    </span>
                    <p className="flex-1 text-sm font-medium leading-snug text-white">
                      {title}
                    </p>
                    <button
                      onClick={() => handleCopyTitle(title, idx)}
                      className="shrink-0 rounded p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/10"
                      style={{
                        color: copiedTitleIdx === idx ? EMERALD : TEXT_MUTED,
                      }}
                    >
                      {copiedTitleIdx === idx ? (
                        <Check size={13} />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* B — Content Outline */}
            <GlassCard delay={0.12}>
              <SectionLabel icon={BookOpen} label="Content Outline" />
              <div className="space-y-1">
                {brief.outline.map((item, idx) => (
                  <div key={idx}>
                    <button
                      onClick={() => toggleH2(idx)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <span
                        className="h-full w-0.5 shrink-0 self-stretch rounded-full"
                        style={{ background: `${ACCENT}60` }}
                      />
                      <span className="flex-1 text-sm font-semibold text-white">
                        {item.h2}
                      </span>
                      <ChevronDown
                        size={14}
                        style={{ color: TEXT_MUTED }}
                        className={`shrink-0 transition-transform duration-200 ${expandedH2s.has(idx) ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedH2s.has(idx) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="ml-6 pb-1 pl-3 space-y-1 border-l" style={{ borderColor: BORDER }}>
                            {item.h3s.map((h3, h3idx) => (
                              <div
                                key={h3idx}
                                className="flex items-center gap-2 py-1.5 px-2 text-xs rounded"
                                style={{ color: TEXT_DIM }}
                              >
                                <span
                                  className="h-1 w-1 shrink-0 rounded-full"
                                  style={{ background: TEXT_MUTED }}
                                />
                                {h3}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* C — Keyword Cloud */}
            <GlassCard delay={0.24}>
              <SectionLabel icon={BarChart2} label="Keyword Cloud & People Also Ask" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* LSI Keywords */}
                <div>
                  <p
                    className="mb-2.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: TEXT_MUTED }}
                  >
                    LSI Keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {brief.lsiKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
                        style={{
                          background: `${PURPLE}10`,
                          borderColor: `${PURPLE}30`,
                          color: "#a78bfa",
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PAA Questions */}
                <div>
                  <p
                    className="mb-2.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: TEXT_MUTED }}
                  >
                    People Also Ask
                  </p>
                  <div className="space-y-2">
                    {brief.paaQuestions.map((q) => (
                      <div key={q} className="flex items-start gap-2">
                        <HelpCircle
                          size={12}
                          className="mt-0.5 shrink-0"
                          style={{ color: "#F59E0B" }}
                        />
                        <span className="text-xs leading-relaxed" style={{ color: TEXT_DIM }}>
                          {q}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* D — Target Metrics */}
            <GlassCard delay={0.36}>
              <SectionLabel icon={BarChart2} label="Target Metrics" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Word Count */}
                <div
                  className="rounded-xl border p-4"
                  style={{ background: "#0D1424", borderColor: BORDER }}
                >
                  <p
                    className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: TEXT_MUTED }}
                  >
                    Word Count
                  </p>
                  <p className="text-xl font-bold" style={{ color: EMERALD }}>
                    {brief.wordCount}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: TEXT_MUTED }}>
                    words recommended
                  </p>
                </div>

                {/* Reading Level */}
                <div
                  className="rounded-xl border p-4"
                  style={{ background: "#0D1424", borderColor: BORDER }}
                >
                  <p
                    className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: TEXT_MUTED }}
                  >
                    Reading Level
                  </p>
                  <p className="text-xl font-bold text-blue-400">
                    {brief.readingLevel}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: TEXT_MUTED }}>
                    target audience
                  </p>
                </div>

                {/* Internal Links */}
                <div
                  className="rounded-xl border p-4"
                  style={{ background: "#0D1424", borderColor: BORDER }}
                >
                  <p
                    className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: TEXT_MUTED }}
                  >
                    Internal Link Suggestions
                  </p>
                  <div className="space-y-1">
                    {brief.internalLinks.map((link) => (
                      <div key={link} className="flex items-center gap-1.5">
                        <LinkIcon size={10} style={{ color: ACCENT, flexShrink: 0 }} />
                        <code
                          className="font-mono text-[10px] truncate"
                          style={{ color: TEXT_DIM }}
                        >
                          {link}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Generate First Draft CTA */}
            {uiState === "brief_ready" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.4 }}
              >
                <button
                  onClick={handleGenerateDraft}
                  className="relative w-full overflow-hidden rounded-xl py-4 text-sm font-bold text-white transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT} 0%, #E8541F 100%)`,
                    boxShadow: `0 0 24px rgba(255,100,45,0.35), 0 0 0 1px rgba(255,100,45,0.2)`,
                  }}
                >
                  {/* Pulse ring */}
                  <span
                    className="pointer-events-none absolute inset-0 animate-pulse rounded-xl"
                    style={{ boxShadow: `0 0 0 4px rgba(255,100,45,0.15)` }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    <Sparkles size={16} />
                    Generate First Draft
                  </span>
                </button>
              </motion.div>
            )}

            {/* Generating progress */}
            {uiState === "generating" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border p-4 space-y-3"
                style={{ background: "#151B27", borderColor: BORDER }}
              >
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" style={{ color: ACCENT }} />
                  <span className="text-xs font-medium" style={{ color: TEXT_DIM }}>
                    {draftPhaseLabels[draftPhase]}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: BORDER }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: ACCENT }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.8, ease: "linear" }}
                  />
                </div>
                <div className="flex gap-3">
                  {draftPhaseLabels.map((label, i) => (
                    <span
                      key={label}
                      className="text-[10px] font-medium"
                      style={{ color: i <= draftPhase ? ACCENT : TEXT_MUTED }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draft Preview */}
      <AnimatePresence>
        {brief && uiState === "draft_ready" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border p-6"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
              <Bot size={16} style={{ color: ACCENT }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[2px]"
                style={{ color: TEXT_MUTED }}
              >
                First Draft Preview
              </span>
              <span
                className="ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  borderColor: `${EMERALD}30`,
                  background: `${EMERALD}10`,
                  color: EMERALD,
                }}
              >
                ✓ Ready
              </span>
            </div>

            {/* Paragraphs */}
            <div className="space-y-4">
              {brief.draftParagraphs.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: "#CBD5E1" }}>
                  {para}
                </p>
              ))}
            </div>

            {/* Fade-out overlay */}
            <div
              className="pointer-events-none absolute bottom-20 left-0 right-0 h-16"
              style={{
                background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))",
              }}
            />

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleCopyDraft}
                className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
                style={
                  copiedDraft
                    ? { borderColor: `${EMERALD}40`, background: `${EMERALD}10`, color: EMERALD }
                    : { borderColor: BORDER, background: "#151B27", color: "#E2E8F0" }
                }
              >
                {copiedDraft ? <Check size={14} /> : <Copy size={14} />}
                {copiedDraft ? "Copied!" : "Copy to Editor"}
              </button>

              <AddToRoadmapButton
                task={{
                  id: `kw-${slugify(brief.keyword)}`,
                  type: "CONTENT",
                  title: `Write: "${brief.titles[0]}"`,
                  description: `${brief.wordCount} words · ${brief.readingLevel} · Keyword: ${brief.keyword}`,
                  impact: brief.intent === "Transactional" || brief.intent === "Commercial" ? "HIGH" : "MED",
                  effort: "90 min",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle empty state */}
      <AnimatePresence>
        {uiState === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-dashed py-16 text-center"
            style={{ borderColor: BORDER }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: `${ACCENT}12` }}
            >
              <Sparkles size={24} style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-base font-semibold text-white">
                Enter a keyword to get started
              </p>
              <p className="mt-1 max-w-xs text-sm" style={{ color: TEXT_DIM }}>
                Try{" "}
                {["SaaS SEO Audit Guide", "Best SEO Tools for Agencies", "Internal Linking Strategy"].map(
                  (ex, i, arr) => (
                    <span key={ex}>
                      <button
                        onClick={() => setKeyword(ex)}
                        className="underline underline-offset-2 transition-opacity hover:opacity-80"
                        style={{ color: ACCENT }}
                      >
                        {ex}
                      </button>
                      {i < arr.length - 1 ? ", " : ""}
                    </span>
                  )
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
