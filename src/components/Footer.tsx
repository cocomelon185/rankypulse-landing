import Link from "next/link";
import { Zap } from "lucide-react";

const FOOTER_LINKS = {
  "SEO Tools": [
    { href: "/seo-audit-tool", label: "SEO Audit Tool" },
    { href: "/technical-seo-audit", label: "Technical SEO Audit" },
    { href: "/meta-tag-checker", label: "Meta Tag Checker" },
    { href: "/redirect-checker", label: "Redirect Checker" },
    { href: "/internal-link-checker", label: "Internal Link Checker" },
    { href: "/competitor-seo-analysis", label: "Competitor SEO Analysis" },
    { href: "/tools", label: "All Tools" },
  ],
  Solutions: [
    { href: "/seo-audit-for-wordpress", label: "WordPress SEO Audit" },
    { href: "/seo-audit-for-shopify", label: "Shopify SEO Audit" },
    { href: "/seo-audit-for-small-business", label: "Small Business SEO" },
    { href: "/seo-audit-for-ecommerce", label: "Ecommerce SEO" },
    { href: "/seo-audit-for-saas", label: "SaaS SEO Audit" },
    { href: "/seo-audit-for-agencies", label: "Agency SEO Audit" },
    { href: "/seo-audit-for-local-business", label: "Local Business SEO" },
    { href: "/seo-audit-for-nonprofits", label: "Nonprofit SEO Audit" },
  ],
  Resources: [
    { href: "/blog", label: "Blog" },
    { href: "/guides/technical-seo-checklist", label: "SEO Checklist" },
    { href: "/guides/how-to-do-seo-audit", label: "How to Do an SEO Audit" },
    { href: "/guides/seo-audit-template", label: "SEO Audit Template" },
    { href: "/guides/internal-linking-strategy", label: "Internal Linking Guide" },
    { href: "/blog/we-audited-rankypulse-with-rankypulse", label: "RankyPulse Case Study" },
    { href: "/audit", label: "Run Free Audit" },
    { href: "/roadmap", label: "Product Roadmap" },
    { href: "/about", label: "About Us" },
    { href: "/pricing", label: "Pricing" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookies Policy" },
    { href: "/contact", label: "Contact Us" },
    { href: "/auth/signin", label: "Sign In" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12 px-4 md:px-8" role="contentinfo">
      <div className="mx-auto max-w-7xl">
        {/* Brand */}
        <div className="mb-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-[#1B2559]"
            aria-label="RankyPulse home"
          >
            <Zap className="h-5 w-5 text-[#4318ff]" />
            RankyPulse
          </Link>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Built for founders, marketers, and agencies who want actionable SEO — not just scores.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900">
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gray-600 transition-colors hover:text-[#4318ff]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-gray-100 pt-6 md:flex-row md:justify-between">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} RankyPulse. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Need help?{" "}
            <a
              href="mailto:support@rankypulse.com"
              className="text-gray-600 transition-colors hover:text-[#4318ff]"
            >
              support@rankypulse.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
