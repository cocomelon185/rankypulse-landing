import type {
  DataProviderAvailability,
  DataProviderFeature,
} from "@/lib/data-provider";

type DataForSeoTask = {
  status_code?: number;
  status_message?: string;
  result?: unknown[];
};

type DataForSeoEnvelope = {
  status_code?: number;
  status_message?: string;
  tasks?: DataForSeoTask[];
};

export class DataForSeoRequestError extends Error {
  feature: DataProviderFeature;
  availability: Exclude<DataProviderAvailability, "ok">;
  httpStatus: number;
  dataforseoStatusCode: number | null;
  rawMessage: string | null;

  constructor(params: {
    feature: DataProviderFeature;
    availability: Exclude<DataProviderAvailability, "ok">;
    message: string;
    httpStatus: number;
    dataforseoStatusCode?: number | null;
    rawMessage?: string | null;
  }) {
    super(params.message);
    this.name = "DataForSeoRequestError";
    this.feature = params.feature;
    this.availability = params.availability;
    this.httpStatus = params.httpStatus;
    this.dataforseoStatusCode = params.dataforseoStatusCode ?? null;
    this.rawMessage = params.rawMessage ?? null;
  }
}

function unwrapQuotedEnv(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getRawEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return "";
}

export function getDataForSeoCredentialMeta(): {
  login: string;
  password: string;
  loginHadWrappingQuotes: boolean;
  passwordHadWrappingQuotes: boolean;
} {
  const rawLogin = getRawEnv(
    "DATAFORSEO_LOGIN",
    "DATAFORSEO_EMAIL",
    "DATAFORSEO_USERNAME"
  );
  const rawPassword = getRawEnv(
    "DATAFORSEO_PASSWORD",
    "DATAFORSEO_API_PASSWORD",
    "DATAFORSEO_API_KEY"
  );

  const login = unwrapQuotedEnv(rawLogin);
  const password = unwrapQuotedEnv(rawPassword);

  return {
    login,
    password,
    loginHadWrappingQuotes: rawLogin.trim() !== login && rawLogin.trim().length > 0,
    passwordHadWrappingQuotes:
      rawPassword.trim() !== password && rawPassword.trim().length > 0,
  };
}

export function getDataForSeoCredentials(): { login: string; password: string } {
  const { login, password } = getDataForSeoCredentialMeta();
  return { login, password };
}

export function hasDataForSeoCredentials(): boolean {
  const { login, password } = getDataForSeoCredentials();
  return Boolean(login && password);
}

export function getDataForSeoHeaders(): HeadersInit {
  const { login, password } = getDataForSeoCredentials();
  const token = Buffer.from(`${login}:${password}`).toString("base64");

  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  };
}

function getEnvelope(payload: unknown): DataForSeoEnvelope | null {
  if (!payload || typeof payload !== "object") return null;
  return payload as DataForSeoEnvelope;
}

function getTask(payload: unknown): DataForSeoTask | null {
  return getEnvelope(payload)?.tasks?.[0] ?? null;
}

function extractStatusMessage(payload: unknown): string | null {
  const envelope = getEnvelope(payload);
  const task = getTask(payload);
  const messages = [task?.status_message, envelope?.status_message].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );
  return messages[0] ?? null;
}

function extractStatusCode(payload: unknown): number | null {
  const envelope = getEnvelope(payload);
  const task = getTask(payload);
  if (typeof task?.status_code === "number") return task.status_code;
  if (typeof envelope?.status_code === "number") return envelope.status_code;
  return null;
}

function isSuccessPayload(payload: unknown): boolean {
  const envelopeCode = getEnvelope(payload)?.status_code;
  const taskCode = getTask(payload)?.status_code;

  const envelopeOk =
    envelopeCode === undefined || envelopeCode === null || envelopeCode === 20000;
  const taskOk = taskCode === undefined || taskCode === null || taskCode === 20000;

  return envelopeOk && taskOk;
}

function classifyFailure(params: {
  feature: DataProviderFeature;
  httpStatus: number;
  payload: unknown;
  fallbackMessage: string;
}): Exclude<DataProviderAvailability, "ok"> {
  const { feature, httpStatus, payload, fallbackMessage } = params;
  const rawMessage = `${extractStatusMessage(payload) ?? ""} ${fallbackMessage}`.toLowerCase();

  if (
    httpStatus === 429 ||
    rawMessage.includes("rate limit") ||
    rawMessage.includes("too many requests") ||
    rawMessage.includes("limit exceeded")
  ) {
    return "rate_limited";
  }

  if (
    httpStatus === 401 ||
    rawMessage.includes("credentials") ||
    rawMessage.includes("authorization") ||
    rawMessage.includes("unauthorized") ||
    rawMessage.includes("login") ||
    rawMessage.includes("password")
  ) {
    return "invalid_credentials";
  }

  if (
    rawMessage.includes("subscription") ||
    rawMessage.includes("not allowed") ||
    rawMessage.includes("not available") ||
    rawMessage.includes("insufficient") ||
    (feature === "competitors" && rawMessage.includes("labs"))
  ) {
    return "missing_capability";
  }

  if (httpStatus === 403) {
    return feature === "competitors" ? "missing_capability" : "invalid_credentials";
  }

  return "provider_unavailable";
}

export function getDataForSeoError(status: number): string {
  if (status === 401 || status === 403) {
    return "Automatic data provider access is temporarily unavailable.";
  }
  if (status === 429) {
    return "Automatic data provider is busy right now.";
  }

  return `DataForSEO error: ${status}`;
}

export async function fetchDataForSeoJson<T>(params: {
  feature: DataProviderFeature;
  url: string;
  method?: "GET" | "POST";
  body?: unknown;
}): Promise<T> {
  const { feature, url, method = "GET", body } = params;

  if (!hasDataForSeoCredentials()) {
    throw new DataForSeoRequestError({
      feature,
      availability: "invalid_credentials",
      message: "DataForSEO credentials are not configured.",
      httpStatus: 0,
    });
  }

  const response = await fetch(url, {
    method,
    headers: getDataForSeoHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !isSuccessPayload(payload)) {
    const message =
      extractStatusMessage(payload) ?? getDataForSeoError(response.status || 500);
    throw new DataForSeoRequestError({
      feature,
      availability: classifyFailure({
        feature,
        httpStatus: response.status,
        payload,
        fallbackMessage: message,
      }),
      message,
      httpStatus: response.status,
      dataforseoStatusCode: extractStatusCode(payload),
      rawMessage: extractStatusMessage(payload),
    });
  }

  return payload as T;
}

export type DataForSeoUserDataResponse = {
  tasks?: Array<{
    result?: Array<{
      login?: string;
      funds?: number;
      backlinks_subscription_expiry_date?: string | null;
      rates?: unknown;
    }>;
  }>;
};

export async function fetchDataForSeoUserData(): Promise<DataForSeoUserDataResponse> {
  return fetchDataForSeoJson<DataForSeoUserDataResponse>({
    feature: "auth",
    url: "https://api.dataforseo.com/v3/appendix/user_data",
  });
}
