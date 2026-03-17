import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
  const title = fullTitle.length <= 60 ? fullTitle : clampTitle(post.title, 60);
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
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPost post={post} />
    </>
  );
}
