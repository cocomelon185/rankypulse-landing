"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuditCtaForm } from "./AuditCtaForm";
import { getAllAuditLandings } from "@/lib/pseo/auditPages";
import { Search } from "lucide-react";

const auditPages = getAllAuditLandings();

export default function AuditHubClientPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return auditPages;
    return auditPages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.intro.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <PageLayout className="pb-16">
          <header className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-[#1B2559] md:text-4xl">
              SEO Audit Guides
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Free, actionable guides for auditing your site. Pick your niche or use case, then run a
              free audit to get started.
            </p>
          </header>

          <section className="mb-12 rounded-2xl border border-gray-200 bg-[#f8fafc] p-6 md:p-8">
            <h2 className="mb-4 text-xl font-semibold text-[#1B2559]">Run a free audit</h2>
            <p className="mb-6 text-gray-600">
              Enter your website URL to get an actionable SEO score and prioritized fixes in under 30
              seconds. No signup required.
            </p>
            <AuditCtaForm />
          </section>

          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search audit guides..."
                  className="h-11 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-base placeholder-gray-400 transition-colors focus:border-[#4318ff] focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20"
                  aria-label="Search audit guides"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((page) => (
                <Link
                  key={page.slug}
                  href={`/audit/${page.slug}`}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-[#4318ff]/30 hover:shadow-lg"
                >
                  <h3 className="mb-2 font-semibold text-[#1B2559] group-hover:text-[#4318ff]">
                    {page.title}
                  </h3>
                  <p className="line-clamp-2 flex-1 text-sm text-gray-600">{page.intro}</p>
                  <span className="mt-3 text-sm font-medium text-[#4318ff]">Read guide →</span>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="py-12 text-center text-gray-500">No audit guides match your search.</p>
            )}
          </section>
        </PageLayout>
      </main>
      <Footer />
    </div>
  );
}
