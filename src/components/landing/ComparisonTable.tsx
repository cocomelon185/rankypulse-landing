"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type CellValue = boolean | "partial";

interface ComparisonRow {
  feature: string;
  rp: CellValue;
  semrush: CellValue;
  ahrefs: CellValue;
  diy: CellValue;
}

const ROWS: ComparisonRow[] = [
  { feature: "Step-by-step fix guides",     rp: true, semrush: false,      ahrefs: false, diy: false },
  { feature: "Traffic impact estimates",     rp: true, semrush: true,       ahrefs: true,  diy: false },
  { feature: "SERP before/after preview",    rp: true, semrush: false,      ahrefs: false, diy: false },
  { feature: "Free tier (real value)",       rp: true, semrush: "partial",  ahrefs: false, diy: true  },
  { feature: "Fix time estimates",           rp: true, semrush: false,      ahrefs: false, diy: false },
  { feature: "Built for non-technical users",rp: true, semrush: false,      ahrefs: false, diy: false },
];

const PRICES = { rp: "$0", semrush: "$129/mo", ahrefs: "$99/mo", diy: "$0" };

// Consistent SVG icons — avoids emoji rendering differences across OS/browser
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" className="mx-auto" aria-label="Yes">
    <circle cx="9" cy="9" r="8.5" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.35)" />
    <path d="M5.5 9l2.5 2.5L12.5 7" stroke="#10b981" strokeWidth="1.6"
      fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" className="mx-auto" aria-label="No">
    <circle cx="9" cy="9" r="8.5" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.22)" />
    <path d="M6 6l6 6M12 6l-6 6" stroke="#ef4444" strokeWidth="1.6"
      fill="none" strokeLinecap="round" />
  </svg>
);

const PartialIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" className="mx-auto" aria-label="Partial">
    <circle cx="9" cy="9" r="8.5" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.25)" />
    <path d="M5.5 9h7" stroke="#f59e0b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </svg>
);

function Cell({ val, delay }: { val: CellValue; delay: number }) {
  return (
    <motion.td
      className="px-4 py-4 text-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
    >
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.05, type: "spring", stiffness: 300, damping: 20 }}
        className="inline-block"
      >
        {val === true ? <CheckIcon /> : val === "partial" ? <PartialIcon /> : <XIcon />}
      </motion.span>
    </motion.td>
  );
}

export function ComparisonTable() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <p className="mb-3 font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600">
          The honest comparison
        </p>
        <h2
          className="font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
          style={{ fontSize: "clamp(26px, 4vw, 44px)" }}
        >
          You don&apos;t need Semrush.{" "}
          <span className="italic text-indigo-400">You need fixes.</span>
        </h2>
      </motion.div>

      {/* Table */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="overflow-x-auto rounded-2xl border border-white/6"
        style={{ background: "#13161f" }}
      >
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-4 text-left font-['DM_Mono'] text-xs uppercase tracking-wider text-gray-600">
                Feature
              </th>
              {/* RankyPulse — highlighted */}
              <th className="px-4 py-4 text-center" style={{ background: "rgba(99,102,241,0.08)" }}>
                <div className="font-['DM_Sans'] text-sm font-bold text-white">RankyPulse</div>
                <div className="mt-0.5 font-['DM_Mono'] text-[10px] uppercase tracking-wider text-indigo-400">
                  You are here
                </div>
              </th>
              {["Semrush", "Ahrefs", "DIY / Google"].map((col) => (
                <th key={col} className="px-4 py-4 text-center font-['DM_Sans'] text-sm font-semibold text-gray-500">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => (
              <tr key={row.feature} className="border-b border-white/4 last:border-0">
                <td className="px-4 py-4 font-['DM_Sans'] text-sm text-gray-400">{row.feature}</td>
                <td
                  className="px-4 py-4 text-center"
                  style={{ background: "rgba(99,102,241,0.05)" }}
                >
                  <motion.span
                    className="inline-block"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: ri * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckIcon />
                  </motion.span>
                </td>
                <Cell val={row.semrush} delay={ri * 0.05 + 0.1} />
                <Cell val={row.ahrefs} delay={ri * 0.05 + 0.15} />
                <Cell val={row.diy} delay={ri * 0.05 + 0.2} />
              </tr>
            ))}
            {/* Price row */}
            <tr>
              <td className="px-4 py-5 font-['DM_Mono'] text-xs font-semibold uppercase tracking-wider text-gray-600">
                Price to start
              </td>
              {(["rp", "semrush", "ahrefs", "diy"] as const).map((key) => (
                <td
                  key={key}
                  className="px-4 py-5 text-center"
                  style={key === "rp" ? { background: "rgba(16,185,129,0.08)" } : undefined}
                >
                  <span
                    className={`font-['Fraunces'] text-lg font-bold ${
                      key === "rp" ? "text-emerald-400" : "text-gray-500"
                    }`}
                  >
                    {PRICES[key]}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </motion.div>

      <p className="mt-5 text-center font-['DM_Sans'] text-xs text-gray-700">
        Semrush and Ahrefs are tools for SEO professionals. RankyPulse is built for site owners
        who want fixes, not complexity.
      </p>
    </section>
  );
}
