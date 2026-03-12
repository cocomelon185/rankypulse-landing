import Anthropic from "@anthropic-ai/sdk";
import { dedupeNormalized, looksBroadTopic, meaningfulTokens, normalizePhrase } from "./normalize";
import type { SeedSuggestion } from "./types";

const TOPIC_MAP: Record<string, string[]> = {
  seo: [
    "seo audit",
    "technical seo",
    "website audit",
    "seo analysis",
    "site audit tool",
    "seo checker",
  ],
  backlinks: [
    "backlink checker",
    "backlink analysis",
    "link building tool",
    "backlink audit",
    "backlink monitor",
    "competitor backlinks",
  ],
  "keyword research": [
    "keyword research tool",
    "keyword analysis",
    "search volume checker",
    "keyword gap analysis",
    "long tail keywords",
    "keyword tracker",
  ],
  rankings: [
    "rank tracker",
    "keyword rank checker",
    "seo ranking tracker",
    "serp monitoring",
    "position tracking",
    "google rank tracking",
  ],
};

function heuristicSeeds(topic: string): SeedSuggestion[] {
  const normalized = normalizePhrase(topic);
  const fromMap = TOPIC_MAP[normalized];
  const tokens = meaningfulTokens(normalized);

  const generated = fromMap ?? [
    `${normalized} tool`,
    `${normalized} software`,
    `best ${normalized}`,
    `${normalized} guide`,
    `${normalized} analysis`,
    `${normalized} checklist`,
  ];

  return dedupeNormalized(
    generated.map((keyword, index) => ({
      keyword,
      source: "ai" as const,
      score: Math.max(50, 90 - index * 6 + (tokens.length <= 2 ? 4 : 0)),
      reason: "Expanded from a broad topic into practical starter keywords.",
    }))
  ).slice(0, 8);
}

function parseAiSeeds(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-*\d.)]+\s*/, ""))
    .map((line) => normalizePhrase(line))
    .filter((line) => line.length >= 6 && meaningfulTokens(line).length >= 2);
}

export async function generateAiSeedSuggestions(input: {
  topic: string;
  domain?: string;
  maxSuggestions?: number;
}): Promise<SeedSuggestion[]> {
  if (!looksBroadTopic(input.topic)) return [];

  const heuristic = heuristicSeeds(input.topic);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return heuristic.slice(0, input.maxSuggestions ?? 8);

  try {
    const client = new Anthropic({ apiKey });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const message = await client.messages.create(
      {
        model: "claude-3-5-haiku-20241022",
        max_tokens: 180,
        messages: [
          {
            role: "user",
            content:
              `Generate 8 concise keyword seed phrases for a keyword research tool.\n` +
              `Topic: ${normalizePhrase(input.topic)}\n` +
              `Domain context: ${input.domain || "none"}\n` +
              `Rules: 2-4 words each, commercially useful, searchable, practical, no explanations, one per line.`,
          },
        ],
      },
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return heuristic.slice(0, input.maxSuggestions ?? 8);

    const merged = dedupeNormalized([
      ...parseAiSeeds(textBlock.text).map((keyword, index) => ({
        keyword,
        source: "ai" as const,
        score: Math.max(54, 96 - index * 5),
        reason: "Expanded from a broad topic using AI seed discovery.",
      })),
      ...heuristic,
    ]);

    return merged.slice(0, input.maxSuggestions ?? 8);
  } catch {
    return heuristic.slice(0, input.maxSuggestions ?? 8);
  }
}
