"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Plus,
  Upload,
  ChevronRight,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Link as LinkIcon,
  Search,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Zap,
  BarChart2,
  Eye,
  MousePointer,
  RefreshCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Activity,
  Layers,
  GitBranch,
  Target,
  FileText,
  Shield,
  Gauge,
  Network,
  Play,
  Download,
  Settings,
  Bell,
  Workflow,
  Share2,
  ArrowRight,
  Check,
  Info,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { normalizeUrl, isValidAuditUrl, extractAuditDomain } from "@/lib/url-validation";

// ─────────────────────────────────────────────────────────────────────────────
// Static Data
// ─────────────────────────────────────────────────────────────────────────────

const SPARK: Record<string, number[]> = {
  seo: [68, 72, 70, 75, 78, 80, 92],
  traffic: [120, 135, 128, 148, 160, 172, 187],
  keywords: [13200, 13400, 13100, 12900, 12700, 12500, 12450],
  backlinks: [3300, 3420, 3500, 3600, 3700, 3820, 3892],
};

const METRICS = [
  { label: "Organic Traffic", value: "187.3K", suffix: "", delta: "+12.8%", context: "Last 30 days", trend: "up" as const, sparkKey: "traffic", deltaColor: "#00C853", icon: TrendingUp },
  { label: "Keywords Ranking", value: "12,450", suffix: "", delta: "+340", context: "in top 100", trend: "up" as const, sparkKey: "keywords", deltaColor: "#00C853", icon: Search },
  { label: "Indexed Pages", value: "324", suffix: "", delta: "+18", context: "total pages", trend: "up" as const, sparkKey: "seo", deltaColor: "#00C853", icon: FileText },
  { label: "Backlinks", value: "3,892", suffix: "", delta: "+6.4%", context: "referring domains", trend: "up" as const, sparkKey: "backlinks", deltaColor: "#00C853", icon: LinkIcon },
];

const TRAFFIC_DATA = [
  { month: "Oct", organic: 141, paid: 14, direct: 28 },
  { month: "Nov", organic: 155, paid: 18, direct: 31 },
  { month: "Dec", organic: 148, paid: 22, direct: 27 },
  { month: "Jan", organic: 162, paid: 25, direct: 34 },
  { month: "Feb", organic: 170, paid: 21, direct: 36 },
  { month: "Mar", organic: 180, paid: 28, direct: 39 },
  { month: "Apr", organic: 187, paid: 30, direct: 42 },
];

const RANKINGS_DATA = [
  { month: "Jan", top3: 18, top10: 42, top100: 95 },
  { month: "Feb", top3: 22, top10: 50, top100: 108 },
  { month: "Mar", top3: 28, top10: 58, top100: 120 },
  { month: "Apr", top3: 35, top10: 68, top100: 134 },
];

const HEALTH_TREND = [
  { month: "Oct", score: 74 },
  { month: "Nov", score: 78 },
  { month: "Dec", score: 76 },
  { month: "Jan", score: 82 },
  { month: "Feb", score: 88 },
  { month: "Mar", score: 92 },
];

const ERRORS_TREND = [
  { month: "Oct", errors: 28 },
  { month: "Nov", errors: 24 },
  { month: "Dec", errors: 21 },
  { month: "Jan", errors: 18 },
  { month: "Feb", errors: 15 },
  { month: "Mar", errors: 12 },
];

const CRAWL_TREND = [
  { month: "Oct", pages: 280 },
  { month: "Nov", pages: 290 },
  { month: "Dec", pages: 298 },
  { month: "Jan", pages: 305 },
  { month: "Feb", pages: 315 },
  { month: "Mar", pages: 324 },
];

const CRAWL_DISTRIBUTION = [
  { name: "Healthy", value: 280, color: "#00C853" },
  { name: "Broken", value: 9, color: "#FF3D3D" },
  { name: "Redirects", value: 18, color: "#FF9800" },
  { name: "Blocked", value: 17, color: "#6B7A99" },
];

const AUDITS = [
  { domain: "rankypulse.com", score: 92, issues: 44, status: "Completed", updated: "2h ago" },
  { domain: "clientsite.io",  score: 88, issues: 23, status: "Completed", updated: "1d ago" },
  { domain: "newproject.com", score: 74, issues: 61, status: "In Progress", updated: "3d ago" },
];

const COMPETITORS = [
  { domain: "semrush.com", traffic: "4.2M", keywords: "342K", score: 97 },
  { domain: "ahrefs.com", traffic: "2.8M", keywords: "218K", score: 94 },
  { domain: "moz.com", traffic: "1.1M", keywords: "98K", score: 89 },
];

const KEYWORD_DIST = [
  { label: "Top 3", count: 35, delta: "+4", pct: 26, color: "#FF642D" },
  { label: "Top 10", count: 68, delta: "+12", pct: 51, color: "#7B5CF5" },
  { label: "Top 100", count: 134, delta: "+33", pct: 100, color: "#4A6FA5" },
];

const PRIORITY_ISSUES = [
  { rank: 1, icon: FileText,    label: "Missing Meta Descriptions",  pages: 25, impact: "high",   action: "Fix Now",   actionHref: "/audits/issues", gain: "+3–5 ranking positions" },
  { rank: 2, icon: LinkIcon,    label: "Broken Internal Links",      pages: 12, impact: "high",   action: "View URLs", actionHref: "/audits/links",  gain: "+2–4 authority pages" },
  { rank: 3, icon: Zap,         label: "Large Images Slowing Pages", pages: 18, impact: "medium", action: "Optimize",  actionHref: "/audits/speed",  gain: null },
  { rank: 4, icon: AlertCircle, label: "Duplicate Title Tags",       pages: 8,  impact: "medium", action: "Fix Now",   actionHref: "/audits/issues", gain: null },
  { rank: 5, icon: Eye,         label: "Images Missing Alt Text",    pages: 34, impact: "low",    action: "Fix Now",   actionHref: "/audits/issues", gain: null },
];

