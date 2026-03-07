"use client";

import { useState } from "react";
import { X, Plus, Monitor, Smartphone, Loader2 } from "lucide-react";
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

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);

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
        setError(data.error ?? "Failed to add keyword");
        return;
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white">Track New Keyword</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition"
            style={{ color: "#8B9BB4" }}
          >
            <X size={16} />
          </button>
        </div>

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
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 border outline-none focus:border-orange-500/50 transition"
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
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 border outline-none focus:border-orange-500/50 transition"
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition"
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
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white border outline-none focus:border-orange-500/50 transition appearance-none"
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

          {error && (
            <p className="text-xs text-red-400 rounded-lg p-2.5" style={{ background: "rgba(255,61,61,0.08)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !keyword.trim()}
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
