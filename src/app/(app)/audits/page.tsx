import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Suspense } from 'react';
import AuditsClient from './AuditsClient';

function AuditsSkeleton() {
  return (
    <div className="min-h-screen px-6 pt-24 pb-20 bg-[#0d0f14]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="mx-auto max-w-5xl space-y-6 relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
            <div className="h-10 w-64 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
          </div>
        </div>
        <div className="h-12 w-full animate-pulse rounded-xl bg-white/5 mb-6" />
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-[#13161f]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse border-b border-white/[0.04] bg-white/[0.02]" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function AuditsLoader() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <AuditsClient audits={[]} />;
  }

  const { data: jobs } = await supabaseAdmin
    .from('crawl_jobs')
    .select(`
            *,
            audit_pages (
                score,
                issues
            )
        `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  // Transform jobs into UI audit objects
  const audits = (jobs || []).map(job => {
    // Compute average score & sum issues safely 
    // We know audit_pages can be an array and issues is JSONB which should be an array internally
    const pages = Array.isArray(job.audit_pages) ? job.audit_pages : [];
    const scores = pages.map((ap: any) => ap.score || 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

    let totalIssues = 0;
    let topIssue = null;

    // Sum total issues and try to find a critical/high severity issue name
    for (const page of pages) {
      const pageIssues = Array.isArray(page.issues) ? page.issues : [];
      totalIssues += pageIssues.length;

      if (!topIssue && pageIssues.length > 0) {
        // Just grab first issue title as topIssue for mock
        topIssue = pageIssues[0]?.title || pageIssues[0]?.id || 'Configuration Issue';
      }
    }

    return {
      id: job.id,
      domain: job.domain,
      score: avgScore,
      issueCount: totalIssues,
      trafficLoss: -0, // We don't really have a deterministic mock for this yet
      scannedAt: new Date(job.created_at).getTime(),
      topIssue: topIssue,
      trend: 'flat', // In a real app we'd compare vs prev crawl
      trendDelta: 0,
    };
  });

  return <AuditsClient audits={audits} />;
}

export default function AuditsPage() {
  return (
    <Suspense fallback={<AuditsSkeleton />}>
      <AuditsLoader />
    </Suspense>
  );
}
