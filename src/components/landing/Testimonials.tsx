"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote:
      "I fixed my canonical issue in 4 minutes following the guide. Organic traffic was up 40% within 3 weeks. I had no idea what a canonical tag even was.",
    name: "Sarah K.",
    role: "E-commerce founder",
    result: "+40% organic traffic",
    resultColor: "#10b981",
    initials: "SK",
    avatarGradient: "from-emerald-500 to-teal-600",
  },
  {
    quote:
      "Every other SEO tool gave me a list of 200 problems. RankyPulse gave me 3 problems and told me exactly how to fix each one. Fixed them all in an afternoon.",
    name: "Marcus T.",
    role: "Marketing director, SaaS",
    result: "3 fixes in one afternoon",
    resultColor: "#6366f1",
    initials: "MT",
    avatarGradient: "from-indigo-500 to-purple-600",
  },
  {
    quote:
      "The SERP preview showing exactly how my page would look in Google after fixing the meta description — I've never seen that in any tool. Immediately understood the value.",
    name: "Priya S.",
    role: "Freelance web developer",
    result: "CTR up 28%",
    resultColor: "#f59e0b",
    initials: "PS",
    avatarGradient: "from-amber-500 to-orange-600",
  },
];

const MINI_QUOTES = [
  "Fixed my 404 redirect issue in 3 minutes. Score went from 61 → 79.",
  "Never knew my site was leaking 800 visits/month. Now I know exactly why.",
  "My clients love the before/after SERP preview. Use it in every pitch.",
  "Finally understood what PageSpeed score actually means for rankings.",
  "The traffic impact numbers are a game changer for prioritizing work.",
  "Showed this to my dev team — they fixed everything in one sprint.",
  "Cleanest SEO tool UI I've ever used. The others feel like spreadsheets.",
  "Used the share card to show my boss why we needed to fix canonicals.",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Testimonials() {
  return (
    <section className="py-24" style={{ background: "#0a0c10" }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600">
            Real results
          </p>
          <h2
            className="font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            Real sites.{" "}
            <span className="italic text-indigo-400">Real fixes.</span>{" "}
            Real traffic.
          </h2>
        </motion.div>

        {/* Featured testimonials */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-10 grid gap-5 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className="flex flex-col rounded-2xl border border-white/6 p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/2"
              style={{ background: "#13161f" }}
            >
              {/* Stars */}
              <div className="mb-4 text-yellow-400 text-base">★★★★★</div>

              {/* Quote */}
              <p className="mb-6 flex-1 font-['Fraunces'] text-base font-normal italic leading-relaxed text-gray-300">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author + result */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarGradient}`}
                  >
                    <span className="font-['DM_Sans'] text-xs font-bold text-white">
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <div className="font-['DM_Sans'] text-sm font-semibold text-white">{t.name}</div>
                    <div className="font-['DM_Sans'] text-xs text-gray-600">{t.role}</div>
                  </div>
                </div>
                <div
                  className="flex-shrink-0 rounded-full px-2.5 py-1 font-['DM_Mono'] text-[10px] font-semibold tracking-wider"
                  style={{
                    background: `${t.resultColor}12`,
                    color: t.resultColor,
                    border: `1px solid ${t.resultColor}25`,
                  }}
                >
                  {t.result}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scrolling mini-quotes strip */}
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/2 py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a0c10] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0c10] to-transparent" />
          <div className="flex animate-[marquee_40s_linear_infinite] gap-8 hover:[animation-play-state:paused]">
            {[...MINI_QUOTES, ...MINI_QUOTES].map((q, i) => (
              <span
                key={i}
                className="flex-shrink-0 font-['DM_Sans'] text-sm italic text-gray-500 whitespace-nowrap"
              >
                &ldquo;{q}&rdquo;
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
