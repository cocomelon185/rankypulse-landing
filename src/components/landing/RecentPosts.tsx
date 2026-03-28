import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { Clock, ArrowRight } from 'lucide-react';

export function RecentPosts() {
  // 3 featured posts, fallback to first 3
  const featured = BLOG_POSTS.filter(p => p.featured);
  const posts = featured.length >= 3
    ? featured.slice(0, 3)
    : [...featured, ...BLOG_POSTS.filter(p => !p.featured)].slice(0, 3);

  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-['DM_Mono'] text-xs tracking-widest text-[#FF642D] mb-3">
              FROM THE BLOG
            </p>
            <h2
              className="font-['Fraunces'] font-bold text-white leading-tight"
              style={{ fontSize: 'clamp(28px, 3.5vw, 42px)' }}
            >
              Learn SEO that actually works
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline-flex items-center gap-1.5 font-['DM_Sans']
              text-sm text-gray-500 hover:text-white transition-colors shrink-0"
          >
            All posts
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col p-6 rounded-2xl border border-white/[0.06]
                bg-white/[0.02] hover:border-[#FF642D]/25 hover:bg-[#FF642D]/[0.03]
                transition-all duration-200"
            >
              {/* Category + read time */}
              <div className="flex items-center gap-2 mb-4">
                <span className="font-['DM_Mono'] text-[10px] tracking-widest
                  px-2.5 py-1 rounded-full bg-indigo-500/10
                  border border-indigo-500/20 text-indigo-400">
                  {post.category.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock size={10} />
                  <span className="font-['DM_Mono'] text-[10px]">
                    {post.readingMinutes} MIN
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-['Fraunces'] text-base font-bold text-gray-200
                group-hover:text-white transition-colors leading-snug mb-3 flex-1">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="font-['DM_Sans'] text-xs text-gray-500 leading-relaxed mb-5
                line-clamp-2">
                {post.excerpt}
              </p>

              {/* Read link */}
              <div className="inline-flex items-center gap-1.5 font-['DM_Sans']
                text-xs font-medium text-[#FF642D] group-hover:gap-2.5 transition-all">
                Read article
                <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "all posts" link */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 font-['DM_Sans']
              text-sm text-gray-500 hover:text-white transition-colors"
          >
            View all posts
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
