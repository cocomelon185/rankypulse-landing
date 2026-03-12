"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  formatAvailabilityLabel,
  getAvailabilityBadgeColor,
  type DataProviderAvailability,
} from "@/lib/data-provider";

type ProbeKey = "auth" | "keywords" | "backlinks" | "competitors" | "rankings";

type Probe = {
  key: ProbeKey;
  availability: DataProviderAvailability;
  checkedAt: string;
  message: string;
  adminMessage: string;
  httpStatus: number | null;
  dataforseoStatusCode: number | null;
  rawMessage: string | null;
};

type HealthReport = {
  checkedAt: string;
  env: {
    loginConfigured: boolean;
    passwordConfigured: boolean;
    configuredLoginMask: string | null;
    loginHadWrappingQuotes: boolean;
    passwordHadWrappingQuotes: boolean;
  };
  account: {
    providerLoginMask: string | null;
    backlinksSubscriptionExpiryDate: string | null;
  };
  probes: Record<ProbeKey, Probe>;
};

const CARD_BG = "#151B27";
const BORDER = "#1E2940";
const TEXT_MUTED = "#64748B";
const TEXT_DIM = "#8B9BB4";
const ACCENT = "#FF642D";

const PROBE_ORDER: ProbeKey[] = [
  "auth",
  "keywords",
  "rankings",
  "backlinks",
  "competitors",
];

const LABELS: Record<ProbeKey, string> = {
  auth: "Auth",
  keywords: "Keyword Ideas",
  rankings: "Rankings",
  backlinks: "Backlinks",
  competitors: "Competitors (Labs)",
};

function ChecklistItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2" style={{ background: "#0D1424" }}>
      <span className="text-xs font-medium" style={{ color: TEXT_DIM }}>{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

export function DataProviderDiagnosticsClient() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(forceRefresh = false) {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch("/api/admin/data-provider/health", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load diagnostics");
      }
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load diagnostics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Data Provider Diagnostics</h1>
          <p className="text-sm mt-1" style={{ color: TEXT_DIM }}>
            Admin-only health checks for live DataForSEO authentication and feature capability.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Re-checking…" : "Refresh Checks"}
        </button>
      </div>

      {error && (
        <div
          className="rounded-xl border p-4 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}
        >
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border h-40 animate-pulse"
              style={{ background: CARD_BG, borderColor: BORDER }}
            />
          ))}
        </div>
      )}

      {!loading && report && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD_BG, borderColor: BORDER }}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} style={{ color: "#22C55E" }} />
                <h2 className="text-sm font-bold text-white">Environment</h2>
              </div>
              <ChecklistItem
                label="Configured login"
                value={report.env.configuredLoginMask ?? "Not set"}
              />
              <ChecklistItem
                label="Login present"
                value={report.env.loginConfigured ? "Yes" : "No"}
              />
              <ChecklistItem
                label="Password present"
                value={report.env.passwordConfigured ? "Yes" : "No"}
              />
              <ChecklistItem
                label="Login quoted"
                value={report.env.loginHadWrappingQuotes ? "Yes" : "No"}
              />
              <ChecklistItem
                label="Password quoted"
                value={report.env.passwordHadWrappingQuotes ? "Yes" : "No"}
              />
            </div>

            <div className="rounded-xl border p-5 space-y-3" style={{ background: CARD_BG, borderColor: BORDER }}>
              <div className="flex items-center gap-2">
                <Zap size={16} style={{ color: "#A78BFA" }} />
                <h2 className="text-sm font-bold text-white">Account</h2>
              </div>
              <ChecklistItem
                label="Provider login"
                value={report.account.providerLoginMask ?? "Unavailable"}
              />
              <ChecklistItem
                label="Backlinks subscription"
                value={report.account.backlinksSubscriptionExpiryDate ?? "Not active"}
              />
              <ChecklistItem
                label="Last probe"
                value={new Date(report.checkedAt).toLocaleString()}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PROBE_ORDER.map((key) => {
              const probe = report.probes[key];
              const badgeColor = getAvailabilityBadgeColor(probe.availability);
              const isOk = probe.availability === "ok";
              return (
                <div
                  key={key}
                  className="rounded-xl border p-5 space-y-3"
                  style={{ background: CARD_BG, borderColor: BORDER }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{LABELS[key]}</p>
                      <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>
                        {probe.message}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                      style={{ background: `${badgeColor}18`, color: badgeColor }}
                    >
                      {formatAvailabilityLabel(probe.availability)}
                    </span>
                  </div>

                  <div
                    className="rounded-lg border p-3"
                    style={{ background: "#0D1424", borderColor: `${badgeColor}22` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isOk ? (
                        <CheckCircle2 size={14} style={{ color: "#22C55E" }} />
                      ) : (
                        <AlertTriangle size={14} style={{ color: badgeColor }} />
                      )}
                      <p className="text-xs font-semibold text-white">Admin detail</p>
                    </div>
                    <p className="text-xs leading-5" style={{ color: TEXT_DIM }}>
                      {probe.adminMessage}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <ChecklistItem
                      label="HTTP status"
                      value={probe.httpStatus != null ? String(probe.httpStatus) : "—"}
                    />
                    <ChecklistItem
                      label="DFS status"
                      value={
                        probe.dataforseoStatusCode != null
                          ? String(probe.dataforseoStatusCode)
                          : "—"
                      }
                    />
                    <ChecklistItem
                      label="Raw upstream"
                      value={probe.rawMessage ?? "—"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
