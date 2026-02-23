type UnknownRecord = Record<string, unknown>;

function isRecord(v: unknown): v is UnknownRecord {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function normalizeAuditResult(raw: unknown, url: string) {
  const r = isRecord(raw) ? raw : {};

  const summary =
    typeof r.summary === "string"
      ? r.summary
      : typeof r.message === "string"
      ? r.message
      : "Audit complete";

  const scoreValue =
    typeof r.score === "number"
      ? r.score
      : typeof r.totalScore === "number"
      ? r.totalScore
      : 0;

  const scoresRaw = isRecord(r.scores) ? r.scores : {};
  const seo =
    typeof scoresRaw.seo === "number"
      ? scoresRaw.seo
      : typeof scoreValue === "number"
      ? scoreValue
      : 0;

  const scores = {
    seo,
    performance: typeof scoresRaw.performance === "number" ? scoresRaw.performance : undefined,
    accessibility: typeof scoresRaw.accessibility === "number" ? scoresRaw.accessibility : undefined,
    bestPractices: typeof scoresRaw.bestPractices === "number" ? scoresRaw.bestPractices : undefined,
  };

  const issuesRaw = Array.isArray(r.issues)
    ? r.issues
    : Array.isArray(r.findings)
    ? r.findings
    : [];

  const issues = issuesRaw
    .map((it) => (isRecord(it) ? it : null))
    .filter(Boolean)
    .map((it) => {
      const id =
        typeof it!.id === "string"
          ? it!.id
          : typeof it!.code === "string"
          ? it!.code
          : "issue";
      const code = typeof it!.code === "string" ? it!.code : id;
      const title = typeof it!.title === "string" ? it!.title : "SEO issue";
      const severity = typeof it!.severity === "string" ? it!.severity : "MED";
      const effortMinutes = typeof it!.effortMinutes === "number" ? it!.effortMinutes : 5;
      const category = typeof it!.category === "string" ? it!.category : "General";
      const suggestedFix = typeof it!.suggestedFix === "string" ? it!.suggestedFix : "";
      return { id, code, title, severity, effortMinutes, category, suggestedFix };
    });

  return {
    url,
    hostname: safeHostname(url),
    summary,
    scores,
    issues,
  };
}
