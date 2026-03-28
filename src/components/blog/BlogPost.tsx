'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BLOG_POSTS, type BlogPost as BlogPostType } from '@/lib/blog-posts';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';

const CTA_COPY: Record<BlogPostType['category'], { heading: string; sub: string; cta: string }> = {
  'Technical SEO': {
    heading: 'Find these issues on your site right now',
    sub: 'RankyPulse checks canonicals, redirects, meta tags, and 50+ more signals in 30 seconds.',
    cta: 'Run your technical audit →',
  },
  'Strategy': {
    heading: 'Put this strategy to work on your site',
    sub: 'See exactly where your site stands today. Free audit, no signup, 30 seconds.',
    cta: 'Audit my site →',
  },
  'Tools': {
    heading: 'See how your site compares',
    sub: 'Free audit. No signup. Results in 30 seconds.',
    cta: 'Run free audit →',
  },
  'Case Study': {
    heading: 'Get results like this on your site',
    sub: 'See what RankyPulse finds on your pages. Free, instant, no signup.',
    cta: 'Audit my site free →',
  },
};

function InlineCTA({ category }: { category: BlogPostType['category'] }) {
  const copy = CTA_COPY[category] ?? CTA_COPY['Strategy'];
  return (
    <div className="my-10 p-6 bg-indigo-500/[0.07] border border-indigo-500/20 rounded-2xl">
      <p className="font-['Fraunces'] text-lg font-bold text-white mb-1">{copy.heading}</p>
      <p className="font-['DM_Sans'] text-gray-400 text-sm mb-4">{copy.sub}</p>
      <Link
        href="/audit"
        className="inline-flex items-center gap-2 px-5 py-2.5
          bg-indigo-500 text-white rounded-xl
          font-['DM_Sans'] font-semibold text-sm
          hover:bg-indigo-400 transition-colors"
      >
        {copy.cta}
      </Link>
    </div>
  );
}

