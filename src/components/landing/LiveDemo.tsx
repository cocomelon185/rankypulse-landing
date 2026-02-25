"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const DEMO_SITES = [
  { domain: "yourcompetitor.com", score: 68, issues: 5, gain: "400–1,200", tier: "medium" },
  { domain: "localbusiness.com", score: 42, issues: 9, gain: "600–2,000", tier: "poor" },
  { domain: "startupsite.io", score: 77, issues: 3, gain: "200–800", tier: "good" },
  { domain: "ecommerce-demo.com", score: 55, issues: 7, gain: "500–1,800", tier: "medium" },
];

function scoreColor(score: number) {
  if (score >= 70) return { text: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" };
  if (score >= 40) return { text: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" };
  return { text: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" };
}

export function LiveDemo() {
  const router = useRouter();

  return (
    <section className="overflow-hidden py-20" style={{ background: "#0a0c10" }}>
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600">
            Try it now
          </p>
          <h2
            className="font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
            style={{ fontSize: "clamp(26px, 4vw, 40px)" }}
          >
            See what an audit looks like{" "}
            <span className="italic text-indigo-400">before you run yours</span>
          </h2>
        </motion.div>

        {/* Scrollable card strip */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#0a0c10] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#0a0c10] to-transparent" />

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {DEMO_SITES.map((site, i) => {
              const colors = scoreColor(site.score);
              return (
                <motion.button
                  key={site.domain}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  onClick={() => router.push(`/report/${site.domain}`)}
                  className="group min-w-[240px] rounded-2xl border border-white/6 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/12"
                  style={{ background: "#13161f" }}
                >
                  {/* Score badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className="rounded-full px-3 py-1 font-['Fraunces'] text-xl font-bold"
                      style={{ color: colors.text, background: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      {site.score}
                    </span>
                    <span className="rounded-full border border-white/6 bg-white/4 px-2 py-1 font-['DM_Mono'] text-[10px] text-gray-500">
                      {site.issues} issues
                    </span>
                  </div>

                  {/* Domain */}
                  <div className="mb-3 font-['DM_Mono'] text-sm text-gray-300 truncate">
                    {site.domain}
                  </div>

                  {/* Traffic gain */}
                  <div className="flex items-center justify-between">
                    <span className="font-['DM_Sans'] text-xs text-gray-600">Traffic gain</span>
                    <span className="font-['DM_Sans'] text-xs font-semibold text-emerald-400">
                      +{site.gain}/mo
                    </span>
                  </div>

                  <div className="mt-4 font-['DM_Sans'] text-xs text-indigo-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    View audit →
                  </div>
                </motion.button>
              );
            })}

            {/* "Or enter yours" card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex min-w-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-5 text-center"
            >
              <p className="mb-2 font-['DM_Sans'] text-sm text-gray-500">or enter yours</p>
              <button
                onClick={() => {
                  document.querySelector<HTMLInputElement>('input[placeholder="yoursite.com"]')?.focus();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-lg bg-indigo-500/15 px-4 py-2 font-['DM_Sans'] text-sm font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/25"
              >
                ↑ Try your site
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
