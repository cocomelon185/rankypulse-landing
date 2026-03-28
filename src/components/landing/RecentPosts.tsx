import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FEATURED_POSTS = [
    {
          title: "How Google Actually Crawls Your Website",
          excerpt:
            "Understand Googlebot's crawl budget, crawl frequency, and how internal linking affects which pages get indexed.",
          href: "/blog/how-google-actually-crawls",
          readTime: "7 min read",
          tag: "Technical SEO",
        },
    {
          title: "Google Not Indexing Your Pages? Here's Why",
          excerpt:
            "Diagnose and fix the most common reasons Google refuses to index your content, from noindex tags to thin content.",
          href: "/blog/google-not-indexing-pages",
          readTime: "9 min read",
          tag: "Indexing",
        },
    {
          title: "How to Read an SEO Audit Report",
          excerpt:
            "Learn how to interpret an SEO audit, prioritize issues by impact, and turn findings into an actionable fix list.",
          href: "/blog/how-to-read-an-seo-audit",
          readTime: "6 min read",
          tag: "SEO Audits",
        },
  ];

export function RecentPosts() {
    return (
          <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Learn SEO From Our Blog
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Practical guides to help you fix technical issues, improve rankings,
                  and understand how Google works.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {FEATURED_POSTS.map((post) => (
                              <Link
                                key={post.href}
                                href={post.href}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-purple-300 transition-all duration-200 group flex flex-col"
                              >
                                <span className="inline-block text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-4 w-fit">
                                  {post.tag}
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors leading-snug">
                                  {post.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-1">
                                  {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                  <span className="text-xs text-gray-400">{post.readTime}</span>
                                  <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </Link>
                            ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                >
                  View all articles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        );
  }
