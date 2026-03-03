"use client";

import { useState, useRef } from "react";
import { Share2, Check } from "lucide-react";
import { useAuditStore } from "@/lib/use-audit";

function getScoreColor(score: number) {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export function ShareScoreCard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const data = useAuditStore((s) => s.data);
  const completedFixIds = useAuditStore((s) => s.completedFixIds);

  const adjustedScore = Math.min(
    100,
    data.score +
    completedFixIds.filter(
      (id) => !data.issues.find((i) => i.id === id && i.status === "fixed")
    ).length *
    3
  );

  const scoreColor = getScoreColor(adjustedScore);
  const topIssue =
    data.issues.find((i) => i.status === "open" || i.status === "in-progress")
      ?.title ?? "SEO issues detected";

  const generateAndCopy = async () => {
    setIsGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;

      if (!cardRef.current) return;

      // Reveal the hidden card so html2canvas can paint it
      // Use visibility instead of position to prevent top-left flash
      cardRef.current.style.visibility = "visible";
      cardRef.current.style.pointerEvents = "none";

      // Wait two animation frames for the card to paint
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      // ── FONT RELIABILITY FIX ──
      try {
        await document.fonts.ready;
        await Promise.all([
          document.fonts.load('700 80px Fraunces'),
          document.fonts.load('400 13px "DM Sans"'),
          document.fonts.load('400 10px "DM Mono"'),
        ]);
      } catch {
        await new Promise<void>((r) => setTimeout(r, 300));
      }
      // ── END FONT FIX ──

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0d0f14",
        scale: 2,
        useCORS: true,
        logging: false,
        width: 600,
        height: 315,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement("style");
          style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700&family=DM+Sans:wght@400;600&family=DM+Mono:wght@400;500&display=swap');
            * { -webkit-font-smoothing: antialiased; }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      // Re-hide the card
      cardRef.current.style.visibility = "hidden";

      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
          });
        }
      });
    } catch {
      // Fallback: copy a text summary to clipboard
      navigator.clipboard
        .writeText(
          `My SEO score: ${adjustedScore}/100 for ${data.domain} — via rankypulse.com`
        )
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={generateAndCopy}
        disabled={isGenerating}
        className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-60"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-[var(--accent-success)]" />
            <span className="text-[var(--accent-success)]">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-3 w-3" />
            {isGenerating ? "Generating..." : "Share Score"}
          </>
        )}
      </button>

      {/* Hidden OG-style card — screenshotted by html2canvas */}
      <div
        ref={cardRef}
        data-html2canvas-ignore="false"
        className="fixed"
        style={{
          left: "50%",
          top: "-9999px",
          transform: "translateX(-50%)",
          width: "600px",
          height: "315px",
          background: "#0d0f14",
          padding: "32px",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          visibility: "hidden",
          zIndex: 9999,
        }}
        aria-hidden
      >
        {/* Inline font injection for html2canvas font reliability */}
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700&family=DM+Sans:wght@400;600&family=DM+Mono:wght@400;500&display=swap');
        ` }} />

        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(99,102,241,0.25), transparent 60%)",
          }}
        />

        {/* Header: logo + label */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              ⚡
            </div>
            <span
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              RankyPulse
            </span>
          </div>
          <span
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: 2,
            }}
          >
            SEO AUDIT
          </span>
        </div>

        {/* Middle: score + domain */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 40,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: 3,
                marginBottom: 4,
              }}
            >
              SEO HEALTH SCORE
            </p>
            <p
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: 72,
                fontWeight: 700,
                color: scoreColor,
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {adjustedScore}
            </p>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {data.domain}
            </p>
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                padding: "12px 14px",
                background: "rgba(239,68,68,0.1)",
                borderRadius: 10,
                border: "1px solid rgba(239,68,68,0.2)",
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: 9,
                  color: "rgba(239,68,68,0.8)",
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                TOP ISSUE
              </p>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {topIssue.length > 50 ? topIssue.slice(0, 50) + "..." : topIssue}
              </p>
            </div>
            <div
              style={{
                padding: "12px 14px",
                background: "rgba(16,185,129,0.1)",
                borderRadius: 10,
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <p
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: 9,
                  color: "rgba(16,185,129,0.8)",
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                POTENTIAL GAIN
              </p>
              <p
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#10b981",
                }}
              >
                +{data.estimatedTrafficLoss.min}–{data.estimatedTrafficLoss.max}/mo
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Audit your site free at rankypulse.com
          </span>
          <div
            style={{
              padding: "4px 10px",
              background: "rgba(99,102,241,0.2)",
              borderRadius: 6,
              border: "1px solid rgba(99,102,241,0.4)",
            }}
          >
            <span
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: 10,
                color: "#a5b4fc",
              }}
            >
              FREE AUDIT ↗
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
