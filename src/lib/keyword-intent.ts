export type KeywordIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational"
  | "unknown";

export function classifyKeywordIntent(keyword: string): KeywordIntent {
  const value = keyword.toLowerCase().trim();
  if (!value) return "unknown";
  if (/\b(best|top|vs|review|compare|comparison|alternative|competitor)\b/.test(value)) return "commercial";
  if (/\b(price|pricing|buy|demo|service|agency|software|tool|platform|free trial|checker|generator)\b/.test(value)) return "transactional";
  if (/\b(login|signin|sign in|docs|documentation|github|youtube|official|brand)\b/.test(value)) return "navigational";
  return "informational";
}

export function formatKeywordIntent(intent: KeywordIntent): string {
  if (intent === "unknown") return "Unknown";
  return intent.charAt(0).toUpperCase() + intent.slice(1);
}
