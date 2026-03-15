import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { BlogPost } from '@/components/blog/BlogPost';
import { clampTitle, clampDesc } from '@/lib/metadata';

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
  const title = clampTitle(`${post.title} | RankyPulse`);
  const description = clampDesc(post.excerpt);
  return {
    title: { absolute: title },
    description,
    openGraph: {
      title: clampTitle(post.title),
      description,
      type: 'article',
      publishedTime: post.publishedAt,
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
  return <BlogPost post={post} />;
}
