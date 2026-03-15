"use client";

import { motion } from "framer-motion";
import { Building2, Code2, TrendingUp, BarChart3, CheckCircle2 } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const PILLARS = [
  {
    persona: "AGENCY",
    personaColor: "bg-[#7B5CF5]/10 text-[#7B5CF5] border-[#7B5CF5]/20",
    iconBg: "bg-[#7B5CF5]/10 border-[#7B5CF5]/20",
    icon: <Building2 size={20} className="text-[#7B5CF5]" />,
    title: "White-Label Perfection",
    description:
      "Upload your logo and brand colors. Send secure, password-protected share links to clients — no RankyPulse branding in sight.",
    highlight: "Close 3× more retainers",
    highlightColor: "text-[#7B5CF5]",
  },
  {
    persona: "DEV",
    personaColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    icon: <Code2 size={20} className="text-cyan-400" />,
    title: "AI Fix Assistant",
    description:
      "Don't just find issues. Copy/paste the exact code snippet to fix them instantly — from hreflang tags to canonical headers.",
    highlight: "Zero Googling required",
    highlightColor: "text-cyan-400",
  },
  {
    persona: "OWNERS",
    personaColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    icon: <TrendingUp size={20} className="text-emerald-400" />,
    title: "Traffic Opportunity ROI",
    description:
      "See exactly how much organic traffic you're leaving on the table. Projections show +15–25% growth from fixing your open issues.",
    highlight: "ROI-first, not vanity metrics",
    highlightColor: "text-emerald-400",
  },
  {
    persona: "UX",
    personaColor: "bg-[#FF642D]/10 text-[#FF642D] border-[#FF642D]/20",
    iconBg: "bg-[#FF642D]/10 border-[#FF642D]/20",
    icon: <BarChart3 size={20} className="text-[#FF642D]" />,
    title: "Competitive Benchmarking",
    description:
      "Know exactly where you stand vs. the industry average in your specific niche — ecommerce, SaaS, local, blog, or agency.",
    highlight: "Niche-specific, not generic",
    highlightColor: "text-[#FF642D]",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <p className="mb-3 font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600">
          Built for every stakeholder
        </p>
        <h2
          className="font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          One platform.
          <br />
          <span className="italic text-[#FF642D]">Every SEO persona covered.</span>
        </h2>
      </motion.div>

      {/* 2×2 Pillar Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid gap-5 sm:grid-cols-2"
      >
        {PILLARS.map((p) => (
          <motion.div
            key={p.persona}
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-colors duration-300 hover:border-white/10 hover:bg-white/[0.04]"
          >
            {/* Persona pill — top-right */}
            <span
              className={`absolute right-6 top-6 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-widest ${p.personaColor}`}
            >
              {p.persona}
            </span>

            {/* Icon */}
            <div
              className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${p.iconBg}`}
            >
              {p.icon}
            </div>

            <h3 className="mb-2 font-['DM_Sans'] text-xl font-bold text-white">{p.title}</h3>
            <p className="mb-6 font-['DM_Sans'] text-sm leading-relaxed text-slate-400">
              {p.description}
            </p>

            {/* Highlight badge */}
            <div className={`flex items-center gap-2 text-xs font-semibold ${p.highlightColor}`}>
              <CheckCircle2 size={14} />
              {p.highlight}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
