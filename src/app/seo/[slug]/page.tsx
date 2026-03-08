const pages = {
  "seo-audit-tool": {
    title: "Free SEO Audit Tool",
    description: "Run a free SEO audit and discover technical SEO issues affecting your website."
  },
  "technical-seo-audit": {
    title: "Technical SEO Audit",
    description: "Check crawlability, indexing, and technical SEO health."
  },
  "meta-tag-checker": {
    title: "Meta Tag Checker",
    description: "Analyze title tags and meta descriptions for SEO optimization."
  },
  "internal-link-checker": {
    title: "Internal Link Checker",
    description: "Find internal linking opportunities and orphan pages."
  },
  "redirect-checker": {
    title: "Redirect Checker",
    description: "Detect redirect chains and SEO redirect issues."
  },
  "competitor-seo-analysis": {
    title: "Competitor SEO Analysis",
    description: "Analyze competitors and uncover SEO opportunities."
  },
  "keyword-gap-analysis": {
    title: "Keyword Gap Analysis",
    description: "Find keywords your competitors rank for but you don't."
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];

  if (!page) {
    return {
      title: "Page Not Found | RankyPulse"
    };
  }

  return {
    title: `${page.title} | RankyPulse`,
    description: page.description
  };
}

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];

  if (!page) {
    return <main style={{ maxWidth: 900, margin: "80px auto", padding: "0 24px" }}><h1>Page not found</h1></main>;
  }

  return (
    <main style={{ maxWidth: 900, margin: "80px auto", padding: "0 24px", fontFamily: "Inter, sans-serif" }}>
      <h1>{page.title}</h1>
      <p>{page.description}</p>
      <p>Use RankyPulse to audit your website, identify SEO issues, and prioritize fixes that improve rankings and conversions.</p>
    </main>
  );
}
