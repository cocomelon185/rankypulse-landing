/**
 * Selects the next best Quick Win from audit results.
 * Priority: HIGH before MED, then lowest effort first.
 */

import { getIssueContent } from "./issueCatalog";

export type AuditIssueInput = {
  id?: string;
  sev?: string;
  msg?: string;
  title?: string;
  severity?: string;
};

export type AuditResultInput = {
  url?: string;
  hostname?: string;
  issues?: AuditIssueInput[];
};

export type QuickWin = {
  issueId: string;
  title: string;
  impact: "HIGH" | "MED";
  effortMinutes: number;
  category: string;
  whyItMatters: string;
  manualSteps: string[];
  aiFixPreview: string;
  aiFixFull: string;
  templateSnippet?: string;
};

const FIXED_KEY_PREFIX = "quickwins_fixed::";

export function getFixedIds(site: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${FIXED_KEY_PREFIX}${site}`);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

export function markAsFixed(site: string, issueId: string): void {
  if (typeof window === "undefined") return;
  const ids = getFixedIds(site);
  if (ids.includes(issueId)) return;
  ids.push(issueId);
  localStorage.setItem(`${FIXED_KEY_PREFIX}${site}`, JSON.stringify(ids));
}

function toSeverity(sev: string | undefined): "HIGH" | "MED" | "LOW" | null {
  const s = (sev || "").toUpperCase();
  if (s === "HIGH" || s === "MED" || s === "LOW") return s;
  if (s === "MEDIUM") return "MED";
  return null;
}

function toEffort(content: { effortMinutes: number }): number {
  return typeof content.effortMinutes === "number" && content.effortMinutes > 0
    ? content.effortMinutes
    : 5;
}

/**
 * Select next best win from audit issues.
 * Filters out fixed issues, sorts by severity (HIGH first) then effort (low first).
 */
export function selectNextWin(
  audit: AuditResultInput | null,
  fixedIds: string[]
): QuickWin | null {
  if (!audit?.issues?.length) return null;

  const eligible = audit.issues
    .map((i) => {
      const id = String(i.id ?? i.msg ?? "").trim() || "unknown";
      const sev = toSeverity(i.sev ?? i.severity);
      if (!sev || (sev !== "HIGH" && sev !== "MED")) return null;
      if (fixedIds.includes(id)) return null;
      const content = getIssueContent(id, i.msg || i.title);
      return {
        id,
        sev,
        effort: toEffort(content),
        content,
        rawTitle: i.msg || i.title,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => {
    if (a.sev !== b.sev) return a.sev === "HIGH" ? -1 : 1;
    return a.effort - b.effort;
  });

  const best = eligible[0];
  return {
    issueId: best.id,
    title: best.content.title,
    impact: (best.content.impact === "LOW" ? "MED" : best.content.impact),
    effortMinutes: best.content.effortMinutes,
    category: best.content.category,
    whyItMatters: best.content.whyItMatters,
    manualSteps: best.content.manualSteps,
    aiFixPreview: best.content.aiFixPreview,
    aiFixFull: best.content.aiFixFull,
    templateSnippet: best.content.templateSnippet,
  };
}
