'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { BlogPost } from '@/lib/blog-posts';
import { Clock, ArrowRight } from 'lucide-react';

const CATEGORY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'Technical SEO': { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)'  },
  'Case Study':    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)'  },
  'Strategy':      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)'  },
  'Tools':         { color: '#a5b4fc', bg: 'rgba(165,180,252,0.1)', border: 'rgba(165,180,252,0.25)' },
};

const CATEGORIES = ['All', 'Technical SEO', 'Case Study', 'Strategy', 'Tools'];

export function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const featured = posts.find(p => p.featured);
  const rest = posts.filter(p => !p.featured);

  const filtered = activeCategory === 'All'
    ? rest
    : rest.filter(p => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#0d0f14] pt-24 pb-24 px-6">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2
          w-[700px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5
            bg-white/[0.04] border border-white/[0.08] rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="font-['DM_Mono'] text-xs text-gray-400 tracking-widest">
              SEO INTELLIGENCE
            </span>
          </div>
          <h1
            className="font-['Fraunces'] font-bold text-white leading-tight tracking-tight mb-4"
            style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}
          >
            The RankyPulse Blog
          </h1>
          <p className="font-['DM_Sans'] text-gray-400 text-lg max-w-xl mx-auto">
            Technical SEO guides, case studies, and honest takes.
            No fluff. No keyword stuffing.{' '}
            <span className="text-white">Just things that work.</span>
          </p>
        </motion.div>

        {/* Featured post */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Link href={`/blog/${featured.slug}`}>
              <div className="relative p-8 md:p-10 rounded-3xl border
                border-indigo-500/20 bg-indigo-500/5
                hover:bg-indigo-500/[0.08] hover:border-indigo-500/30
                transition-all duration-300 group overflow-hidden">

                {/* Background accent */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 80% 20%,
                      rgba(99,102,241,0.15) 0%, transparent 60%)`,
                  }}
                />

                <div className="relative">
                  {/* Badges */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-['DM_Mono'] text-xs tracking-widest
                      px-2.5 py-1 rounded-full bg-indigo-500/20
                      border border-indigo-500/30 text-indigo-300">
                      ★ FEATURED
                    </span>
                    <span className="font-['DM_Mono'] text-xs text-gray-600 tracking-wider">
                      {featured.category.toUpperCase()}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="font-['Fraunces'] font-bold text-white leading-tight
                      tracking-tight mb-3 group-hover:text-indigo-200 transition-colors"
                    style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}
                  >
                    {featured.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="font-['DM_Sans'] text-gray-400 text-base mb-6 max-w-2xl leading-relaxed">
                    {featured.subtitle}
                  </p>

                  {/* Pull quote */}
                  <div className="border-l-2 border-indigo-500/40 pl-4 mb-6">
                    <p className="font-['Fraunces'] italic text-indigo-300 text-lg leading-relaxed">
                      &ldquo;{featured.pullQuote}&rdquo;
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-600" />
                        <span className="font-['DM_Mono'] text-xs text-gray-500">
                          {featured.readingMinutes} MIN READ
                        </span>
                      </div>
                      <span className="font-['DM_Mono'] text-xs text-gray-600">
                        {new Date(featured.publishedAt).toLocaleDateString('en-US',
                          { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-['DM_Sans'] text-sm
                      text-indigo-400 group-hover:gap-3 transition-all">
                      Read case study
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-['DM_Mono'] text-xs
                tracking-wider transition-all
                ${activeCategory === cat
                  ? 'bg-white/10 border border-white/20 text-white'
                  : 'bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-gray-300'
                }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Post grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((post, i) => {
            const catStyle = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS['Tools'];
            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="h-full p-6 bg-[#13161f] border border-white/[0.06]
                    rounded-2xl hover:border-white/[0.12] hover:-translate-y-1
                    hover:shadow-xl hover:shadow-black/30
                    transition-all duration-200 group flex flex-col">

                    {/* Category + read time */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="font-['DM_Mono'] text-xs tracking-wider px-2.5 py-1 rounded-full border"
                        style={{
                          color: catStyle.color,
                          background: catStyle.bg,
                          borderColor: catStyle.border,
                        }}
                      >
                        {post.category.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-gray-600" />
                        <span className="font-['DM_Mono'] text-xs text-gray-600">
                          {post.readingMinutes} MIN
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-['Fraunces'] text-xl font-bold text-white
                      leading-snug mb-2 group-hover:text-indigo-200
                      transition-colors flex-1">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="font-['DM_Sans'] text-sm text-gray-400
                      leading-relaxed mb-5 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Pull quote */}
                    <div className="border-l-2 border-white/10 pl-3 mb-5">
                      <p className="font-['Fraunces'] italic text-gray-500
                        text-sm leading-relaxed line-clamp-2">
                        &ldquo;{post.pullQuote}&rdquo;
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between
                      pt-4 border-t border-white/[0.05] mt-auto">
                      <span className="font-['DM_Mono'] text-xs text-gray-600">
                        {new Date(post.publishedAt).toLocaleDateString('en-US',
                          { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="font-['DM_Sans'] text-xs text-indigo-400
                        flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read more
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-['DM_Sans'] text-gray-500 text-sm">
              No posts in this category yet.
            </p>
          </div>
        )}

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center"
        >
          <h3 className="font-['Fraunces'] text-2xl font-bold text-white mb-2">
            Get new posts in your inbox
          </h3>
          <p className="font-['DM_Sans'] text-gray-400 text-sm mb-6">
            One email when we publish. No newsletters. No drip campaigns.
          </p>
          <form className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="you@yoursite.com"
              className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/10
                rounded-xl text-sm text-white placeholder-gray-600
                font-['DM_Sans'] focus:outline-none
                focus:border-indigo-500/50 transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl
                font-['DM_Sans'] font-semibold text-sm
                hover:bg-indigo-400 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </motion.div>

      </div>
    </main>
  );
}
