export type DataProviderFeature =
  | "auth"
  | "keywords"
  | "backlinks"
  | "competitors"
  | "rankings";

export type DataProviderAvailability =
  | "ok"
  | "invalid_credentials"
  | "missing_capability"
  | "provider_unavailable"
  | "rate_limited";

export const DATA_PROVIDER_ERROR_CODES: Record<
  Exclude<DataProviderAvailability, "ok">,
  string
> = {
  invalid_credentials: "DFS_INVALID_CREDENTIALS",
  missing_capability: "DFS_MISSING_CAPABILITY",
  provider_unavailable: "DFS_PROVIDER_UNAVAILABLE",
  rate_limited: "DFS_RATE_LIMITED",
};

export function getDataProviderUnavailableMessage(
  feature: DataProviderFeature
): string {
  switch (feature) {
    case "keywords":
      return "Keyword research is temporarily unavailable.";
    case "backlinks":
      return "Backlink refresh is temporarily unavailable.";
    case "competitors":
      return "Automatic competitor discovery is temporarily unavailable.";
    case "rankings":
      return "Live ranking enrichment is temporarily unavailable.";
    case "auth":
    default:
      return "Automatic data is temporarily unavailable.";
  }
}

export function getDataProviderErrorPayload(
  feature: DataProviderFeature,
  availability: Exclude<DataProviderAvailability, "ok">
): {
  availability: Exclude<DataProviderAvailability, "ok">;
  code: string;
  error: string;
} {
  return {
    availability,
    code: DATA_PROVIDER_ERROR_CODES[availability],
    error: getDataProviderUnavailableMessage(feature),
  };
}

export function isDataProviderUnavailableCode(code: unknown): boolean {
  return typeof code === "string" && code.startsWith("DFS_");
}

export function getAvailabilityBadgeColor(
  availability: DataProviderAvailability
): string {
  switch (availability) {
    case "ok":
      return "#22C55E";
    case "missing_capability":
      return "#F59E0B";
    case "rate_limited":
      return "#F97316";
    case "invalid_credentials":
      return "#EF4444";
    case "provider_unavailable":
    default:
      return "#A78BFA";
  }
}

export function formatAvailabilityLabel(
  availability: DataProviderAvailability
): string {
  return availability
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
