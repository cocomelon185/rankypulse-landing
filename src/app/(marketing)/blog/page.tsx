import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { BlogIndex } from '@/components/blog/BlogIndex';

export const metadata: Metadata = {
  title: { absolute: 'RankyPulse Blog | SEO Guides and Insights' },
  description: 'SEO guides, case studies, and technical deep-dives from the RankyPulse team. Learn how to fix technical issues, improve rankings, and grow organic traffic.',
  alternates: { canonical: '/blog' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'RankyPulse Blog | SEO Guides and Insights',
    description: 'SEO guides, case studies, and technical deep-dives from the RankyPulse team.',
    url: '/blog',
    siteName: 'RankyPulse',
    type: 'website',
    images: [{ url: 'https://rankypulse.com/og.jpg', width: 1200, height: 630, alt: 'RankyPulse Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RankyPulse Blog | SEO Guides and Insights',
    description: 'SEO guides, case studies, and technical deep-dives from the RankyPulse team.',
  },
};

export default function BlogPage() {
  return <BlogIndex posts={BLOG_POSTS} />;
}
