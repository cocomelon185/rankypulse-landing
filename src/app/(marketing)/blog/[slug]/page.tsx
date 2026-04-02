import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { BlogPost } from '@/components/blog/BlogPost';
import { clampTitle, clampDesc } from '@/lib/metadata';

const BASE = 'https://rankypulse.com';

export function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) return {};
  const suffix = ' | RankyPulse';
  const fullTitle = `${post.title}${suffix}`;
  // Use 70-char cap so suffix is always preserved — avoids title = H1 duplicate warning
  const title = fullTitle.length <= 70 ? fullTitle : `${clampTitle(post.title, 57)}${suffix}`;
  const description = clampDesc(post.excerpt);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${BASE}/blog/${post.slug}` },
    openGraph: {
      title: clampTitle(post.title),
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      url: `${BASE}/blog/${post.slug}`,
      siteName: 'RankyPulse',
      images: [{ url: `${BASE}/og.jpg`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [`${BASE}/og.jpg`],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: `${BASE}/blog/${post.slug}`,
    author: {
      '@type': 'Organization',
      name: 'RankyPulse',
      url: BASE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'RankyPulse',
      url: BASE,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE}/blog/${post.slug}`,
    },
  };

  // Server-rendered related posts — always in initial HTML for crawlers
  const related = BLOG_POSTS
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);
  const fallback = related.length < 3
    ? BLOG_POSTS.filter(p => p.slug !== post.slug && p.category !== post.category).slice(0, 3 - related.length)
    : [];
  const relatedPosts = [...related, ...fallback];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPost post={post} />
      {/* Related posts — visible server-rendered section for users and crawlers */}
      {relatedPosts.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 pb-16">
          <h2 className="mb-6 text-xl font-bold text-white">More from the blog</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedPosts.map(p => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block rounded-lg border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 transition-colors"
              >
                <span className="text-xs text-indigo-400 font-medium">{p.category}</span>
                <p className="mt-1 text-sm font-semibold text-white leading-snug line-clamp-2">{p.title}</p>
                <span className="mt-2 text-xs text-gray-400">{p.readingMinutes} min read</span>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/blog" className="text-sm text-indigo-400 hover:text-indigo-300">
              ← All blog posts
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
