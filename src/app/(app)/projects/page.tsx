import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectsClient } from "@/components/dashboard/ProjectsClient";

import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Projects — RankyPulse",
    description: "Manage your SEO projects, view audits, and track history.",
    // Let's add robots if you need
};

function ProjectsSkeleton() {
    return (
        <div className="min-h-screen px-6 pt-24" style={{ background: "#0d0f14" }}>
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="h-10 w-48 animate-pulse rounded bg-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/3" />
                    ))}
                </div>
            </div>
        </div>
    );
}

async function ProjectsLoader() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return <ProjectsClient projects={[]} />;
    }

    const { data: jobs } = await supabaseAdmin
        .from("crawl_jobs")
        .select("*, audit_pages(score)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

    const projects = (jobs || []).map((job) => {
        const scores = Array.isArray(job.audit_pages) ? job.audit_pages.map((ap: any) => ap.score || 0) : [];
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

        // Calculate status string
        let statusText = "Healthy";
        if (job.status === "pending" || job.status === "crawling") {
            statusText = "Crawling";
        } else if (job.status === "failed") {
            statusText = "Failed";
        } else if (avgScore < 60) {
            statusText = "Critical";
        } else if (avgScore < 80) {
            statusText = "Needs Attention";
        } else {
            statusText = "Healthy";
        }

        // formatting date nicely
        const dateObj = new Date(job.created_at);
        const lastRun = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(dateObj);

        return {
            id: job.id,
            name: job.domain,
            domain: job.domain,
            score: avgScore,
            lastRun,
            status: statusText
        };
    });

    // We can group by domain, taking the latest, or just show all jobs. We'll show all jobs since each represents an audit.
    // If we only want unique domains, we'd filter here. Let's just show all jobs for now.

    const uniqueProjects = projects.filter(
        (proj, index, self) =>
            index === self.findIndex((t) => t.domain === proj.domain)
    );

    return <ProjectsClient projects={uniqueProjects} />;
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={<ProjectsSkeleton />}>
            <ProjectsLoader />
        </Suspense>
    );
}
