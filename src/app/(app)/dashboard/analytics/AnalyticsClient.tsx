"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/horizon";
import { StatCard } from "@/components/layout/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Clipboard,
  Trash2,
  Activity,
  MousePointerClick,
  Mail,
  DoorOpen,
  Zap,
  CreditCard,
  ShoppingCart,
  Tag,
  ArrowRightLeft,
  Eye,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { BufferedEvent } from "@/lib/analytics";
import {
  getBufferedEvents,
  clearBufferedEvents,
  subscribe,
} from "@/lib/analytics";

const FUNNEL_STEPS = [
  "audit_results_view",
  "fix_button_click",
  "roadmap_cta_click",
  "modal_open",
  "modal_continue",
  "pricing_view_audit",
  "checkout_start",
] as const;

const FUNNEL_STEP_LABELS: Record<(typeof FUNNEL_STEPS)[number], string> = {
  audit_results_view: "audit_results_view",
  fix_button_click: "fix_button_click",
  roadmap_cta_click: "roadmap_cta_click",
  modal_open: "modal_open",
  modal_continue: "modal_continue",
  pricing_view_audit: "pricing_view (source=audit)",
  checkout_start: "checkout_start",
};

const KPI_EVENTS = [
  { key: "audit_results_view", label: "Audit results views", icon: Eye },
  { key: "email_submit_clicked", label: "Email submit clicked", icon: Send },
  { key: "email_submit_success", label: "Email submit success", icon: CheckCircle },
  { key: "email_submit_error", label: "Email submit error", icon: AlertCircle },
  { key: "fix_button_click", label: "Fix button clicks", icon: MousePointerClick },
  { key: "roadmap_cta_click", label: "Roadmap CTA clicks", icon: Zap },
  { key: "modal_open", label: "Modal opens", icon: DoorOpen },
  { key: "modal_continue", label: "Modal continue", icon: Activity },
  { key: "pricing_view", label: "Pricing views", icon: CreditCard },
  { key: "checkout_start", label: "Checkout starts", icon: ShoppingCart },
] as const;

function deriveNotes(ev: BufferedEvent): string {
  const p = ev.payload;
  const parts: string[] = [];
  if (p.severity) parts.push(`severity: ${p.severity}`);
  if (p.category) parts.push(`category: ${String(p.category).slice(0, 40)}`);
  if (p.issueId) parts.push(`issue: ${p.issueId}`);
  if (parts.length) return parts.join(" · ");
  return Object.keys(p).length ? "—" : "—";
}