export function BlogPost({ post }: { post: BlogPostType }) {
  // Same-category posts, excluding current, up to 3
  const related = BLOG_POSTS
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  // If fewer than 3 same-category, fill with posts from other categories
  const fallback = related.length < 3
    ? BLOG_POSTS.filter(p => p.slug !== post.slug && p.category !== post.category)
        .slice(0, 3 - related.length)
    : [];

  const relatedPosts = [...related, ...fallback];

  return (
    <main className="min-h-screen bg-[#0d0f14] pt-24 pb-24 px-6">

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2
          w-[600px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-2xl mx-auto">

        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-['DM_Mono'] text-xs
            text-gray-600 hover:text-gray-300 tracking-widest mb-10
            transition-colors"
        >
          <ArrowLeft size={12} />
          ALL POSTS
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="font-['DM_Mono'] text-xs tracking-widest
              px-2.5 py-1 rounded-full bg-indigo-500/15
              border border-indigo-500/25 text-indigo-300">
              {post.category.toUpperCase()}
            </span>
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-gray-600" />
              <span className="font-['DM_Mono'] text-xs text-gray-600">
                {post.readingMinutes} MIN READ
              </span>
            </div>
            <span className="font-['DM_Mono'] text-xs text-gray-600">
              {new Date(post.publishedAt).toLocaleDateString('en-US',
                { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1
            className="font-['Fraunces'] font-bold text-white leading-tight tracking-tight mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            {post.title}
          </h1>

          <p className="font-['DM_Sans'] text-gray-400 text-lg leading-relaxed mb-8">
            {post.subtitle}
          </p>

          {/* Pull quote */}
          <div className="border-l-4 border-indigo-500/40 pl-6 py-2 mb-8">
            <p className="font-['Fraunces'] italic text-indigo-300 text-xl leading-relaxed">
              &ldquo;{post.pullQuote}&rdquo;
            </p>
          </div>

          <div className="h-px bg-white/[0.06] mb-10" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {(() => {
            const blocks = post.content.trim().split('\n\n').filter(b => b.trim());
            const midpoint = Math.floor(blocks.length / 2);
            return blocks.map((block, i) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            // Code / HTML block (fenced ``` or raw <tag>)
            if (trimmed.startsWith('```') || trimmed.startsWith('<')) {
              const code = trimmed.startsWith('```')
                ? trimmed.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '')
                : trimmed;
              return (
                <div
                  key={i}
                  className="font-['DM_Mono'] text-xs text-emerald-400
                    bg-emerald-500/5 border border-emerald-500/15
                    rounded-xl px-4 py-3 mb-6 whitespace-pre-wrap"
                >
                  {code}
                </div>
              );
            }

            // H2 heading (## text)
            if (trimmed.startsWith('## ')) {
              return (
                <h2
                  key={i}
                  className="font-['Fraunces'] text-2xl font-bold text-white mt-12 mb-4"
                >
                  {trimmed.slice(3)}
                </h2>
              );
            }

            // H3 heading (### text or **entire block**)
            if (trimmed.startsWith('### ') || /^\*\*[^*]+\*\*$/.test(trimmed)) {
              const text = trimmed.startsWith('### ')
                ? trimmed.slice(4)
                : trimmed.replace(/\*\*/g, '');
              return (
                <h3
                  key={i}
                  className="font-['Fraunces'] text-xl font-bold text-white mt-10 mb-4"
                >
                  {text}
                </h3>
              );
            }

            // Bullet list (lines starting with - or *)
            if (/^[-*] /.test(trimmed) || trimmed.split('\n').every(l => /^[-*] /.test(l.trim()) || l.trim() === '')) {
              const items = trimmed.split('\n').filter(l => /^[-*] /.test(l.trim()));
              if (items.length > 0) {
                return (
                  <ul key={i} className="list-none space-y-2 mb-6 pl-0">
                    {items.map((item, j) => {
                      const text = item.replace(/^[-*] /, '').trim();
                      const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                      const withFormatting = escaped
                        .replace(/`([^`]+)`/g, '<code class="font-[\'DM_Mono\'] text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">$1</code>')
                        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                        .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline underline-offset-2">$1</a>');
                      return (
                        <li key={j} className="flex gap-2.5 font-['DM_Sans'] text-gray-300 text-base">
                          <span className="text-blue-400 mt-1 shrink-0">•</span>
                          <span dangerouslySetInnerHTML={{ __html: withFormatting }} />
                        </li>
                      );
                    })}
                  </ul>
                );
              }
            }

            // Numbered list (lines starting with 1. 2. etc.)
            if (/^\d+\. /.test(trimmed) || trimmed.split('\n').every(l => /^\d+\. /.test(l.trim()) || l.trim() === '')) {
              const items = trimmed.split('\n').filter(l => /^\d+\. /.test(l.trim()));
              if (items.length > 1) {
                return (
                  <ol key={i} className="list-none space-y-2 mb-6 pl-0">
                    {items.map((item, j) => {
                      const text = item.replace(/^\d+\. /, '').trim();
                      const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                      const withFormatting = escaped
                        .replace(/`([^`]+)`/g, '<code class="font-[\'DM_Mono\'] text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">$1</code>')
                        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                        .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline underline-offset-2">$1</a>');
                      return (
                        <li key={j} className="flex gap-2.5 font-['DM_Sans'] text-gray-300 text-base">
                          <span className="text-blue-400 font-mono shrink-0 mt-0.5">{j + 1}.</span>
                          <span dangerouslySetInnerHTML={{ __html: withFormatting }} />
                        </li>
                      );
                    })}
                  </ol>
                );
              }
            }

            // Normal paragraph — escape HTML, then apply inline formatting
            // IMPORTANT: Escape HTML first to prevent <meta>, <link> etc. in blog content
            // from being injected into the DOM (causes noindex / multiple canonicals bugs).
            const escaped = trimmed
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
            // Convert `inline code` → <code>
            const withCode = escaped.replace(
              /`([^`]+)`/g,
              '<code class="font-[\'DM_Mono\'] text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">$1</code>'
            );
            // Convert **bold** → <strong>
            const withBold = withCode.replace(
              /\*\*([^*]+)\*\*/g,
              '<strong class="text-white font-semibold">$1</strong>'
            );
            // Convert [text](/path) → <a> (internal links only — relative paths starting with /)
            const withLinks = withBold.replace(
              /\[([^\]]+)\]\((\/[^)]+)\)/g,
              '<a href="$2" class="text-blue-400 hover:text-blue-300 underline underline-offset-2">$1</a>'
            );
            return (
              <span key={i}>
                <p
                  className="font-['DM_Sans'] text-gray-300 leading-relaxed text-base mb-6"
                  dangerouslySetInnerHTML={{ __html: withLinks }}
                />
                {i === midpoint && <InlineCTA category={post.category} />}
              </span>
            );
            });
          })()}
        </motion.div>

        {/* CTA */}
        {(() => {
          const copy = CTA_COPY[post.category] ?? CTA_COPY['Strategy'];
          return (
            <div className="mt-16 p-8 bg-indigo-500/[0.08] border border-indigo-500/20
              rounded-2xl text-center">
              <h3 className="font-['Fraunces'] text-2xl font-bold text-white mb-2">
                {copy.heading}
              </h3>
              <p className="font-['DM_Sans'] text-gray-400 text-sm mb-6">
                {copy.sub}
              </p>
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 px-6 py-3
                  bg-indigo-500 text-white rounded-xl
                  font-['DM_Sans'] font-semibold text-sm
                  hover:bg-indigo-400 transition-colors"
              >
                {copy.cta}
              </Link>
            </div>
          );
        })()}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <div className="h-px bg-white/[0.06] mb-10" />
            <h2 className="font-['Fraunces'] text-xl font-bold text-white mb-6">
              Keep reading
            </h2>
            <div className="space-y-4">
              {relatedPosts.map(related => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex items-start justify-between gap-4 p-5
                    rounded-xl border border-white/[0.06] bg-white/[0.02]
                    hover:border-indigo-500/30 hover:bg-indigo-500/[0.04]
                    transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-['DM_Mono'] text-[10px] tracking-widest
                        px-2 py-0.5 rounded-full bg-indigo-500/10
                        border border-indigo-500/20 text-indigo-400">
                        {related.category.toUpperCase()}
                      </span>
                      <span className="font-['DM_Mono'] text-[10px] text-gray-600">
                        {related.readingMinutes} MIN
                      </span>
                    </div>
                    <p className="font-['DM_Sans'] text-sm font-medium text-gray-300
                      group-hover:text-white transition-colors leading-snug">
                      {related.title}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-gray-600 group-hover:text-indigo-400
                    transition-colors mt-1 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to blog */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-['DM_Sans']
              text-sm text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to all posts
          </Link>
        </div>

      </div>
    </main>
  );
}
