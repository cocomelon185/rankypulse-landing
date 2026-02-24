export type AuditIssue = {
  id: string;
  code: string;
  title: string;
  severity: string;
  effortMinutes?: number;
  category?: string;
  suggestedFix?: string;
};

export type PresentedIssue = AuditIssue & {
  effortMinutes: number;
  displayTitle: string;
  whyItMatters: string;
  impactSummary: string;
  impactLabel: "High" | "Medium" | "Low";
  confidenceLabel: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Medium";
  affectedUrlsCount: number;
  sampleUrls: string[];
  steps: string[];
};

function normalizeSeverity(severity: string): "HIGH" | "MEDIUM" | "LOW" {
  const s = severity.toUpperCase();
  if (s === "CRITICAL" || s === "HIGH") return "HIGH";
  if (s === "MED" || s === "MEDIUM") return "MEDIUM";
  return "LOW";
}

function scoreFromSeverity(severity: string): number {
  const normalized = normalizeSeverity(severity);
  if (normalized === "HIGH") return 3;
  if (normalized === "MEDIUM") return 2;
  return 1;
}

type PresentationPreset = {
  title: string;
  whyItMatters: string;
  impactSummary: string;
  steps: string[];
};

const PRESET_BY_CODE_KEYWORD: Array<{ keyword: string; preset: PresentationPreset }> = [
  {
    keyword: "meta_description",
    preset: {
      title: "Meta description missing",
      whyItMatters: "May reduce CTR in search results.",
      impactSummary: "Stronger snippets can increase clicks from existing rankings.",
      steps: [
        "Open your page template or CMS SEO settings.",
        "Add a unique 140-160 character meta description.",
        "Include the primary intent and a concrete benefit.",
        "Save and re-publish the page.",
      ],
    },
  },
  {
    keyword: "title",
    preset: {
      title: "Title tag too long",
      whyItMatters: "May dilute relevance and lower click-through rate.",
      impactSummary: "A clearer title helps searchers choose your result.",
      steps: [
        "Find the page title in your CMS or code.",
        "Trim to about 50-60 characters.",
        "Keep the primary keyword near the front.",
        "Save and re-crawl the page.",
      ],
    },
  },
  {
    keyword: "canonical",
    preset: {
      title: "Canonical points to non-preferred URL",
      whyItMatters: "May cause duplicate indexing and split ranking signals.",
      impactSummary: "Correct canonicals consolidate authority to one URL.",
      steps: [
        "Open the page head section.",
        "Update rel=canonical to the preferred URL.",
        "Ensure internal links use the same preferred version.",
        "Re-run the audit to verify.",
      ],
    },
  },
  {
    keyword: "heading",
    preset: {
      title: "Heading structure is inconsistent",
      whyItMatters: "May weaken topical clarity for crawlers and users.",
      impactSummary: "Clear hierarchy improves crawl understanding.",
      steps: [
        "Keep one H1 aligned to the primary topic.",
        "Use H2/H3 in logical order.",
        "Remove skipped heading levels where possible.",
      ],
    },
  },
  {
    keyword: "image",
    preset: {
      title: "Images missing optimization signals",
      whyItMatters: "May waste crawl budget and reduce image visibility.",
      impactSummary: "Image metadata improves discoverability and performance.",
      steps: [
        "Add descriptive alt text for important images.",
        "Compress large assets and use modern formats.",
        "Set width/height attributes to reduce layout shift.",
      ],
    },
  },
  {
    keyword: "link",
    preset: {
      title: "Internal link opportunities found",
      whyItMatters: "May limit crawl depth and topical authority flow.",
      impactSummary: "Better linking improves discovery of key pages.",
      steps: [
        "Identify priority pages to receive internal links.",
        "Add relevant in-content links using descriptive anchor text.",
        "Fix broken or redirected internal targets.",
      ],
    },
  },
];

function getPreset(issue: AuditIssue): PresentationPreset {
  const source = `${issue.code} ${issue.category ?? ""}`.toLowerCase();
  const match = PRESET_BY_CODE_KEYWORD.find((p) => source.includes(p.keyword));
  if (match) return match.preset;

  return {
    title: issue.title && !issue.title.toLowerCase().includes("seo issue") ? issue.title : "Technical SEO opportunity",
    whyItMatters: "May reduce visibility, clicks, or crawl efficiency.",
    impactSummary: "Addressing this issue can improve organic performance.",
    steps: [
      "Review the affected template or page settings.",
      "Apply the recommended SEO correction.",
      "Publish and verify the change in a fresh audit.",
    ],
  };
}

function buildSampleUrls(hostname: string, n: number): string[] {
  const paths = ["/", "/pricing", "/blog/seo-audit-checklist", "/features", "/contact"];
  return paths.slice(0, Math.max(2, Math.min(3, n))).map((path) => `https://${hostname}${path}`);
}

export function enrichIssues(issues: AuditIssue[], hostname: string): PresentedIssue[] {
  return issues.map((issue, index) => {
    const preset = getPreset(issue);
    const sevScore = scoreFromSeverity(issue.severity);
    const impacted = Math.max(2, sevScore * 3 - (index % 2));
    const effortMinutes = issue.effortMinutes ?? (sevScore === 3 ? 20 : sevScore === 2 ? 12 : 8);
    const confidenceLabel = sevScore === 3 ? "High" : "Medium";
    const impactLabel = sevScore === 3 ? "High" : sevScore === 2 ? "Medium" : "Low";
    const difficulty = effortMinutes <= 12 ? "Easy" : "Medium";

    return {
      ...issue,
      effortMinutes,
      displayTitle: preset.title,
      whyItMatters: preset.whyItMatters,
      impactSummary: preset.impactSummary,
      impactLabel,
      confidenceLabel,
      difficulty,
      affectedUrlsCount: impacted,
      sampleUrls: buildSampleUrls(hostname, impacted),
      steps: preset.steps,
    };
  });
}

export function issueWeight(issue: PresentedIssue): number {
  const sev = scoreFromSeverity(issue.severity);
  const effortMod = issue.effortMinutes && issue.effortMinutes > 15 ? 0.9 : 1;
  return sev * effortMod;
}
