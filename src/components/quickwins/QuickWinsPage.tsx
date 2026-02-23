"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { QuickWinCard } from "./QuickWinCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Zap, FileSearch } from "lucide-react";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import {
  selectNextWin,
  getFixedIds,
  markAsFixed,
} from "@/lib/quickwins/selectNextWin";
import { getLatestAudit } from "@/lib/quickwins/getLatestAudit";

export default function QuickWinsPage() {
  const searchParams = useSearchParams();
  const siteParam = searchParams?.get("site") ?? "";
  const { isPro } = usePlan();

  const [state, setState] = useState<{
    site: string;
    audit: ReturnType<typeof getLatestAudit>;
    fixedIds: string[];
    loading: boolean;
  }>({ site: "", audit: null, fixedIds: [], loading: true });

  const { site, audit, fixedIds, loading } = state;

  useEffect(() => {
    let ignore = false;
    const s = (siteParam || "").trim();
    const auditData = getLatestAudit(s || undefined);
    const hostname = auditData?.hostname ?? (s || "");
    const resolvedSite = hostname || s;
    const ids = resolvedSite ? getFixedIds(resolvedSite) : [];
    queueMicrotask(() => {
      if (!ignore) {
        setState({ site: s, audit: auditData, fixedIds: ids, loading: false });
      }
    });
    return () => {
      ignore = true;
    };
  }, [siteParam]);

  const resolvedSite = audit?.hostname ?? site;
  const nextWin = resolvedSite
    ? selectNextWin(audit, fixedIds)
    : null;

  const handleMarkFixed = () => {
    if (!nextWin || !resolvedSite) return;

    markAsFixed(resolvedSite, nextWin.issueId);
    setState((prev) => ({
      ...prev,
      fixedIds: [...prev.fixedIds, nextWin!.issueId],
    }));
    toast.success("Marked as fixed! Loading next win...");

    if (typeof fetch !== "undefined") {
      fetch("/api/quickwins/fixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site: resolvedSite, issueId: nextWin.issueId }),
      }).catch(() => {});
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <PageHeader
          icon={<Zap className="h-7 w-7" />}
          title="Quick Wins"
          subtitle="Fix the next issue in minutes."
        />
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </PageLayout>
    );
  }

  if (!audit) {
    return (
      <PageLayout>
        <PageHeader
          icon={<Zap className="h-7 w-7" />}
          title="Quick Wins"
          subtitle="Fix the next issue in minutes."
        />
        <EmptyState
          icon={<FileSearch className="h-10 w-10" />}
          title="Run your first audit"
          description="Quick Wins are based on your audit results. Run an audit to get personalized fixes."
          action={
            <Link href="/audit">
              <Button size="lg">
                <FileSearch className="mr-2 h-5 w-5" />
                Run new audit
              </Button>
            </Link>
          }
        />
      </PageLayout>
    );
  }

  if (!resolvedSite) {
    return (
      <PageLayout>
        <PageHeader
          icon={<Zap className="h-7 w-7" />}
          title="Quick Wins"
          subtitle="Fix the next issue in minutes."
        />
        <EmptyState
          icon={<FileSearch className="h-10 w-10" />}
          title="Select a site to view Quick Wins"
          description="Add ?site=yoursite.com to the URL or run an audit first."
          action={
            <Link href="/audit">
              <Button size="lg">
                <FileSearch className="mr-2 h-5 w-5" />
                Run audit
              </Button>
            </Link>
          }
        />
      </PageLayout>
    );
  }

  if (!nextWin) {
    return (
      <PageLayout>
        <PageHeader
          icon={<Zap className="h-7 w-7" />}
          title="Quick Wins"
          subtitle="Fix the next issue in minutes."
        />
        <EmptyState
          icon={<Zap className="h-10 w-10" />}
          title="You're in great shape"
          description="No high or medium priority issues left. Run another audit or explore improvements."
          action={
            <Link href="/audit">
              <Button size="lg">
                <FileSearch className="mr-2 h-5 w-5" />
                Run new audit
              </Button>
            </Link>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        icon={<Zap className="h-7 w-7" />}
        title="Quick Wins"
        subtitle="Fix the next issue in minutes."
      />

      <div className="space-y-6">
        <QuickWinCard
          win={nextWin}
          isPro={isPro}
          onMarkFixed={handleMarkFixed}
        />
      </div>
    </PageLayout>
  );
}
