"use client";

import { useState } from "react";
import { Copy, Check, Eye, EyeOff, Link2, Lock, Globe } from "lucide-react";
import { useAuditStore } from "@/lib/use-audit";
import { useActiveAudit } from "@/lib/audit-context";

export function ShareLinkPanel() {
  const brandingConfig = useAuditStore((s) => s.brandingConfig);
  const setBrandingConfig = useAuditStore((s) => s.setBrandingConfig);
  const { auditId } = useActiveAudit();

  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [showPassword, setShowPassword] = useState(false);

  const shareUrl = `https://rankypulse.com/share/${auditId ?? "demo"}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[var(--bg-elevated,#1C2333)] p-4">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-[var(--accent-primary)]" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Public Share Link</h3>
      </div>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        Share a read-only view of this audit report with clients.
      </p>

      {/* Toggle */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {brandingConfig.shareEnabled ? "Link active" : "Link disabled"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={brandingConfig.shareEnabled}
          onClick={() => setBrandingConfig({ shareEnabled: !brandingConfig.shareEnabled })}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            brandingConfig.shareEnabled ? "bg-[var(--accent-primary)]" : "bg-white/[0.12]"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
              brandingConfig.shareEnabled ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Share URL + copy */}
      {brandingConfig.shareEnabled && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-white/[0.08] bg-black/20">
            <Link2 className="ml-3 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
            <span className="flex-1 truncate py-2 font-mono-data text-[11px] text-[var(--text-secondary)]">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex shrink-0 items-center gap-1 rounded-r-lg border-l border-white/[0.06] bg-white/[0.04] px-3 py-2 text-[10px] font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.08] hover:text-white"
            >
              {copyState === "copied" ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Optional password */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              <Lock className="h-3 w-3" />
              Password Protection (optional)
            </label>
            <div className="flex items-center overflow-hidden rounded-lg border border-white/[0.08] bg-black/20">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Leave blank for public access"
                value={brandingConfig.sharePassword}
                onChange={(e) => setBrandingConfig({ sharePassword: e.target.value })}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="flex shrink-0 items-center px-3 py-2 text-[var(--text-muted)] transition hover:text-[var(--text-secondary)]"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {brandingConfig.sharePassword && (
              <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                Visitors will need this password to view the report.
              </p>
            )}
          </div>

          <p className="text-[10px] text-[var(--text-muted)]">
            Backend persistence coming soon — link is UI-ready for integration.
          </p>
        </div>
      )}
    </div>
  );
}
