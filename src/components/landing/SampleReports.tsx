const SAMPLE_REPORTS: { domain: string; label: string }[] = [
  { domain: "shopify.com", label: "Shopify" },
  { domain: "wordpress.com", label: "WordPress" },
  { domain: "wix.com", label: "Wix" },
  { domain: "squarespace.com", label: "Squarespace" },
  { domain: "webflow.com", label: "Webflow" },
  { domain: "github.com", label: "GitHub" },
  { domain: "medium.com", label: "Medium" },
  { domain: "substack.com", label: "Substack" },
  { domain: "notion.so", label: "Notion" },
  { domain: "hubspot.com", label: "HubSpot" },
  { domain: "mailchimp.com", label: "Mailchimp" },
  { domain: "buffer.com", label: "Buffer" },
  { domain: "hootsuite.com", label: "Hootsuite" },
  { domain: "canva.com", label: "Canva" },
  { domain: "figma.com", label: "Figma" },
  { domain: "stripe.com", label: "Stripe" },
  { domain: "vercel.com", label: "Vercel" },
  { domain: "netlify.com", label: "Netlify" },
  { domain: "digitalocean.com", label: "DigitalOcean" },
  { domain: "cloudflare.com", label: "Cloudflare" },
  { domain: "semrush.com", label: "SEMrush" },
  { domain: "ahrefs.com", label: "Ahrefs" },
  { domain: "moz.com", label: "Moz" },
  { domain: "yoast.com", label: "Yoast" },
  { domain: "sitebulb.com", label: "Sitebulb" },
  { domain: "seoptimer.com", label: "SEOPtimer" },
  { domain: "woorank.com", label: "WooRank" },
  { domain: "ubersuggest.com", label: "Ubersuggest" },
  { domain: "neilpatel.com", label: "Neil Patel" },
  { domain: "backlinko.com", label: "Backlinko" },
];

export function SampleReports() {
  return (
    <section className="py-16 px-4 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">
            See How Top Websites Score
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Browse free SEO audit reports for the web&apos;s most popular sites. See
            exactly what issues they have — and how your site compares.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {SAMPLE_REPORTS.map(({ domain, label }) => (
            <a
              key={domain}
              href={`/report/${domain}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-300 hover:text-white group"
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                alt={`${label} favicon`}
                width={16}
                height={16}
                className="rounded-sm opacity-80 group-hover:opacity-100"
              />
              <span className="truncate">{label}</span>
            </a>
          ))}
        </div>
        <p className="text-center text-xs text-gray-600 mt-6">
          Or{" "}
          <a href="/audit" className="text-blue-400 hover:underline">
            run a free audit on your own website →
          </a>
        </p>
      </div>
    </section>
  );
}
