import type { KeywordIntent } from "@/lib/keyword-intent";

export type RecommendedContentType =
  | "Landing Page"
  | "Comparison Article"
  | "Blog Post"
  | "Tool Page";

export function recommendContentType(keyword: string, intent: KeywordIntent): RecommendedContentType {
  const value = keyword.toLowerCase();

  if (/\b(checker|tool|generator|audit tool|audit checker|analyzer|analysis tool)\b/.test(value)) {
    return "Tool Page";
  }

  if (/\b(vs|versus|compare|comparison|best|top|alternative|competitor)\b/.test(value)) {
    return "Comparison Article";
  }

  if (intent === "transactional") {
    return /\b(tool|platform|software)\b/.test(value) ? "Tool Page" : "Landing Page";
  }

  if (intent === "commercial") return "Comparison Article";
  if (intent === "informational") return "Blog Post";
  return "Landing Page";
}
