"use client";

interface AuditSummaryPanelProps {
  score: number;
  errors: number;
  topIssueName?: string;
  topIssuePages?: number;
  quickWinName?: string;
  quickWinGain?: number;
}

export function AuditSummaryPanel({
  score,
  errors,
  topIssueName,
  topIssuePages,
  quickWinName,
  quickWinGain,
}: AuditSummaryPanelProps) {
  const scoreLabel = score >= 80 ? "strong" : score >= 60 ? "moderate" : "low";
  const scoreColor = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  const parts: string[] = [];
  parts.push(`Your website scored ${score}/100 — ${scoreLabel} overall.`);
  if (topIssueName && topIssuePages) {
    parts.push(
      `Primary concern: ${topIssueName} affecting ${topIssuePages} page${topIssuePages !== 1 ? "s" : ""}.`
    );
  } else if (errors === 0) {
    parts.push("No critical errors detected.");
  } else {
    parts.push(
      `${errors} critical error${errors !== 1 ? "s" : ""} require${errors === 1 ? "s" : ""} immediate attention.`
    );
  }
  if (quickWinName && quickWinGain) {
    parts.push(`Quick win: fix ${quickWinName.toLowerCase()} to gain +${quickWinGain} points.`);
  }

  return (
    <div
      className="rounded-xl border px-5 py-4"
      style={{ background: "linear-gradient(135deg, #0d1526, #111827)", borderColor: "#1E2940" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-black"
          style={{ background: `${scoreColor}20`, color: scoreColor }}
        >
          {score >= 80 ? "✓" : score >= 60 ? "~" : "!"}
        </div>
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#6B7A99" }}
          >
            SEO Summary
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#C8D0E0" }}>
            {parts.join(" ")}
          </p>
        </div>
      </div>
    </div>
  );
}
