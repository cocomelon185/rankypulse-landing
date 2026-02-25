import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { BlogIndex } from '@/components/blog/BlogIndex';

export const metadata: Metadata = {
  title: 'Blog — RankyPulse',
  description: 'SEO guides, case studies, and technical deep-dives from the RankyPulse team.',
};

export default function BlogPage() {
  return <BlogIndex posts={BLOG_POSTS} />;
}
