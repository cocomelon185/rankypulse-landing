import type { PresentedIssue } from "@/lib/audit-issue-presentation";
import type { FixStatus } from "@/components/audit/ProgressProof";

type ExportIssue = PresentedIssue & { fixStatus: FixStatus };

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportAsCSV(issues: ExportIssue[]): string {
  const header = ["Issue", "Severity", "Status", "Affected URLs", "Suggested Snippet", "Steps"].join(",");
  const rows = issues.map((issue) => {
    const urls = issue.affectedPages.map((p) => p.url).join("; ");
    const snippet = issue.snippetSuggestion?.suggested ?? "";
    const steps = issue.steps.map((s, i) => `${i + 1}. ${s}`).join(" ");
    return [
      escapeCSV(issue.displayTitle),
      escapeCSV(issue.severity),
      escapeCSV(issue.fixStatus),
      escapeCSV(urls),
      escapeCSV(snippet),
      escapeCSV(steps),
    ].join(",");
  });

  return [header, ...rows].join("\n");
}

export function exportAsMarkdown(issues: ExportIssue[], hostname: string): string {
  const lines: string[] = [
    `# SEO Audit Tasks \u2014 ${hostname}`,
    "",
    `Generated: ${new Date().toLocaleDateString()}`,
    "",
  ];

  for (const issue of issues) {
    const statusEmoji =
      issue.fixStatus === "verified" ? "\u2705" :
      issue.fixStatus === "done_unverified" ? "\u2611\uFE0F" : "\u2B1C";

    lines.push(`## ${statusEmoji} ${issue.displayTitle}`);
    lines.push("");
    lines.push(`- **Severity:** ${issue.severity}`);
    lines.push(`- **Impact:** ${issue.impactLabel} | **Effort:** ~${issue.effortMinutes} min`);
    lines.push(`- **Category:** ${issue.categoryTag}`);
    lines.push(`- **Status:** ${issue.fixStatus.replace(/_/g, " ")}`);
    lines.push("");

    if (issue.affectedPages.length > 0) {
      lines.push("**Affected URLs:**");
      for (const page of issue.affectedPages) {
        lines.push(`- ${page.url} (${page.pageType})`);
      }
      lines.push("");
    }

    if (issue.snippetSuggestion) {
      lines.push(`**Suggested ${issue.snippetSuggestion.type === "title" ? "Title" : "Meta Description"}:**`);
      lines.push(`> ${issue.snippetSuggestion.suggested}`);
      lines.push("");
    }

    lines.push("**Steps:**");
    for (let i = 0; i < issue.steps.length; i++) {
      lines.push(`${i + 1}. ${issue.steps[i]}`);
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
