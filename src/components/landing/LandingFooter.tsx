import Link from "next/link";
import { Zap } from "lucide-react";

const LINKS = {
  Product: [
    { label: "Free SEO Audit", href: "/audit" },
    { label: "All SEO Tools", href: "/tools" },
    { label: "Pricing", href: "/pricing" },
    { label: "Sign In", href: "/auth/signin" },
  ],
  Learn: [
    { label: "Blog", href: "/blog" },
    { label: "Technical SEO Audit", href: "/blog/technical-seo-audit" },
    { label: "Free SEO Audit Guide", href: "/blog/free-seo-audit-guide" },
    { label: "Site SEO Audit Guide", href: "/blog/site-seo-audit-complete-guide" },
    { label: "SEO Checklist", href: "/guides/technical-seo-checklist" },
    { label: "How to Audit", href: "/guides/how-to-do-seo-audit" },
    { label: "Internal Linking", href: "/guides/internal-linking-strategy" },
    { label: "SEO Audit Template", href: "/guides/seo-audit-template" },
    { label: "Fix Core Web Vitals", href: "/guides/fix-core-web-vitals" },
  ],
  "SEO Audit For": [
    { label: "Agencies", href: "/seo-audit-for-agencies" },
    { label: "E-commerce", href: "/seo-audit-for-ecommerce" },
    { label: "SaaS", href: "/seo-audit-for-saas" },
    { label: "Freelancers", href: "/seo-audit-for-freelancers" },
    { label: "Local Business", href: "/seo-audit-for-local-business" },
    { label: "Nonprofits", href: "/seo-audit-for-nonprofits" },
    { label: "Small Business", href: "/seo-audit-for-small-business" },
    { label: "WordPress", href: "/seo-audit-for-wordpress" },
    { label: "Shopify", href: "/seo-audit-for-shopify" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Changelog", href: "/changelog" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "vs Ahrefs", href: "/compare/rankypulse-vs-ahrefs" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookies Policy", href: "/cookies" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function LandingFooter() {
  return (
    <footer
      className="border-t border-white/5 py-16"
      style={{ background: "#0a0c10" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Top row: logo + columns */}
        <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5" aria-label="Footer navigation">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-['Fraunces'] text-lg font-bold text-white">RankyPulse</span>
              <span className="rounded px-1.5 py-0.5 font-['DM_Mono'] text-[9px] font-semibold uppercase tracking-wider text-indigo-400" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
                Beta
              </span>
            </Link>
            <p className="font-['DM_Sans'] text-sm leading-relaxed text-gray-400">
              Simple SEO audits that actually tell you what to fix.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <h4 className="mb-4 font-['DM_Mono'] text-xs font-semibold uppercase tracking-widest text-gray-400">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="font-['DM_Sans'] text-sm text-gray-300 transition-colors duration-150 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="font-['DM_Sans'] text-xs text-gray-400">
            © 2026 RankyPulse. Built for site owners, not SEOs.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com/rankypulse"
              target="_blank"
              rel="noopener noreferrer"
              className="font-['DM_Sans'] text-xs text-gray-400 transition-colors hover:text-gray-200"
            >
              Twitter / X
            </a>
            <a
              href="https://linkedin.com/company/rankypulse"
              target="_blank"
              rel="noopener noreferrer"
              className="font-['DM_Sans'] text-xs text-gray-400 transition-colors hover:text-gray-200"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
