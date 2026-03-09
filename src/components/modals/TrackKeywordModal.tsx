"use client";

import { useState, useEffect } from "react";
import { X, Plus, Monitor, Smartphone, Loader2, TrendingUp } from "lucide-react";
import type { RankKeyword } from "@/lib/rank-engine";

const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "IN", label: "India" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "BR", label: "Brazil" },
  { code: "SG", label: "Singapore" },
];

interface TrackKeywordModalProps {
  domain: string;
  open: boolean;
  onClose: () => void;
  onAdded: (keyword: RankKeyword) => void;
}

interface PlanInfo {
  plan: string;
  keywordsUsed: number;
  keywordCap: number;
}

export function TrackKeywordModal({
  domain,
  open,
  onClose,
  onAdded,
}: TrackKeywordModalProps) {
  const [keyword, setKeyword] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [country, setCountry] = useState("US");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

  // Fetch quota info on open
  useEffect(() => {
    if (!open) return;
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then((d) => {
        if (d.keywordCap !== undefined) {
          setPlanInfo({
            plan: d.plan ?? "free",
            keywordsUsed: d.keywordsUsed ?? 0,
            keywordCap: d.keywordCap ?? 10,
          });
        }
      })
      .catch(() => {/* non-critical */});
  }, [open]);

  if (!open) return null;

  const atCap = planInfo ? planInfo.keywordsUsed >= planInfo.keywordCap : false;
  const nearCap = planInfo
    ? planInfo.keywordsUsed / planInfo.keywordCap >= 0.8
    : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim() || atCap) return;

    setLoading(true);
    setError(null);
    setLimitReached(false);

    try {
      const res = await fetch("/api/rank/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          keyword: keyword.trim(),
          target_url: targetUrl.trim() || undefined,
          device,
          country,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) {
          setLimitReached(true);
          if (planInfo) {
            setPlanInfo({ ...planInfo, keywordsUsed: planInfo.keywordCap });
          }
        }
        setError(data.error ?? "Failed to add keyword");
        return;
      }

      // Update local quota count
      if (planInfo) {
        setPlanInfo({ ...planInfo, keywordsUsed: planInfo.keywordsUsed + 1 });
      }

      onAdded(data.keyword);
      setKeyword("");
      setTargetUrl("");
      setDevice("desktop");
      setCountry("US");
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border p-6"
        style={{ background: "#151B27", borderColor: "#1E2940" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Track New Keyword</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition"
            style={{ color: "#8B9BB4" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quota indicator */}
        {planInfo && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold" style={{ color: "#8B9BB4" }}>
                Keywords tracked
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ color: atCap ? "#EF4444" : nearCap ? "#F59E0B" : "#8B9BB4" }}
              >
                {planInfo.keywordsUsed} / {planInfo.keywordCap}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "#1E2940" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (planInfo.keywordsUsed / planInfo.keywordCap) * 100)}%`,
                  background: atCap
                    ? "#EF4444"
                    : nearCap
                    ? "#F59E0B"
                    : "linear-gradient(90deg, #FF642D, #E8541F)",
                }}
              />
            </div>
          </div>
        )}

        {/* At cap banner */}
        {(atCap || limitReached) && (
          <div
            className="mb-4 rounded-xl p-4 border"
            style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}
          >
            <p className="text-xs font-semibold text-red-400 mb-2">
              Keyword limit reached for your {planInfo?.plan ?? "free"} plan
            </p>
            <p className="text-[11px] mb-3" style={{ color: "#8B9BB4" }}>
              Upgrade to track more keywords and unlock advanced SEO insights.
            </p>
            <a
              href="/app/billing"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
            >
              <TrendingUp size={12} />
              Upgrade Plan
            </a>
          </div>
        )}

        {/* Near cap warning */}
        {!atCap && !limitReached && nearCap && planInfo && (
          <div
            className="mb-4 rounded-lg px-3 py-2 border flex items-center justify-between"
            style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.2)" }}
          >
            <p className="text-[11px]" style={{ color: "#F59E0B" }}>
              {planInfo.keywordCap - planInfo.keywordsUsed} keyword slots remaining
            </p>
            <a
              href="/app/billing"
              className="text-[11px] font-bold"
              style={{ color: "#FF642D" }}
            >
              Upgrade →
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Keyword */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#8B9BB4" }}>
              Keyword <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. seo audit tool"
              required
              disabled={atCap || limitReached}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 border outline-none focus:border-orange-500/50 transition disabled:opacity-40"
              style={{ background: "#0D1424", borderColor: "#1E2940" }}
            />
          </div>

          {/* Target URL */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#8B9BB4" }}>
              Target URL <span className="text-xs font-normal" style={{ color: "#4A5568" }}>(optional)</span>
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="e.g. /features/seo-audit"
              disabled={atCap || limitReached}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 border outline-none focus:border-orange-500/50 transition disabled:opacity-40"
              style={{ background: "#0D1424", borderColor: "#1E2940" }}
            />
          </div>

          {/* Device Toggle */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#8B9BB4" }}>
              Device
            </label>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#1E2940" }}>
              {(["desktop", "mobile"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  disabled={atCap || limitReached}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition disabled:opacity-40"
                  style={{
                    background: device === d ? "rgba(255,100,45,0.15)" : "transparent",
                    color: device === d ? "#FF642D" : "#8B9BB4",
                  }}
                >
                  {d === "desktop" ? <Monitor size={12} /> : <Smartphone size={12} />}
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#8B9BB4" }}>
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={atCap || limitReached}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white border outline-none focus:border-orange-500/50 transition appearance-none disabled:opacity-40"
              style={{ background: "#0D1424", borderColor: "#1E2940" }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Domain preview */}
          <p className="text-[11px]" style={{ color: "#4A5568" }}>
            Tracking for: <span style={{ color: "#FF642D" }}>{domain}</span>
          </p>

          {error && !limitReached && (
            <p className="text-xs text-red-400 rounded-lg p-2.5" style={{ background: "rgba(255,61,61,0.08)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !keyword.trim() || atCap || limitReached}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {loading ? "Fetching ranking…" : "Track Keyword"}
          </button>
        </form>
      </div>
    </div>
  );
}
