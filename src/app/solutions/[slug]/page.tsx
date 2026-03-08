const pages = {
  "seo-audit-for-small-business": {
    title: "SEO Audit for Small Business",
    description: "Find technical SEO issues and growth opportunities for small business websites."
  },
  "seo-audit-for-shopify": {
    title: "SEO Audit for Shopify",
    description: "Audit Shopify SEO issues including metadata, indexing, and site structure."
  },
  "seo-audit-for-wordpress": {
    title: "SEO Audit for WordPress",
    description: "Run a WordPress SEO audit to find technical and on-page issues quickly."
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
      <p>RankyPulse helps you detect SEO issues, prioritize fixes, and improve search visibility with a clear action plan.</p>
    </main>
  );
}