const STACKED_CRAWL_DATA = [
  { name: "Mar", healthy: 280, broken: 9, redirects: 18, blocked: 17 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Animated Counter
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf: number;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(ease * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{current}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const h = 36, w = 80;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

function scoreColor(s: number) {
  if (s >= 80) return "#00C853";
  if (s >= 60) return "#FF9800";
  return "#FF3D3D";
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-sm font-bold text-white">{children}</h2>
      {action}
    </div>
  );
}

function Card({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("rounded-xl border p-6 flex flex-col transition-transform duration-200 hover:-translate-y-0.5", className)}
      style={{ background: "#151B27", borderColor: "#1E2940", boxShadow: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)", ...style }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 text-xs shadow-2xl" style={{ background: "#0D1424", borderColor: "#1E2940", color: "#C8D0E0" }}>
      <p className="font-semibold mb-1" style={{ color: "#8B9BB4" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize" style={{ color: "#8B9BB4" }}>{p.dataKey}:</span>
          <span className="font-bold text-white">{p.value}{typeof p.value === "number" && p.value > 100 ? "K" : ""}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 – Header / Project Control Bar
// ─────────────────────────────────────────────────────────────────────────────
function ProjectControlBar({ onRunAudit }: { onRunAudit: () => void }) {
  const [crawlDone, setCrawlDone] = useState(false);
  const [domainOpen, setDomainOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("rankypulse.com");
  const domains = ["rankypulse.com", "clientsite.io", "newproject.com"];

  const handleRunAudit = () => {
    setCrawlDone(false);
    onRunAudit();
    setTimeout(() => setCrawlDone(true), 2000);
  };

  return (
    <div
      className="rounded-xl border px-5 py-3.5 flex flex-wrap items-center gap-3 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(21,27,39,0.95) 0%, rgba(13,20,36,0.98) 100%)",
        borderColor: "#1E2940",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,100,45,0.3), transparent)" }} />

      {/* Domain Selector */}
      <div className="relative">
        <button
          onClick={() => setDomainOpen(!domainOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border transition-all hover:border-[#FF642D]/40 group"
          style={{ background: "#0D1424", borderColor: "#1E2940" }}
        >
          {/* favicon placeholder */}
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg,#FF642D,#E85420)" }}>R</div>
          <span className="text-sm font-semibold text-white">{selectedDomain}</span>
          {/* status dot */}
          <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: "#00C853" }} />
          <ChevronDown size={13} style={{ color: "#6B7A99" }} />
        </button>
        <AnimatePresence>
          {domainOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-1 left-0 z-50 rounded-xl border shadow-2xl overflow-hidden min-w-[200px]"
              style={{ background: "#0D1424", borderColor: "#1E2940" }}
            >
              {domains.map((d) => (
                <button
                  key={d}
                  onClick={() => { setSelectedDomain(d); setDomainOpen(false); }}
                  className={cn("w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-white/[0.04] text-left", selectedDomain === d ? "text-white font-semibold" : "text-[#8B9BB4]")}
                >
                  <div className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ background: "linear-gradient(135deg,#FF642D,#E85420)" }}>{d[0].toUpperCase()}</div>
                  {d}
                  {selectedDomain === d && <Check size={12} className="ml-auto" style={{ color: "#FF642D" }} />}
                </button>
              ))}
              <div className="border-t mx-2" style={{ borderColor: "#1E2940" }} />
              <button className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-[#FF642D] hover:bg-white/[0.04] transition-colors">
                <Plus size={13} /> Add Website
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="h-6 w-px hidden sm:block" style={{ background: "#1E2940" }} />

      {/* Meta Info */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7A99" }}>
          <Layers size={12} style={{ color: "#4A5568" }} />
          <span className="text-white font-semibold">324</span> pages crawled
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7A99" }}>
          <Clock size={12} style={{ color: "#4A5568" }} />
          Last audit: <span className="text-white font-semibold ml-1">2 hours ago</span>
        </div>
      </div>

      {/* Crawl-done badge */}
      <AnimatePresence>
        {crawlDone && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(0,200,83,0.15)", color: "#00C853", border: "1px solid rgba(0,200,83,0.25)" }}
          >
            <Check size={11} /> Crawl completed
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2 flex-wrap">
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all hover:bg-white/[0.04] hover:border-[#1E2940]"
          style={{ background: "transparent", borderColor: "#1E2940", color: "#8B9BB4" }}
        >
          <Calendar size={13} /> Schedule
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all hover:bg-white/[0.04]"
          style={{ background: "transparent", borderColor: "#1E2940", color: "#8B9BB4" }}
        >
          <Download size={13} /> Export Report
        </button>
        <button
          onClick={handleRunAudit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg,#FF642D,#E85420)", boxShadow: "0 0 20px rgba(255,100,45,0.25)" }}
        >
          <Play size={12} className="fill-white" /> Run Audit
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 – Site Health Hero + Issue Severity
// ─────────────────────────────────────────────────────────────────────────────
function SiteHealthHero({ score = 92 }: { score?: number }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <Card className="items-center text-center" style={{
      background: "linear-gradient(135deg, #151B27 0%, #0D1424 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* glow orb */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(circle at 50% 60%, rgba(255,100,45,0.12) 0%, transparent 70%)",
      }} />
      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#6B7A99", letterSpacing: "0.12em" }}>Site Health</p>
      <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={r} stroke="#1a2236" strokeWidth="12" fill="none" />
          <motion.circle
            cx="80" cy="80" r={r}
            stroke="url(#heroGaugeGrad)" strokeWidth="12" fill="none"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 14px rgba(255,100,45,0.7))" }}
          />
          <defs>
            <linearGradient id="heroGaugeGrad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF9D40" />
              <stop offset="100%" stopColor="#FF642D" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-white leading-none tabular-nums">
            <AnimatedNumber target={score} duration={1400} />
          </span>
          <span className="text-xs font-medium mt-0.5" style={{ color: "#6B7A99" }}>/ 100</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-1.5 mt-3 text-sm font-semibold"
        style={{ color: "#00C853" }}
      >
        <ArrowUpRight size={15} /> +4 since last crawl
      </motion.div>
      <div className="mt-4 px-4 py-2 rounded-full text-xs font-bold" style={{ background: "rgba(0,200,83,0.15)", color: "#00C853" }}>
        Excellent
      </div>

      {/* Colored bar breakdown */}
      {(() => {
        const breakdown = [
          { label: "Errors",   count: 12, color: "#FF3D3D", tooltip: "Critical SEO problems — fix immediately to prevent ranking loss" },
          { label: "Warnings", count: 37, color: "#FF9800", tooltip: "Important issues that hurt performance but aren't blocking" },
          { label: "Notices",  count: 54, color: "#00B0FF", tooltip: "Minor improvements for better optimization" },
        ];
        const total = breakdown.reduce((s, r) => s + r.count, 0);
        return (
          <div className="mt-5 w-full space-y-2.5">
            {breakdown.map((row) => (
              <div key={row.label} title={row.tooltip} className="cursor-help group/bar">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: row.color }} />
                    <span className="text-[11px] font-medium" style={{ color: "#8B9BB4" }}>{row.label}</span>
                    <Info size={10} style={{ color: "#2E4166" }} className="opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: row.color }}>{row.count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#1a2236" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: row.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(row.count / total) * 100}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </Card>
  );
}

function IssueSeverityPanel({ onNavigate }: { onNavigate: (path: string) => void }) {
  const issues = [
    {
      label: "Errors",
      count: 12,
      delta: -3,
      color: "#FF3D3D",
      bg: "rgba(255,61,61,0.10)",
      border: "rgba(255,61,61,0.20)",
      icon: XCircle,
      desc: "Critical Issues",
      bars: [8, 14, 10, 16, 12],
      path: "/audits/issues",
    },
    {
      label: "Warnings",
      count: 37,
      delta: -8,
      color: "#FF9800",
      bg: "rgba(255,152,0,0.10)",
      border: "rgba(255,152,0,0.20)",
      icon: AlertTriangle,
      desc: "Important Issues",
      bars: [42, 38, 45, 40, 37],
      path: "/audits/issues",
    },
    {
      label: "Notices",
      count: 54,
      delta: +5,
      color: "#00B0FF",
      bg: "rgba(0,176,255,0.10)",
      border: "rgba(0,176,255,0.20)",
      icon: AlertCircle,
      desc: "Minor Issues",
      bars: [50, 52, 48, 54, 54],
      path: "/audits/issues",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {issues.map((iss, i) => {
        const barMax = Math.max(...iss.bars);
        return (
          <motion.div
            key={iss.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            onClick={() => onNavigate(iss.path)}
            className="rounded-xl border p-5 cursor-pointer group transition-all hover:scale-[1.01] relative overflow-hidden"
            style={{ background: iss.bg, borderColor: iss.border }}
          >
            {/* mini bar chart background */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end gap-0.5 px-3 pb-0 opacity-25 h-12">
              {iss.bars.map((b, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{ height: `${(b / barMax) * 100}%`, background: iss.color }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <iss.icon size={18} style={{ color: iss.color }} />
                <span
                  className="flex items-center gap-0.5 text-xs font-semibold"
                  style={{ color: iss.delta < 0 ? "#00C853" : "#FF9800" }}
                >
                  {iss.delta < 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                  {Math.abs(iss.delta)} since last scan
                </span>
              </div>
              <div className="text-4xl font-black tabular-nums" style={{ color: iss.color }}>
                <AnimatedNumber target={iss.count} duration={1000 + i * 150} />
              </div>
              <p className="text-sm font-bold text-white mt-1">{iss.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "#6B7A99" }}>{iss.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 5 – Crawl Overview Panel
// ─────────────────────────────────────────────────────────────────────────────
function CrawlOverviewPanel() {
  const stats = [
    { label: "Pages Crawled", value: 324, color: "#C8D0E0", icon: Globe },
    { label: "Healthy Pages", value: 280, color: "#00C853", icon: CheckCircle },
    { label: "Broken Pages", value: 9, color: "#FF3D3D", icon: XCircle },
    { label: "Redirects", value: 18, color: "#FF9800", icon: RefreshCcw },
    { label: "Blocked Pages", value: 17, color: "#6B7A99", icon: Shield },
  ];
  const total = 324;

  return (
    <Card>
      <SectionTitle action={
        <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#6B7A99", background: "#1E2940" }}>Mar 2026</span>
      }>
        Crawl Overview
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: stats list */}
        <div className="space-y-3">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <s.icon size={14} style={{ color: s.color }} className="shrink-0" />
              <span className="text-xs flex-1" style={{ color: "#8B9BB4" }}>{s.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "#1a2236" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.value / total) * 100}%` }}
                    transition={{ delay: 0.2 + i * 0.07, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <span className="w-8 text-xs font-bold text-right text-white tabular-nums">{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: donut + stacked bar */}
        <div className="flex flex-col gap-4">
          {/* Donut */}
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={CRAWL_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {CRAWL_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0D1424", border: "1px solid #1E2940", borderRadius: 8, color: "#C8D0E0", fontSize: 11 }}
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{total}</span>
              <span className="text-[10px]" style={{ color: "#6B7A99" }}>total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-1.5">
            {CRAWL_DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]" style={{ color: "#8B9BB4" }}>
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
                {d.name}: <span className="font-bold text-white ml-0.5">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 6 – Core Web Vitals Panel
// ─────────────────────────────────────────────────────────────────────────────
function CoreWebVitalsPanel() {
  const vitals = [
    { label: "LCP", name: "Largest Contentful Paint", value: "2.3s", score: 73, status: "good", threshold: { good: "< 2.5s", poor: "> 4s" } },
    { label: "INP", name: "Interaction to Next Paint", value: "210ms", score: 45, status: "needs-improvement", threshold: { good: "< 200ms", poor: "> 500ms" } },
    { label: "CLS", name: "Cumulative Layout Shift", value: "0.04", score: 90, status: "good", threshold: { good: "< 0.1", poor: "> 0.25" } },
    { label: "FCP", name: "First Contentful Paint", value: "1.1s", score: 88, status: "good", threshold: { good: "< 1.8s", poor: "> 3s" } },
  ];

  const statusConfig: Record<string, { color: string; label: string; bg: string }> = {
    good: { color: "#00C853", label: "Good", bg: "rgba(0,200,83,0.12)" },
    "needs-improvement": { color: "#FF9800", label: "Needs Improvement", bg: "rgba(255,152,0,0.12)" },
    poor: { color: "#FF3D3D", label: "Poor", bg: "rgba(255,61,61,0.12)" },
  };

  return (
    <Card>
      <SectionTitle action={
        <button className="text-xs font-semibold flex items-center gap-1" style={{ color: "#FF642D" }}>
          View Details <ArrowRight size={11} />
        </button>
      }>
        Core Web Vitals
      </SectionTitle>
      <div className="space-y-4">
        {vitals.map((v, i) => {
          const cfg = statusConfig[v.status];
          const barColor = v.score >= 80 ? "#00C853" : v.score >= 50 ? "#FF9800" : "#FF3D3D";
          return (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="group"
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs font-bold text-white w-8 shrink-0">{v.label}</span>
                  <span className="text-[11px] truncate hidden sm:block" style={{ color: "#6B7A99" }}>{v.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-white">{v.value}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1a2236" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${v.score}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px]" style={{ color: "#4A5568" }}>Good {v.threshold.good}</span>
                <span className="text-[10px]" style={{ color: "#4A5568" }}>Poor {v.threshold.poor}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 7 – "Fix These First" Priority List
// ─────────────────────────────────────────────────────────────────────────────
function FixTheseFirst({ onNavigate }: { onNavigate: (path: string) => void }) {
  const impactConfig: Record<string, { color: string; bg: string; label: string }> = {
    high:   { color: "#FF642D", bg: "rgba(255,100,45,0.12)", label: "High Impact" },
    medium: { color: "#FF9800", bg: "rgba(255,152,0,0.12)",  label: "Medium Impact" },
    low:    { color: "#00B0FF", bg: "rgba(0,176,255,0.12)",  label: "Low Impact" },
  };

  return (
    <Card>
      <SectionTitle action={
        <button className="text-xs font-semibold flex items-center gap-1" style={{ color: "#FF642D" }}
          onClick={() => onNavigate("/audits/issues")}>
          View All Issues <ArrowRight size={11} />
        </button>
      }>
        Fix These First
      </SectionTitle>
      <div className="space-y-0">
        {PRIORITY_ISSUES.map((issue, i) => {
          const cfg = impactConfig[issue.impact];
          return (
            <motion.div
              key={issue.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              className={cn("flex items-center gap-3 py-3.5 cursor-pointer group", i < PRIORITY_ISSUES.length - 1 ? "border-b" : "")}
              style={i < PRIORITY_ISSUES.length - 1 ? { borderColor: "#1a2236" } : {}}
              onClick={() => onNavigate(issue.actionHref)}
            >
              {/* rank */}
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                style={{ background: "#1a2236", color: "#4A5568" }}>
                {issue.rank}
              </div>
              {/* icon */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                <issue.icon size={15} style={{ color: cfg.color }} />
              </div>
              {/* text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{issue.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#6B7A99" }}>
                  <span className="font-bold" style={{ color: cfg.color }}>{issue.pages}</span> pages affected
                  {issue.gain && (
                    <span className="ml-1.5" style={{ color: "rgba(255,100,45,0.6)" }}>· {issue.gain}</span>
                  )}
                </p>
              </div>
              {/* impact badge + action button */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
                <button
                  className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                  style={{ background: "rgba(255,100,45,0.15)", color: "#FF642D" }}
                  onClick={(e) => { e.stopPropagation(); onNavigate(issue.actionHref); }}
                >
                  {issue.action} →
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Potential SEO Gain bar */}
      <div className="mt-4 rounded-lg px-4 py-3 flex items-start gap-2.5"
        style={{ background: "rgba(255,100,45,0.07)", border: "1px solid rgba(255,100,45,0.15)" }}>
        <TrendingUp size={14} style={{ color: "#FF642D", marginTop: 1 }} className="shrink-0" />
        <p className="text-[12px] leading-relaxed" style={{ color: "#8B9BB4" }}>
          <span className="font-bold" style={{ color: "#FF642D" }}>Fixing these 5 issues</span> could improve:{" "}
          <span className="font-semibold text-white">+12% organic traffic</span>
          {" · "}
          <span className="font-semibold text-white">+38 ranking keywords</span>
        </p>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 8 – SEO Trend Charts
// ─────────────────────────────────────────────────────────────────────────────
function SEOTrendCharts() {
  const charts = [
    {
      title: "Site Health Trend",
      data: HEALTH_TREND,
      key: "score",
      color: "#FF642D",
      gradId: "healthGrad",
      unit: "",
      suffix: "/100",
    },
    {
      title: "Errors Trend",
      data: ERRORS_TREND,
      key: "errors",
      color: "#FF3D3D",
      gradId: "errorsGrad",
      unit: "",
      suffix: "",
    },
    {
      title: "Pages Crawled",
      data: CRAWL_TREND,
      key: "pages",
      color: "#7B5CF5",
      gradId: "crawlGrad",
      unit: "",
      suffix: "",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {charts.map((chart, i) => (
        <motion.div
          key={chart.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.07 }}
        >
          <Card className="gap-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-white">{chart.title}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-lg" style={{ background: "#1E2940", color: "#6B7A99" }}>6mo</span>
            </div>
            {/* big value */}
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-black tabular-nums" style={{ color: chart.color }}>
                {chart.data[chart.data.length - 1][chart.key as keyof typeof chart.data[0]]}
              </span>
              {chart.suffix && <span className="text-xs" style={{ color: "#4A5568" }}>{chart.suffix}</span>}
            </div>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={chart.data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={chart.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chart.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ background: "#0D1424", border: "1px solid #1E2940", borderRadius: 8, color: "#C8D0E0", fontSize: 11 }}
                    cursor={{ stroke: "#1E2940" }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chart.key}
                    stroke={chart.color}
                    fill={`url(#${chart.gradId})`}
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 9 – Internal Linking Snapshot
// ─────────────────────────────────────────────────────────────────────────────
function InternalLinkingSnapshot({ onNavigate }: { onNavigate: (path: string) => void }) {
  const stats = [
    { label: "Orphan Pages", value: 7, color: "#FF3D3D", icon: FileText, desc: "Pages with no incoming internal links" },
    { label: "Deep Pages", value: 32, color: "#FF9800", icon: Layers, desc: "More than 3 clicks from homepage" },
    { label: "Broken Links", value: 23, color: "#FF642D", icon: LinkIcon, desc: "Internal links returning 4xx errors" },
  ];

  // Simple mini network visualization (SVG nodes)
  const nodes = [
    { x: 50, y: 30, r: 10, color: "#FF642D", label: "Home", tooltip: "Homepage\nDepth: 1 · Links: 3" },
    { x: 20, y: 65, r: 7,  color: "#7B5CF5", label: "",     tooltip: "/blog\nDepth: 2 · Links: 2" },
    { x: 80, y: 65, r: 7,  color: "#7B5CF5", label: "",     tooltip: "/features\nDepth: 2 · Links: 2" },
    { x: 10, y: 90, r: 5,  color: "#1E4D8C", label: "",     tooltip: "/blog/seo-guide\nDepth: 3 · Links: 1" },
    { x: 35, y: 90, r: 5,  color: "#FF3D3D", label: "!",    tooltip: "/blog/old-post\nBroken link" },
    { x: 65, y: 90, r: 5,  color: "#1E4D8C", label: "",     tooltip: "/features/audit\nDepth: 3 · Links: 1" },
    { x: 90, y: 90, r: 5,  color: "#FF3D3D", label: "!",    tooltip: "/page-404\nBroken link" },
    { x: 50, y: 90, r: 4,  color: "#4A5568", label: "",     tooltip: "/pricing\nDepth: 2 · Links: 0" },
  ];
  const edges = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [0, 7],
  ];

  return (
    <Card>
      <SectionTitle action={
        <button onClick={() => onNavigate("/audits/links")} className="text-xs font-semibold flex items-center gap-1" style={{ color: "#FF642D" }}>
          View Links <ArrowRight size={11} />
        </button>
      }>
        Internal Linking
      </SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stats */}
        <div className="space-y-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="flex items-start gap-3 p-3 rounded-xl cursor-pointer group transition-all hover:bg-white/[0.03]"
              style={{ border: "1px solid #1a2236" }}
              onClick={() => onNavigate("/audits/links")}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${s.color}18` }}>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{s.label}</p>
                  <span className="text-xl font-black tabular-nums" style={{ color: s.color }}>
                    <AnimatedNumber target={s.value} duration={900 + i * 100} />
                  </span>
                </div>
                <p className="text-[10px] mt-0.5 truncate" style={{ color: "#4A5568" }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Mini network graph */}
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 100 110" className="w-full max-w-[220px] opacity-80">
            {edges.map(([from, to], i) => (
              <line
                key={i}
                x1={nodes[from].x} y1={nodes[from].y}
                x2={nodes[to].x} y2={nodes[to].y}
                stroke="#1E2940" strokeWidth="1"
              />
            ))}
            {nodes.map((node, i) => (
              <g key={i} style={{ cursor: "pointer" }}>
                <title>{node.tooltip}</title>
                <circle cx={node.x} cy={node.y} r={node.r + 2} fill={`${node.color}15`} />
                <circle cx={node.x} cy={node.y} r={node.r} fill={node.color} opacity="0.85" />
                {node.label && (
                  <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize="5" fontWeight="bold">{node.label}</text>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 10 – Quick Actions Panel
// ─────────────────────────────────────────────────────────────────────────────
function QuickActionsPanel({ onNavigate }: { onNavigate: (path: string) => void }) {
  const actions = [
    { icon: Play, label: "Run New Audit", desc: "Start a fresh crawl", color: "#FF642D", bg: "linear-gradient(135deg,#FF642D,#E85420)", path: "/audits/full", primary: true },
    { icon: Download, label: "Export Report", desc: "PDF / CSV download", color: "#7B5CF5", bg: "rgba(123,92,245,0.12)", path: "/reports", primary: false },
    { icon: Calendar, label: "Schedule Weekly Scan", desc: "Auto recurring audits", color: "#00B0FF", bg: "rgba(0,176,255,0.12)", path: "/settings", primary: false },
    { icon: Plus, label: "Add New Website", desc: "Monitor another domain", color: "#00C853", bg: "rgba(0,200,83,0.12)", path: "/audits", primary: false },
  ];

  return (
    <Card>
      <SectionTitle>Quick Actions</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act, i) => (
          <motion.button
            key={act.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.07 }}
            onClick={() => onNavigate(act.path)}
            className={cn(
              "flex flex-col items-start gap-3 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] text-left group",
              act.primary ? "text-white sm:col-span-2 lg:col-span-2" : ""
            )}
            style={{
              background: act.primary ? act.bg : act.bg,
              borderColor: act.primary ? "rgba(255,100,45,0.3)" : "#1E2940",
              boxShadow: act.primary ? "0 0 24px rgba(255,100,45,0.2)" : "none",
            }}
          >
            <div className={cn(act.primary ? "w-12 h-12" : "w-10 h-10", "rounded-xl flex items-center justify-center", act.primary ? "bg-white/20" : "")}
              style={!act.primary ? { background: act.bg } : {}}>
              <act.icon size={act.primary ? 22 : 18} style={{ color: act.primary ? "#fff" : act.color }} className={act.primary ? "fill-white" : ""} />
            </div>
            <div>
              <p className={cn("text-sm font-bold", act.primary ? "text-white" : "text-white")}>{act.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: act.primary ? "rgba(255,255,255,0.6)" : "#6B7A99" }}>{act.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit CTA Widget — top-of-dashboard conversion card
// ─────────────────────────────────────────────────────────────────────────────
const EXAMPLE_DOMAINS = ["example.com", "shopify-store.com", "localbusiness.com", "yourbrand.com"];

function AuditCTAWidget() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx(i => (i + 1) % EXAMPLE_DOMAINS.length), 2500);
    return () => clearInterval(id);
  }, []);

  const checks = [
    "Find broken links",
    "Detect SEO errors",
    "Discover ranking opportunities",
    "Improve your site health score",
  ];

  // Deterministic live preview estimates based on domain chars (no API call)
  const preview = domain.length > 4 ? {
    pages:  80  + (domain.charCodeAt(0) % 400),
    issues: 8   + (domain.charCodeAt(1) % 40),
    health: 60  + (domain.charCodeAt(2) % 30),
  } : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = domain.trim();
    if (!trimmed) { setError("Enter your website domain"); return; }
    const normalized = normalizeUrl(trimmed);
    if (!isValidAuditUrl(normalized)) { setError("Enter a valid domain, e.g. yoursite.com"); return; }
    const clean = extractAuditDomain(normalized);
    router.push(`/report/${clean}`);
  };

  return (
    <div className="rounded-xl border relative overflow-hidden p-6"
      style={{ background: "linear-gradient(135deg,#0F1A2E 0%,#0D1424 100%)", borderColor: "#1E2940" }}>
      {/* Orange glow top-left */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "#FF642D", transform: "translate(-40%,-40%)" }} />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Left: headline + checklist */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,100,45,0.15)" }}>
              <Zap size={16} style={{ color: "#FF642D" }} className="fill-[#FF642D]" />
            </div>
            <h2 className="text-[17px] font-extrabold text-white leading-tight">
              Discover What&apos;s Holding Your Website Back
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: "#6B7A99" }}>
            Run a full technical SEO audit in under 60 seconds.
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {checks.map((c) => (
              <div key={c} className="flex items-center gap-1.5 text-[12px]" style={{ color: "#8B9BB4" }}>
                <Check size={12} style={{ color: "#00C853" }} className="shrink-0" />
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:w-[420px] shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setError(""); }}
              placeholder={EXAMPLE_DOMAINS[placeholderIdx]}
              className="flex-1 px-4 py-2.5 rounded-lg border text-sm text-white outline-none transition-all focus:border-[#FF642D]/50"
              style={{ background: "#0D1424", borderColor: "#1E2940", color: "white" }}
            />
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="shrink-0"
            >
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg text-sm font-bold text-white whitespace-nowrap transition-all hover:opacity-90 active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg,#FF642D,#E85420)", boxShadow: "0 0 20px rgba(255,100,45,0.3)" }}
              >
                Run Free Audit →
              </button>
            </motion.div>
          </form>

          {/* Error */}
          {error && (
            <p className="text-[11px] mt-1.5" style={{ color: "#FF3D3D" }}>{error}</p>
          )}

          {/* Live preview estimates */}
          {preview && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2 flex-wrap"
            >
              <span className="text-[11px] font-semibold" style={{ color: "#4A5568" }}>Estimated:</span>
              {[
                { label: "Pages", value: `~${preview.pages}` },
                { label: "Issues", value: `~${preview.issues}` },
                { label: "Health", value: `~${preview.health}/100` },
              ].map((p) => (
                <span key={p.label} className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,100,45,0.1)", color: "#FF642D" }}>
                  {p.label}: {p.value}
                </span>
              ))}
            </motion.div>
          )}

          {/* Trust signals */}
          <p className="text-[11px] mt-2.5" style={{ color: "#2E4166" }}>
            No signup required &nbsp;·&nbsp; Results in 60 seconds &nbsp;·&nbsp; Trusted by 10,000+ marketers
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO Opportunity Score
// ─────────────────────────────────────────────────────────────────────────────
function SEOOpportunityScore({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,rgba(255,100,45,0.12) 0%,rgba(13,20,36,0.98) 100%)", borderColor: "rgba(255,100,45,0.25)" }}>
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "#FF642D", transform: "translate(30%,-30%)" }} />
      <div className="relative flex-1">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#FF642D" }}>SEO Opportunity Score</p>
        <p className="text-white font-extrabold text-lg leading-tight">
          Fixing detected issues could increase traffic by{" "}
          <span style={{ color: "#FF642D" }}>+12%</span>
        </p>
        <p className="text-xs mt-1" style={{ color: "#6B7A99" }}>
          Based on 5 open issues · Estimated +1,840 monthly visits
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 relative">
        <div className="text-center">
          <div className="text-3xl font-black" style={{ color: "#FF642D" }}>+12%</div>
          <div className="text-[10px]" style={{ color: "#4A5568" }}>Traffic</div>
        </div>
        <div className="w-px h-10" style={{ background: "rgba(255,100,45,0.2)" }} />
        <div className="text-center">
          <div className="text-3xl font-black" style={{ color: "#7B5CF5" }}>+38</div>
          <div className="text-[10px]" style={{ color: "#4A5568" }}>Keywords</div>
        </div>
        <button
          onClick={() => onNavigate("/audits/issues")}
          className="ml-3 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg,#FF642D,#E85420)" }}>
          Start Fixing →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO Roadmap Panel
// ─────────────────────────────────────────────────────────────────────────────
function SEORoadmap({ onNavigate }: { onNavigate: (path: string) => void }) {
  const steps = [
    { step: 1, title: "Fix Broken Links",           desc: "12 internal links returning 4xx errors", status: "urgent",  href: "/audits/links",  color: "#FF3D3D" },
    { step: 2, title: "Optimize Meta Descriptions", desc: "25 pages missing meta descriptions",      status: "next",    href: "/audits/issues", color: "#FF9800" },
    { step: 3, title: "Improve Core Web Vitals",    desc: "INP 210ms — Needs Improvement",           status: "planned", href: "/audits/speed",  color: "#00B0FF" },
  ];
  const statusLabel: Record<string, string> = { urgent: "Do Now", next: "Up Next", planned: "Planned" };

  return (
    <Card>
      <SectionTitle action={
        <button onClick={() => onNavigate("/audits/issues")} className="text-xs font-semibold flex items-center gap-1" style={{ color: "#FF642D" }}>
          View Full Plan <ArrowRight size={11} />
        </button>
      }>
        Your SEO Roadmap
      </SectionTitle>
      <p className="text-xs mb-4 -mt-1" style={{ color: "#4A5568" }}>
        Prioritized action plan to improve your rankings
      </p>
      <div className="relative">
        <div className="absolute left-[19px] top-6 bottom-6 w-px" style={{ background: "#1E2940" }} />
        <div className="space-y-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i }}
              className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/[0.03]"
              style={{ border: "1px solid #1a2236" }}
              onClick={() => onNavigate(s.href)}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-black relative z-10"
                style={{ background: `${s.color}18`, color: s.color, border: `2px solid ${s.color}40` }}>
                {s.step}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{s.title}</p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: "#6B7A99" }}>{s.desc}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${s.color}15`, color: s.color }}>
                  {statusLabel[s.status]}
                </span>
                <ArrowRight size={13} style={{ color: "#4A5568" }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────
export function DashboardClient() {
  const router = useRouter();
  const [trafficTab, setTrafficTab] = useState<"rankypulse" | "google">("rankypulse");
  const [trafficPeriod, setTrafficPeriod] = useState<"7D"|"30D"|"90D"|"12M">("30D");

  const navigate = (path: string) => router.push(path);

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* ── 1. Project Control Bar ─────────────────────────────────────────── */}
      <ProjectControlBar onRunAudit={() => router.push("/audits/full")} />

      {/* ── Audit CTA Widget ───────────────────────────────────────────────── */}
      <AuditCTAWidget />

      {/* ── 2. Hero Row: Site Health + Issue Severity ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Site Health Hero – 3 cols */}
        <div className="lg:col-span-3">
          <SiteHealthHero score={92} />
        </div>

        {/* Right side – Issue Severity + KPI cards stacked – 9 cols */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          <IssueSeverityPanel onNavigate={navigate} />

          {/* ── 4. SEO Performance Snapshot (4 KPI cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="rounded-xl border p-5 cursor-pointer transition-all duration-200 group hover:border-[#FF642D]/40 hover:-translate-y-0.5 relative overflow-hidden"
                style={{ background: "#151B27", borderColor: "#1E2940" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "radial-gradient(circle at top left, rgba(255,100,45,0.06) 0%, transparent 70%)" }} />
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-semibold" style={{ color: "#6B7A99" }}>{m.label}</p>
                  <m.icon size={14} style={{ color: "#4A5568" }} />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-white leading-none">{m.value}</span>
                      {m.suffix && <span className="text-sm font-medium" style={{ color: "#6B7A99" }}>{m.suffix}</span>}
                    </div>
                    <div className="flex items-center gap-0.5 mt-1.5 text-xs font-semibold" style={{ color: m.deltaColor }}>
                      {m.trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {m.delta}
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "#4A5568" }}>{m.context}</p>
                  </div>
                  <Sparkline data={SPARK[m.sparkKey]} color={m.deltaColor} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Traffic Analytics (full width) ─────────────────────────────── */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white">Traffic Analytics</h2>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#1E2940" }}>
              {(["rankypulse", "google"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTrafficTab(tab)}
                  className={cn("px-3 py-1.5 text-xs font-semibold transition-colors capitalize", trafficTab === tab ? "text-white" : "text-[#6B7A99] hover:text-[#C8D0E0]")}
                  style={trafficTab === tab ? { background: "#FF642D" } : { background: "#0D1424" }}
                >
                  {tab === "rankypulse" ? "🔸 RankyPulse Data" : "📊 Google Data"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg overflow-hidden border" style={{ borderColor: "#1E2940" }}>
              {(["7D","30D","90D","12M"] as const).map((p) => (
                <button key={p} onClick={() => setTrafficPeriod(p)}
                  className="px-2.5 py-1 text-[11px] font-semibold transition-colors"
                  style={trafficPeriod === p ? { background: "#FF642D", color: "white" } : { background: "#0D1424", color: "#6B7A99" }}>
                  {p}
                </button>
              ))}
            </div>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#6B7A99", background: "#1E2940" }}>Scope: Root Domain</span>
          </div>
        </div>

        {/* CTR strip */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Impressions", value: "842K", delta: "+18%", color: "#7B5CF5", icon: Eye },
            { label: "Clicks (CTR)", value: "34.2K", delta: "+9.4%", color: "#00C853", icon: MousePointer },
            { label: "Avg Position", value: "14.3", delta: "-1.8", color: "#FF642D", icon: BarChart2 },
          ].map((s) => (
            <div key={s.label} className="rounded-lg px-4 py-3 border" style={{ background: "#0D1424", borderColor: "#1E2940" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon size={12} style={{ color: s.color }} />
                <span className="text-[11px]" style={{ color: "#6B7A99" }}>{s.label}</span>
              </div>
              <div className="text-lg font-extrabold text-white">{s.value}</div>
              <div className="text-[11px] font-semibold mt-0.5" style={{ color: s.color }}>{s.delta}</div>
            </div>
          ))}
        </div>

        <div className="min-h-[180px]">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={TRAFFIC_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="tgOrganic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF642D" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF642D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tgPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B5CF5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7B5CF5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tgDirect" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C853" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#00C853" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2236" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#1E2940" }} />
              <Area type="monotone" dataKey="organic" stroke="#FF642D" fill="url(#tgOrganic)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="paid" stroke="#7B5CF5" fill="url(#tgPaid)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="direct" stroke="#00C853" fill="url(#tgDirect)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-5 mt-3">
          {[{ label: "Organic", color: "#FF642D" }, { label: "Paid", color: "#7B5CF5" }, { label: "Direct", color: "#00C853" }].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: "#8B9BB4" }}>
              <span className="w-2.5 h-[3px] rounded-full inline-block" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </Card>

      {/* ── 5+6. Crawl Overview + Core Web Vitals ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CrawlOverviewPanel />
        <CoreWebVitalsPanel />
      </div>

      {/* ── 7. Fix These First + 8. SEO Trend Charts ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <FixTheseFirst onNavigate={navigate} />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Compact site health + keywords */}
          <Card className="gap-0">
            <SectionTitle>Quick Insights</SectionTitle>
            <div className="space-y-3">
              {[
                { icon: TrendingUp, label: "New Keywords Ranked",  value: "+35",   color: "#00C853", cta: { text: "View keywords",  href: "/features/keyword-explorer" } },
                { icon: AlertTriangle, label: "Issues Detected",   value: "16",    color: "#FF3D3D", cta: { text: "Fix now",        href: "/audits/issues" } },
                { icon: LinkIcon, label: "Backlinks Gained",       value: "2.1K",  color: "#7B5CF5", cta: { text: "See backlinks",  href: "/features/backlink-audit" } },
                { icon: Calendar, label: "Next Audit in",          value: "3 days", color: "#C8D0E0", cta: null },
              ].map((ins, idx, arr) => (
                <div key={ins.label}>
                  <div className="flex items-start gap-3 py-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ins.color}18` }}>
                      <ins.icon size={15} style={{ color: ins.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px]" style={{ color: "#6B7A99" }}>{ins.label}</p>
                      <p className="text-lg font-extrabold leading-tight" style={{ color: ins.color }}>{ins.value}</p>
                      {ins.cta && (
                        <button
                          onClick={() => router.push(ins.cta!.href)}
                          className="flex items-center gap-0.5 mt-0.5 text-[11px] font-semibold transition-opacity hover:opacity-80"
                          style={{ color: "#FF642D" }}
                        >
                          {ins.cta.text} <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                  {idx < arr.length - 1 && <div className="h-px" style={{ background: "#1a2236" }} />}
                </div>
              ))}
            </div>
          </Card>

          {/* Keyword Distribution */}
          <Card className="gap-0">
            <SectionTitle>Keyword Rankings</SectionTitle>
            <div className="min-h-[120px] mb-4">
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={RANKINGS_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="g3b" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF642D" stopOpacity={0.3} /><stop offset="95%" stopColor="#FF642D" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g10b" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7B5CF5" stopOpacity={0.25} /><stop offset="95%" stopColor="#7B5CF5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2236" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#4A5568", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4A5568", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0D1424", border: "1px solid #1E2940", borderRadius: 8, color: "#C8D0E0", fontSize: 11 }} cursor={{ stroke: "#1E2940" }} />
                  <Area type="monotone" dataKey="top3" stroke="#FF642D" fill="url(#g3b)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="top10" stroke="#7B5CF5" fill="url(#g10b)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {KEYWORD_DIST.map((kd) => (
                <div key={kd.label} className="flex items-center gap-3">
                  <span className="w-14 text-[11px] font-medium shrink-0 flex items-center gap-1.5" style={{ color: "#8B9BB4" }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: kd.color }} />{kd.label}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1a2236" }}>
                    <div className="h-full rounded-full" style={{ width: `${kd.pct}%`, background: kd.color }} />
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0 text-right">
                    <span className="text-[11px] font-bold" style={{ color: kd.color }}>{kd.count}</span>
                    <span className="text-[9px] font-semibold" style={{ color: "#00C853" }}>{kd.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── SEO Opportunity Score ──────────────────────────────────────────── */}
      <SEOOpportunityScore onNavigate={navigate} />

      {/* ── 8. SEO Trend Charts ────────────────────────────────────────────── */}
      <SEOTrendCharts />

      {/* ── 9. Internal Linking Snapshot ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InternalLinkingSnapshot onNavigate={navigate} />

        {/* Recent Audits */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1E2940" }}>
            <h2 className="text-sm font-bold text-white">Recent Audits</h2>
            <button onClick={() => router.push("/audits")} className="text-sm font-semibold transition-colors hover:opacity-80" style={{ color: "#FF642D" }}>View All</button>
          </div>
          <div className="grid grid-cols-5 px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#4A5568", borderBottom: "1px solid #1E2940" }}>
            <span className="col-span-2">Website</span><span>Score</span><span>Issues</span><span>Status</span>
          </div>
          {AUDITS.map((audit, i) => (
            <div
              key={audit.domain}
              className={cn("grid grid-cols-5 px-6 py-4 items-center cursor-pointer transition-colors hover:bg-white/[0.025]", i < AUDITS.length - 1 ? "border-b" : "")}
              style={i < AUDITS.length - 1 ? { borderColor: "#1E2940" } : {}}
              onClick={() => router.push(`/report/${audit.domain}`)}
            >
              <div className="col-span-2 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#1a2236" }}>
                  <Globe size={13} style={{ color: "#6B7A99" }} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-medium text-white block truncate">{audit.domain}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/report/${audit.domain}`); }}
                    className="text-[10px] font-semibold flex items-center gap-0.5 mt-0.5 transition-opacity hover:opacity-80"
                    style={{ color: "#FF642D" }}
                  >
                    View Report <ArrowRight size={9} />
                  </button>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold" style={{ color: scoreColor(audit.score) }}>{audit.score}</span>
                <span className="text-xs" style={{ color: "#4A5568" }}>/100</span>
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: audit.issues > 40 ? "#FF642D" : audit.issues > 20 ? "#FF9800" : "#00C853" }}
              >
                {audit.issues}
              </span>
              <span>
                {audit.status === "Completed" ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(0,200,83,0.12)", color: "#00C853" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" /> Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(0,176,255,0.12)", color: "#00B0FF" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> In Progress
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Competitor Snapshot ────────────────────────────────────────────── */}
      <Card>
        <SectionTitle action={
          <button onClick={() => router.push("/features/competitors")} className="text-xs font-semibold flex items-center gap-1" style={{ color: "#FF642D" }}>
            Full Report <ExternalLink size={11} />
          </button>
        }>
          Competitor Snapshot
        </SectionTitle>
        <p className="text-xs mb-4 -mt-1" style={{ color: "#4A5568" }}>
          Competitors ranking for your target keywords
        </p>
        <div className="grid grid-cols-4 text-xs font-semibold uppercase tracking-wider pb-2 mb-1" style={{ color: "#4A5568", borderBottom: "1px solid #1E2940" }}>
          <span className="col-span-2">Domain</span><span>Traffic</span><span>Score</span>
        </div>
        <div className="space-y-0">
          {COMPETITORS.map((comp, i) => (
            <div key={comp.domain} className={cn("grid grid-cols-4 py-3 items-center", i < COMPETITORS.length - 1 ? "border-b" : "")} style={i < COMPETITORS.length - 1 ? { borderColor: "#1a2236" } : {}}>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold text-white" style={{ background: `hsl(${i * 80 + 220}, 60%, 35%)` }}>
                  {comp.domain[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium text-white truncate">{comp.domain}</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: "#8B9BB4" }}>{comp.traffic}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: scoreColor(comp.score) }}>{comp.score}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1a2236" }}>
                  <div className="h-full rounded-full" style={{ width: `${comp.score}%`, background: scoreColor(comp.score) }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Organic Research ───────────────────────────────────────────────── */}
      <Card className="flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white mb-0.5">Organic Research</h2>
            <p className="text-xs" style={{ color: "#6B7A99" }}>Top performing keywords driving organic traffic</p>
          </div>
          <button onClick={() => router.push("/features/keyword-explorer")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-white/[0.04]" style={{ borderColor: "#1E2940", color: "#FF642D" }}>
            <Zap size={12} /> Explore Keywords
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Organic Keywords", value: "12,450", sub: "Keywords in top 100", icon: Search, color: "#FF642D" },
            { label: "Monthly Traffic", value: "187.3K", sub: "Estimated visits", icon: TrendingUp, color: "#00C853" },
            { label: "Traffic Value", value: "$42.1K", sub: "CPC equivalent", icon: BarChart2, color: "#7B5CF5" },
            { label: "SERP Features", value: "34", sub: "Featured snippets", icon: Globe, color: "#00B0FF" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg px-4 py-4 border" style={{ background: "#0D1424", borderColor: "#1a2236" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <stat.icon size={13} style={{ color: stat.color }} />
                <span className="text-[11px]" style={{ color: "#6B7A99" }}>{stat.label}</span>
              </div>
              <p className="text-xl font-extrabold text-white">{stat.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#4A5568" }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── SEO Roadmap ────────────────────────────────────────────────────── */}
      <SEORoadmap onNavigate={navigate} />

      {/* ── 10. Quick Actions ─────────────────────────────────────────────── */}
      <QuickActionsPanel onNavigate={navigate} />

    </div>
  );
}
