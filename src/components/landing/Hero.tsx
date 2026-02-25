"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap, Search, TrendingUp, Clock, Eye } from "lucide-react";
import { extractAuditDomain, isValidExtractedDomain } from "@/lib/url-validation";
import { useAuth } from "@/hooks/useAuth";
import CountUp from "react-countup";

const STATS = [
  { num: 12400, suffix: "+", label: "Sites audited", color: "#6366f1", decimals: 0 },
  { num: 4.8, suffix: "★", label: "User rating", color: "#f59e0b", decimals: 1 },
  { num: 3.2, suffix: "min", label: "Avg fix time", color: "#10b981", decimals: 1 },
  { num: 89, suffix: "%", label: "See gains in 30d", color: "#a5b4fc", decimals: 0 },
];

const TRUST_PILLS = [
  { icon: Eye, text: "No signup required" },
  { icon: Clock, text: "5-minute fixes" },
  { icon: TrendingUp, text: "Real traffic data" },
];

const DEMO_ISSUES = [
  { label: "HIGH", color: "yellow", text: "Canonical points to non-preferred URL", traffic: "+120–600/mo" },
  { label: "MEDIUM", color: "blue", text: "Meta description missing on homepage", traffic: "+80–400/mo" },
  { label: "FIXED", color: "green", text: "Redirect chain resolved", traffic: "+50–200/mo" },
];

function FloatingScorePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-14 max-w-2xl"
    >
      <div className="absolute -inset-8 rounded-full bg-indigo-500/8 blur-3xl" />
      <div
        className="relative overflow-hidden rounded-2xl border border-white/8 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        style={{ background: "#13161f" }}
      >
        {/* Browser chrome */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-gray-500">rankypulse.com/report/yoursite.com</span>
          </div>
          <div className="w-16" />
        </div>

        {/* Score + issues */}
        <div className="grid grid-cols-3 gap-5 p-6">
          {/* Score */}
          <div
            className="col-span-1 flex flex-col items-center justify-center rounded-xl border border-white/5 p-4"
            style={{ background: "#0d0f14" }}
          >
            <span className="mb-2 font-mono text-xs tracking-widest text-gray-600">SEO SCORE</span>
            <span className="font-['Fraunces'] text-5xl font-bold text-emerald-400">75</span>
            <span className="mt-1 font-['DM_Sans'] text-xs text-gray-500">/ 100</span>
            <div className="mt-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
              <span className="font-mono text-xs tracking-wider text-emerald-400">● GOOD</span>
            </div>
          </div>

          {/* Issues list */}
          <div className="col-span-2 flex flex-col gap-2">
            {DEMO_ISSUES.map((issue) => (
              <div
                key={issue.text}
                className="flex items-center gap-3 rounded-lg border border-white/5 p-2.5"
                style={{ background: "#0d0f14" }}
              >
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] tracking-wider ${
                    issue.color === "yellow"
                      ? "border border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                      : issue.color === "blue"
                        ? "border border-blue-500/20 bg-blue-500/10 text-blue-400"
                        : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {issue.label}
                </span>
                <span className="flex-1 truncate font-['DM_Sans'] text-xs text-gray-300">
                  {issue.text}
                </span>
                <span className="flex-shrink-0 font-mono text-xs text-emerald-400">{issue.traffic}</span>
              </div>
            ))}
            <div
              className="mt-1 flex items-center justify-between rounded-lg border border-indigo-500/20 p-2.5"
              style={{ background: "rgba(99,102,241,0.08)" }}
            >
              <span className="font-['DM_Sans'] text-xs text-gray-400">You could be gaining</span>
              <span className="font-['Fraunces'] text-sm font-bold text-indigo-300">300–1,500 visits/mo</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [auditLimitError, setAuditLimitError] = useState("");
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const runAudit = async (rawDomain: string) => {
    const cleaned = extractAuditDomain(rawDomain);

    if (!isValidExtractedDomain(cleaned)) {
      setError("Enter a valid domain — e.g. yoursite.com");
      return;
    }

    setAuditLimitError("");
    setIsLoading(true);
    setError("");

    // For authenticated users, check server-side quota
    if (isAuthenticated) {
      try {
        const res = await fetch("/api/usage/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: cleaned }),
        });
        const data = await res.json() as { allowed?: boolean; reason?: string };
        if (!data.allowed) {
          setAuditLimitError("You've used all audits this month. Upgrade to continue.");
          setIsLoading(false);
          return;
        }
      } catch {
        // Fail open — proceed with audit on network error
      }
    }

    // Navigate immediately — AuditLoadingScreen handles the wait experience
    router.push(`/report/${cleaned}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Read directly from form input to avoid stale state or autofill bypassing onChange
    const input = e.currentTarget.elements.namedItem("domain") as HTMLInputElement | null;
    const rawValue = (input?.value ?? domain).trim();
    void runAudit(rawValue);
  };

  const handleQuickLink = (demo: string) => {
    setDomain(demo);
    // Brief delay so user sees the domain populate before navigating
    setTimeout(() => void runAudit(demo), 350);
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-24">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-10%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="absolute left-[10%] top-[30%] h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
        <div className="absolute right-[5%] top-[20%] h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-[80px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/4 px-4 py-2"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="font-['DM_Mono'] text-xs uppercase tracking-[2px] text-gray-400">
            Free Audit · No Signup · 30 Seconds
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 font-['Fraunces'] font-bold leading-[1.06] tracking-[-0.03em] text-white"
          style={{ fontSize: "clamp(42px, 7vw, 76px)" }}
        >
          Your website is{" "}
          <span className="italic text-indigo-400">invisible</span>
          {" "}to Google.
          <br />
          <span className="text-gray-300">We&apos;ll show you why.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mx-auto mb-10 max-w-2xl font-['DM_Sans'] text-xl leading-relaxed text-gray-400"
        >
          Enter any domain. Get a complete SEO audit with step-by-step fix guides
          and real traffic estimates — in under 30 seconds. No jargon. No overwhelm.{" "}
          <span className="text-white">Just fixes that work.</span>
        </motion.p>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mx-auto mb-5 max-w-xl"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="group relative flex-1">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors duration-200 group-focus-within:text-indigo-400"
              />
              <input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                name="domain"
                type="text"
                autoComplete="off"
                value={domain}
                onChange={(e) => { setDomain(e.target.value); setError(""); }}
                placeholder="yoursite.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-10 pr-4 font-['DM_Sans'] text-sm text-white placeholder-gray-600 transition-all duration-200 focus:border-indigo-500/60 focus:bg-indigo-500/4 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-indigo-500 px-7 py-4 font-['DM_Sans'] text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <><Zap size={15} className="animate-pulse" />Scanning...</>
              ) : (
                <><Zap size={15} />Run Free Audit</>
              )}
            </button>
          </form>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 pl-1 text-left font-['DM_Sans'] text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
          {auditLimitError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 pl-1 text-left font-['DM_Sans'] text-sm text-amber-400"
            >
              {auditLimitError}{" "}
              <a href="/pricing" className="underline">Upgrade</a>
            </motion.p>
          )}
        </motion.div>

        {/* Trust pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 flex flex-wrap items-center justify-center gap-5"
        >
          {TRUST_PILLS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon size={13} className="text-indigo-400" />
              <span className="font-['DM_Sans'] text-xs text-gray-500">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* Quick-launch links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mb-14 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="font-['DM_Mono'] text-xs text-gray-700">Try it on:</span>
          {["stripe.com", "notion.so", "linear.app", "vercel.com"].map((demo) => (
            <button
              key={demo}
              type="button"
              onClick={() => handleQuickLink(demo)}
              className="rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 font-['DM_Mono'] text-xs text-gray-400 transition-all duration-150 hover:border-white/15 hover:bg-white/8 hover:text-white"
            >
              {demo}
            </button>
          ))}
        </motion.div>

        {/* Stat cards */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mx-auto mb-4 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4"
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 bg-white/2 p-4 text-center transition-all duration-200 hover:border-white/8 hover:bg-white/4"
            >
              <div className="mb-1 font-['Fraunces'] text-2xl font-bold" style={{ color: stat.color }}>
                {statsInView ? (
                  <CountUp
                    start={0}
                    end={stat.num}
                    duration={1.5}
                    delay={0.2 + i * 0.1}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    separator=","
                  />
                ) : (
                  "0"
                )}
              </div>
              <div className="font-['DM_Mono'] text-xs tracking-wider text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating preview */}
      <div className="relative mx-auto w-full max-w-4xl px-6">
        <FloatingScorePreview />
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        <span className="font-['DM_Mono'] text-[10px] uppercase tracking-widest text-gray-700">
          Scroll
        </span>
        <motion.div
          className="h-8 w-px rounded-full bg-gradient-to-b from-gray-700 to-transparent"
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
