"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Zap,
  ExternalLink,
  MoreHorizontal,
  Cpu,
  BarChart3,
  Activity,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Generic Card Component ──
const DashboardCard = ({ children, title, subtitle, icon: Icon, extra, className }: any) => (
  <div className={cn("bg-[#171b26] border border-[#1e2336] rounded-xl overflow-hidden flex flex-col group hover:border-[#f97316]/30 transition-all duration-300", className)}>
    {(title || Icon) && (
      <div className="px-5 py-4 border-b border-[#1e2336] flex items-center justify-between bg-[#171b26]/50">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-[#1e2336] flex items-center justify-center text-[#f97316] group-hover:scale-110 transition-transform">
              <Icon size={16} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-[#e8eaf0] tracking-tight">{title}</h3>
            {subtitle && <p className="text-[10px] text-[#545a72] uppercase tracking-wider font-semibold">{subtitle}</p>}
          </div>
        </div>
        {extra && <div className="text-[#545a72]">{extra}</div>}
      </div>
    )}
    <div className="p-5 flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

export function DashboardClient() {
  const router = useRouter();

  return (
    <div className="p-6 flex flex-col gap-6 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header / Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall Score", value: "92", trend: "+2%", color: "text-[#22c55e]", bg: "bg-[#22c55e]/10", icon: Activity },
          { label: "Total Keywords", value: "1,240", trend: "+124", color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", icon: Search },
          { label: "Backlink Authority", value: "64", trend: "+4", color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10", icon: LinkIcon },
          { label: "AI Visibility", value: "78%", trend: "+5%", color: "text-[#f97316]", bg: "bg-[#f97316]/10", icon: Cpu },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-[#171b26] border border-[#1e2336] p-5 rounded-xl flex items-center gap-4 group hover:border-[#1e2336]/80 transition-all cursor-pointer"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#545a72] uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-[#e8eaf0] tracking-tight">{stat.value}</span>
                <span className={cn("text-[10px] font-bold flex items-center", stat.color)}>
                  <ArrowUpRight size={10} /> {stat.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── AI Search Visibility (4 Columns) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <DashboardCard
            title="AI Search Visibility"
            subtitle="Discovery Metrics"
            icon={Cpu}
            extra={<span className="text-[10px] font-bold bg-[#f97316]/10 text-[#f97316] px-2 py-0.5 rounded-full border border-[#f97316]/20">BETA</span>}
          >
            <div className="flex flex-col items-center py-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Circular Progress */}
                <svg className="w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#1a1e2e]" />
                  <circle
                    cx="72"
                    cy="72"
                    r="66"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={414.69}
                    strokeDashoffset={414.69 * (1 - 0.78)}
                    strokeLinecap="round"
                    className="text-[#f97316] drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#e8eaf0] tracking-tighter">78%</span>
                  <span className="text-[10px] font-bold text-[#545a72] tracking-[0.1em] uppercase">Visibility</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0c0e14]/50 border border-[#1e2336]/40">
                <span className="text-[#8b91a8] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" /> AI Mentions</span>
                <span className="text-[#e8eaf0] font-bold">428</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0c0e14]/50 border border-[#1e2336]/40">
                <span className="text-[#8b91a8] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" /> Cited Pages</span>
                <span className="text-[#e8eaf0] font-bold">156</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#545a72] uppercase tracking-widest border-b border-[#1e2336] pb-2 px-1">
                <span>Source</span>
                <span>Authority</span>
              </div>
              {[
                { name: "ChatGPT (Search)", value: 85, color: "bg-[#10a37f]" },
                { name: "AI Overviews (Google)", value: 72, color: "bg-[#4285f4]" },
                { name: "Perplexity", value: 64, color: "bg-[#20b2aa]" },
                { name: "Gemini", value: 58, color: "bg-[#818cf8]" },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between group cursor-pointer py-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1 h-3 rounded-full", item.color)} />
                    <span className="text-sm text-[#8b91a8] group-hover:text-[#e8eaf0] transition-colors">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[#e8eaf0]">{item.value}/100</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* ── SEO Overview Card (8 Columns) ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <DashboardCard title="SEO Overview" subtitle="Organic Performance" icon={TrendingUp}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
              {[
                { label: "Authority Score", value: "45", trend: "+1", color: "text-[#3b82f6]", desc: "Good" },
                { label: "Organic Traffic", value: "14.2K", trend: "+12%", color: "text-[#22c55e]", desc: "Monthly" },
                { label: "Organic Keywords", value: "2.1K", trend: "+84", color: "text-[#a78bfa]", desc: "Ranking" },
                { label: "Paid Keywords", value: "12", trend: "-2", color: "text-[#ef4444]", desc: "Active" },
                { label: "Domain Age", value: "4.2y", trend: "", color: "text-[#eab308]", desc: "Established" },
                { label: "Ref. Domains", value: "842", trend: "+26", color: "text-[#06b6d4]", desc: "Unique" },
              ].map((item, idx) => (
                <div key={item.label} className={cn("flex flex-col border-white/5", idx < 3 ? "pb-4" : "pt-4 border-t")}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#545a72] uppercase tracking-wider">{item.label}</span>
                    {item.trend && <span className={cn("text-[10px] font-bold", item.trend.startsWith('+') ? 'text-[#22c55e]' : 'text-[#ef4444]')}>{item.trend}</span>}
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-[#e8eaf0] tracking-tighter">{item.value}</span>
                    <span className="text-[10px] text-[#545a72] font-semibold">{item.desc}</span>
                  </div>
                  <div className="w-full h-1 bg-[#1e2336] rounded-full mt-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      className={cn("h-full", item.color === 'text-[#3b82f6]' ? 'bg-[#3b82f6]' :
                        item.color === 'text-[#22c55e]' ? 'bg-[#22c55e]' :
                          item.color === 'text-[#a78bfa]' ? 'bg-[#a78bfa]' :
                            item.color === 'text-[#ef4444]' ? 'bg-[#ef4444]' :
                              item.color === 'text-[#eab308]' ? 'bg-[#eab308]' : 'bg-[#06b6d4]')}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#1e2336] to-[#0f1119] border border-[#1e2336] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#e8eaf0]">Critical SEO Leak Detected</p>
                  <p className="text-xs text-[#8b91a8]">Missing alt-text on 12 images and 4 broken metadata links.</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                Fix Now
              </button>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Bottom Row Grid (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Site Audit Card ── */}
        <DashboardCard title="Site Audit" subtitle="Health Score" icon={BarChart3}>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="#1e2336" strokeWidth="8" fill="transparent" />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="#22c55e"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.42}
                  strokeDashoffset={364.42 * (1 - 0.92)}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-[#e8eaf0]">92</span>
                <span className="text-[9px] font-bold text-[#22c55e] uppercase tracking-widest mt-0.5">Healthy</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {[
              { label: "Errors", count: 2, color: "bg-red-500", text: "text-red-500" },
              { label: "Warnings", count: 14, color: "bg-yellow-500", text: "text-yellow-500" },
              { label: "Notices", count: 28, color: "bg-blue-500", text: "text-blue-500" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-[#0c0e14]/50 border border-[#1e2336]/40 group hover:border-[#1e2336] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
                  <span className="text-sm text-[#8b91a8] font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-lg font-bold", item.text)}>{item.count}</span>
                  {item.count === 0 ? <CheckCircle2 size={14} className="text-[#22c55e]" /> : <ArrowUpRight size={14} className={item.text} />}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 text-xs font-bold text-[#8b91a8] hover:text-[#e8eaf0] bg-[#1e2336]/50 hover:bg-[#1e2336] rounded-xl transition-all flex items-center justify-center gap-2 group">
            Run New Audit <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </DashboardCard>

        {/* ── Core Web Vitals ── */}
        <DashboardCard title="Core Web Vitals" subtitle="User Experience" icon={Zap}>
          <div className="space-y-5">
            {[
              { name: "LCP", label: "Largest Contentful Paint", value: "1.2s", score: 95, status: "Good" },
              { name: "INP", label: "Interaction to Next Paint", value: "48ms", score: 92, status: "Good" },
              { name: "CLS", label: "Cumulative Layout Shift", value: "0.02", score: 88, status: "Good" },
              { name: "FCP", label: "First Contentful Paint", value: "0.8s", score: 98, status: "Good" },
              { name: "TTFB", label: "Time to First Byte", value: "120ms", score: 82, status: "Needs Imp." },
            ].map(v => (
              <div key={v.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#e8eaf0]">{v.name}</span>
                    <span className="text-[10px] text-[#545a72] font-medium">{v.label}</span>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", v.status === 'Good' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#eab308]/10 text-[#eab308]')}>{v.value}</span>
                </div>
                <div className="w-full h-1.5 bg-[#1e2336] rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", v.score > 90 ? 'bg-[#22c55e]' : 'bg-[#eab308]')} style={{ width: `${v.score}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-3 rounded-lg border border-[#f97316]/20 bg-[#f97316]/5 flex items-start gap-2.5">
            <Info size={14} className="text-[#f97316] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#8b91a8] leading-relaxed">
              <span className="text-[#f97316] font-bold underline cursor-pointer">TTFB</span> is slightly delayed. Optimizing your server response time could improve LCP by up to 15%.
            </p>
          </div>
        </DashboardCard>

        {/* ── Backlinks & Authority ── */}
        <DashboardCard title="Backlinks" subtitle="Domain Authority" icon={LinkIcon}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#545a72] uppercase tracking-widest">Total Backlinks</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#e8eaf0] tracking-tighter">14,284</span>
                  <span className="text-[10px] text-[#22c55e] font-bold flex items-center"><ArrowUpRight size={10} /> 24%</span>
                </div>
              </div>
              <div className="flex gap-1 h-12 items-end">
                {[0.4, 0.6, 0.5, 0.8, 0.7, 1.0, 0.9].map((h, i) => (
                  <div key={i} className="w-1.5 bg-[#a78bfa]/20 rounded-t-sm relative overflow-hidden group">
                    <div className="absolute bottom-0 w-full bg-[#a78bfa] transition-all duration-700" style={{ height: `${h * 100}%` }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-bold text-[#545a72]">
                  <span>FOLLOW</span>
                  <span>84%</span>
                </div>
                <div className="w-full h-1 bg-[#1e2336] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#3b82f6] w-[84%]" />
                  <div className="h-full bg-[#1e2336] w-[16%]" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-bold text-[#545a72]">
                  <span>UNIQUE IPs</span>
                  <span>2.4K</span>
                </div>
                <div className="w-full h-1 bg-[#1e2336] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#a78bfa] w-[62%]" />
                  <div className="h-full bg-[#1e2336] w-[38%]" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <p className="text-[11px] font-bold text-[#545a72] uppercase tracking-widest">Recent Authority Links</p>
              {[
                { url: "forbes.com", dr: 92, type: "Editorial" },
                { url: "techcrunch.com", dr: 89, type: "News" },
                { url: "medium.com/seo", dr: 94, type: "Blog" },
              ].map(link => (
                <div key={link.url} className="flex items-center justify-between p-2.5 rounded-lg border border-[#1e2336] bg-[#0c0e14]/30 hover:bg-[#0c0e14] transition-all cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#1e2336] flex items-center justify-center text-[10px] font-bold text-[#e8eaf0]">{link.url[0].toUpperCase()}</div>
                    <span className="text-xs text-[#8b91a8] group-hover:text-[#e8eaf0] truncate w-24">{link.url}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold bg-[#1e2336] text-[#545a72] px-1.5 py-0.5 rounded">{link.type}</span>
                    <span className="text-xs font-bold text-[#22c55e]">DR {link.dr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>

      </div>
    </div>
  );
}