export default function ConversionDashboardClient() {
  const [events, setEvents] = useState<BufferedEvent[]>([]);
  const [timeRange, setTimeRange] = useState<"session" | "all">("session");
  const [copied, setCopied] = useState(false);
  const sessionStartRef = useRef<number>(Date.now());

  const refresh = useCallback(() => {
    setEvents(getBufferedEvents());
  }, []);

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, [refresh]);

  const filteredEvents =
    timeRange === "session"
      ? events.filter((e) => e.ts >= sessionStartRef.current)
      : events;

  const counts = filteredEvents.reduce(
    (acc, e) => {
      acc[e.name] = (acc[e.name] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pricingViewAuditCount = filteredEvents.filter(
    (e) => e.name === "pricing_view" && e.payload.source === "audit"
  ).length;

  const funnelCounts = FUNNEL_STEPS.map((step) => {
    if (step === "pricing_view_audit") return pricingViewAuditCount;
    return counts[step] ?? 0;
  });
  const funnelPercentages: (number | null)[] = funnelCounts.map((c, i) => {
    if (i === 0) return c > 0 ? 100 : null;
    const prev = funnelCounts[i - 1];
    if (prev === 0) return null;
    return Math.round((c / prev) * 100);
  });

  // Top categories: group fix_button_click by payload.category (empty string → uncategorized)
  const categoryCounts = filteredEvents
    .filter((e) => e.name === "fix_button_click" && e.payload.category !== undefined)
    .reduce(
      (acc, e) => {
        const cat = String(e.payload.category).trim() || "(uncategorized)";
        acc[cat] = (acc[cat] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Source breakdown: pricing_view by payload.source (audit vs direct)
  const sourceCounts = filteredEvents
    .filter((e) => e.name === "pricing_view")
    .reduce(
      (acc, e) => {
        const src = (e.payload.source as string) || "direct";
        acc[src] = (acc[src] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  const sourceBreakdown = Object.entries(sourceCounts).sort(([, a], [, b]) => b - a);

  // Funnel by variant
  const variants = ["a", "b"] as const;
  const funnelByVariant = variants.map((v) => {
    const ev = filteredEvents.filter((e) => (e.payload.variant as string) === v || (!e.payload.variant && v === "a"));
    const auditResultsView = ev.filter((e) => e.name === "audit_results_view").length;
    const roadmapCtaClick = ev.filter((e) => e.name === "roadmap_cta_click").length;
    const modalOpen = ev.filter((e) => e.name === "modal_open").length;
    const modalContinue = ev.filter((e) => e.name === "modal_continue").length;
    const pricingViewAudit = ev.filter((e) => e.name === "pricing_view" && e.payload.source === "audit").length;
    const checkoutStart = ev.filter((e) => e.name === "checkout_start").length;
    return {
      variant: v,
      audit_results_view: auditResultsView,
      roadmap_cta_click: roadmapCtaClick,
      modal_open: modalOpen,
      modal_continue: modalContinue,
      pricing_view_audit: pricingViewAudit,
      checkout_start: checkoutStart,
      modalContinueRate: modalOpen > 0 ? (modalContinue / modalOpen) * 100 : null,
      checkoutRate: pricingViewAudit > 0 ? (checkoutStart / pricingViewAudit) * 100 : null,
    };
  });

  function handleCopyJson() {
    const sanitized = filteredEvents.map(({ name, ts, payload }) => ({
      name,
      ts,
      payload,
    }));
    try {
      navigator.clipboard.writeText(JSON.stringify(sanitized, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  function handleClear() {
    clearBufferedEvents();
    sessionStartRef.current = Date.now();
    refresh();
  }

  const recentEvents = filteredEvents.slice(-50).reverse();

  return (
    <>
      <PageHeader
        icon={<BarChart3 className="h-7 w-7" />}
        title="Conversion Dashboard"
        subtitle="Internal event metrics for audit conversion funnel. Events are buffered locally."
      />

      {/* Time range toggle */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={timeRange === "session" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setTimeRange("session")}
        >
          Session
        </Button>
        <Button
          variant={timeRange === "all" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setTimeRange("all")}
        >
          All saved
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          name="Total events"
          value={filteredEvents.length}
          icon={<Activity className="h-7 w-7 text-[#4318ff]" />}
          iconBg="bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]"
        />
        {KPI_EVENTS.map(({ key, label, icon: Icon }) => (
          <StatCard
            key={key}
            name={label}
            value={counts[key] ?? 0}
            icon={<Icon className="h-7 w-7 text-[#4318ff]" />}
            iconBg="bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]"
          />
        ))}
      </div>

      {/* Funnel */}
      <Card extra="p-6 mb-10" default>
        <h3 className="mb-4 font-semibold text-[#1B2559]">Conversion funnel</h3>
        <div className="space-y-3">
          {FUNNEL_STEPS.map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3"
            >
              <span className="w-6 shrink-0 text-sm font-medium text-gray-500">
                {i}
              </span>
              <span className="min-w-[200px] font-mono text-sm text-[#1B2559]">
                {FUNNEL_STEP_LABELS[step]}
              </span>
              <span className="font-semibold text-[#4318ff]">
                {funnelCounts[i]}
              </span>
              {funnelPercentages[i] !== null && (
                <span className="text-sm text-gray-600">
                  {i > 0 ? `(${funnelPercentages[i]}% of previous)` : ""}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Funnel by variant */}
      <Card extra="p-6 mb-10" default>
        <h3 className="mb-4 font-semibold text-[#1B2559]">Funnel by variant</h3>
        <p className="mb-4 text-sm text-gray-600">
          A/B variant breakdown. Variant set via ?variant=a|b on audit results, stored in localStorage.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 text-left text-sm font-semibold text-gray-600">Variant</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-600">audit_results_view</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-600">roadmap_cta_click</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-600">modal_continue</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-600">pricing_view(audit)</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-600">checkout_start</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-600">modal_continue / modal_open</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-600">checkout / pricing_view(audit)</th>
              </tr>
            </thead>
            <tbody>
              {funnelByVariant.map((row) => (
                <tr
                  key={row.variant}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
                >
                  <td className="py-2 text-sm font-medium text-[#1B2559]">{row.variant}</td>
                  <td className="py-2 text-right font-mono text-sm text-[#4318ff]">{row.audit_results_view}</td>
                  <td className="py-2 text-right font-mono text-sm text-[#4318ff]">{row.roadmap_cta_click}</td>
                  <td className="py-2 text-right font-mono text-sm text-[#4318ff]">{row.modal_continue}</td>
                  <td className="py-2 text-right font-mono text-sm text-[#4318ff]">{row.pricing_view_audit}</td>
                  <td className="py-2 text-right font-mono text-sm text-[#4318ff]">{row.checkout_start}</td>
                  <td className="py-2 text-right text-sm text-gray-600">
                    {row.modalContinueRate !== null ? `${Math.round(row.modalContinueRate)}%` : "—"}
                  </td>
                  <td className="py-2 text-right text-sm text-gray-600">
                    {row.checkoutRate !== null ? `${Math.round(row.checkoutRate)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top categories + Source breakdown */}
      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <Card extra="p-6" default>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#1B2559]">
            <Tag className="h-5 w-5 text-[#4318ff]" />
            Top categories
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            fix_button_click events grouped by payload.category
          </p>
          {topCategories.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-sm text-gray-500">
              No fix_button_click events with category yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 text-left text-sm font-semibold text-gray-600">
                      Category
                    </th>
                    <th className="pb-2 text-right text-sm font-semibold text-gray-600">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topCategories.map(([cat, count]) => (
                    <tr
                      key={cat}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
                    >
                      <td className="py-2 text-sm text-[#1B2559]">{cat}</td>
                      <td className="py-2 text-right font-semibold text-[#4318ff]">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card extra="p-6" default>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#1B2559]">
            <ArrowRightLeft className="h-5 w-5 text-[#4318ff]" />
            Source breakdown
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            pricing_view events by referrer/source (audit vs direct)
          </p>
          {sourceBreakdown.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-sm text-gray-500">
              No pricing_view events yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 text-left text-sm font-semibold text-gray-600">
                      Source
                    </th>
                    <th className="pb-2 text-right text-sm font-semibold text-gray-600">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sourceBreakdown.map(([src, count]) => (
                    <tr
                      key={src}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
                    >
                      <td className="py-2 text-sm text-[#1B2559]">{src}</td>
                      <td className="py-2 text-right font-semibold text-[#4318ff]">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Recent events table */}
      <Card extra="p-6 mb-10" default>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-[#1B2559]">Recent events (last 50)</h3>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopyJson}>
              <Clipboard className="mr-1.5 h-4 w-4" />
              {copied ? "Copied!" : "Copy events JSON"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear events
            </Button>
          </div>
        </div>

        {recentEvents.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
            <p className="font-medium text-gray-600">No events yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Open{" "}
              <a
                href="/audit/results?sample=1"
                className="font-semibold text-[#4318ff] hover:underline"
              >
                /audit/results?sample=1
              </a>{" "}
              (click Fix / Unlock / Continue → pricing), or{" "}
              <a
                href="/pricing"
                className="font-semibold text-[#4318ff] hover:underline"
              >
                /pricing
              </a>{" "}
              to generate events.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-sm font-semibold text-gray-600">
                    Time
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-600">
                    Event
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-600">
                    Issue Severity
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-600">
                    Issue Category
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-600">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((ev, i) => (
                  <tr
                    key={`${ev.ts}-${i}`}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
                  >
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(ev.ts).toLocaleTimeString()}
                    </td>
                    <td className="py-3 font-mono text-sm font-medium text-[#1B2559]">
                      {ev.name}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {ev.payload.severity ?? "—"}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {ev.payload.category
                        ? String(ev.payload.category).slice(0, 40)
                        : "—"}
                    </td>
                    <td className="max-w-[200px] truncate py-3 text-sm text-gray-600">
                      {deriveNotes(ev)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
