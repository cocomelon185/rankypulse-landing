import { clampTitle, clampDesc } from "@/lib/metadata";

const pages = {
  "seo-audit-tool": {
    title: "Free SEO Audit Tool",
    description: "Run a free SEO audit and discover technical SEO issues affecting your website.",
    canonical: "https://rankypulse.com/seo-audit-tool"
  },
  "technical-seo-audit": {
    title: "Technical SEO Audit",
    description: "Check crawlability, indexing, and technical SEO health.",
    canonical: "https://rankypulse.com/technical-seo-audit"
  },
  "meta-tag-checker": {
    title: "Meta Tag Checker",
    description: "Analyze title tags and meta descriptions for SEO optimization.",
    canonical: "https://rankypulse.com/meta-tag-checker"
  },
  "internal-link-checker": {
    title: "Internal Link Checker",
    description: "Find internal linking opportunities and orphan pages.",
    canonical: "https://rankypulse.com/internal-link-checker"
  },
  "redirect-checker": {
    title: "Redirect Checker",
    description: "Detect redirect chains and SEO redirect issues.",
    canonical: "https://rankypulse.com/redirect-checker"
  },
  "competitor-seo-analysis": {
    title: "Competitor SEO Analysis",
    description: "Analyze competitors and uncover SEO opportunities.",
    canonical: "https://rankypulse.com/seo/competitor-seo-analysis"
  },
  "keyword-gap-analysis": {
    title: "Keyword Gap Analysis",
    description: "Find keywords your competitors rank for but you don't.",
    canonical: "https://rankypulse.com/seo/keyword-gap-analysis"
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
    title: clampTitle(`${page.title} | RankyPulse`),
    description: clampDesc(page.description),
    alternates: {
      canonical: page.canonical
    }
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
