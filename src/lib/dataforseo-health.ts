import {
  type DataProviderAvailability,
  type DataProviderFeature,
  getDataProviderUnavailableMessage,
} from "@/lib/data-provider";
import {
  DataForSeoRequestError,
  fetchDataForSeoJson,
  fetchDataForSeoUserData,
  getDataForSeoCredentialMeta,
  hasDataForSeoCredentials,
} from "@/lib/dataforseo";

type ProbeKey = "auth" | "keywords" | "backlinks" | "competitors" | "rankings";

export type DataForSeoProbe = {
  key: ProbeKey;
  feature: DataProviderFeature;
  availability: DataProviderAvailability;
  checkedAt: string;
  message: string;
  adminMessage: string;
  httpStatus: number | null;
  dataforseoStatusCode: number | null;
  rawMessage: string | null;
};

export type DataForSeoHealthReport = {
  checkedAt: string;
  env: {
    loginConfigured: boolean;
    passwordConfigured: boolean;
    configuredLoginMask: string | null;
    loginHadWrappingQuotes: boolean;
    passwordHadWrappingQuotes: boolean;
  };
  account: {
    providerLoginMask: string | null;
    backlinksSubscriptionExpiryDate: string | null;
  };
  probes: Record<ProbeKey, DataForSeoProbe>;
};

function maskValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length <= 4) return "*".repeat(trimmed.length);
  return `${trimmed.slice(0, 2)}***${trimmed.slice(-2)}`;
}

function okProbe(
  key: ProbeKey,
  feature: DataProviderFeature,
  checkedAt: string,
  message: string
): DataForSeoProbe {
  return {
    key,
    feature,
    availability: "ok",
    checkedAt,
    message,
    adminMessage: message,
    httpStatus: 200,
    dataforseoStatusCode: 20000,
    rawMessage: null,
  };
}

function errorProbe(
  key: ProbeKey,
  feature: DataProviderFeature,
  checkedAt: string,
  error: DataForSeoRequestError | { availability: Exclude<DataProviderAvailability, "ok">; message: string; rawMessage?: string | null }
): DataForSeoProbe {
  if (error instanceof DataForSeoRequestError) {
    return {
      key,
      feature,
      availability: error.availability,
      checkedAt,
      message: getDataProviderUnavailableMessage(feature),
      adminMessage: error.message,
      httpStatus: error.httpStatus || null,
      dataforseoStatusCode: error.dataforseoStatusCode,
      rawMessage: error.rawMessage,
    };
  }

  return {
    key,
    feature,
    availability: error.availability,
    checkedAt,
    message: getDataProviderUnavailableMessage(feature),
    adminMessage: error.message,
    httpStatus: null,
    dataforseoStatusCode: null,
    rawMessage: error.rawMessage ?? null,
  };
}

async function probeKeywordIdeas(checkedAt: string): Promise<DataForSeoProbe> {
  try {
    await fetchDataForSeoJson({
      feature: "keywords",
      url: "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live",
      method: "POST",
      body: [
        {
          keywords: ["rankypulse"],
          language_code: "en",
          location_code: 2840,
          limit: 1,
          order_by: ["search_volume,desc"],
        },
      ],
    });
    return okProbe("keywords", "keywords", checkedAt, "Keyword ideas endpoint responded successfully.");
  } catch (error) {
    return errorProbe("keywords", "keywords", checkedAt, error as DataForSeoRequestError);
  }
}

async function probeRankings(checkedAt: string): Promise<DataForSeoProbe> {
  try {
    await fetchDataForSeoJson({
      feature: "rankings",
      url: "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
      method: "POST",
      body: [
        {
          keyword: "rankypulse",
          language_code: "en",
          location_code: 2840,
          device: "desktop",
          depth: 10,
        },
      ],
    });
    return okProbe("rankings", "rankings", checkedAt, "Ranking SERP endpoint responded successfully.");
  } catch (error) {
    return errorProbe("rankings", "rankings", checkedAt, error as DataForSeoRequestError);
  }
}

async function probeBacklinks(
  checkedAt: string,
  backlinksSubscriptionExpiryDate: string | null
): Promise<DataForSeoProbe> {
  if (!backlinksSubscriptionExpiryDate) {
    return errorProbe("backlinks", "backlinks", checkedAt, {
      availability: "missing_capability",
      message: "Backlinks subscription is not active for this DataForSEO account.",
    });
  }

  try {
    await fetchDataForSeoJson({
      feature: "backlinks",
      url: "https://api.dataforseo.com/v3/backlinks/summary/live",
      method: "POST",
      body: [{ target: "rankypulse.com", include_subdomains: true }],
    });
    return okProbe("backlinks", "backlinks", checkedAt, "Backlinks endpoint responded successfully.");
  } catch (error) {
    return errorProbe("backlinks", "backlinks", checkedAt, error as DataForSeoRequestError);
  }
}

async function probeCompetitors(checkedAt: string): Promise<DataForSeoProbe> {
  try {
    await fetchDataForSeoJson({
      feature: "competitors",
      url: "https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live",
      method: "POST",
      body: [
        {
          target: "rankypulse.com",
          location_code: 2840,
          language_code: "en",
          limit: 1,
          exclude_top_domains: false,
        },
      ],
    });
    return okProbe("competitors", "competitors", checkedAt, "Competitor discovery endpoint responded successfully.");
  } catch (error) {
    return errorProbe("competitors", "competitors", checkedAt, error as DataForSeoRequestError);
  }
}

export async function getDataForSeoHealthReport(): Promise<DataForSeoHealthReport> {
  const checkedAt = new Date().toISOString();
  const credentials = getDataForSeoCredentialMeta();

  const baseReport: DataForSeoHealthReport = {
    checkedAt,
    env: {
      loginConfigured: Boolean(credentials.login),
      passwordConfigured: Boolean(credentials.password),
      configuredLoginMask: maskValue(credentials.login),
      loginHadWrappingQuotes: credentials.loginHadWrappingQuotes,
      passwordHadWrappingQuotes: credentials.passwordHadWrappingQuotes,
    },
    account: {
      providerLoginMask: null,
      backlinksSubscriptionExpiryDate: null,
    },
    probes: {
      auth: {
        key: "auth",
        feature: "auth",
        availability: "provider_unavailable",
        checkedAt,
        message: getDataProviderUnavailableMessage("auth"),
        adminMessage: "Auth probe has not run yet.",
        httpStatus: null,
        dataforseoStatusCode: null,
        rawMessage: null,
      },
      keywords: {
        key: "keywords",
        feature: "keywords",
        availability: "provider_unavailable",
        checkedAt,
        message: getDataProviderUnavailableMessage("keywords"),
        adminMessage: "Keyword ideas probe has not run yet.",
        httpStatus: null,
        dataforseoStatusCode: null,
        rawMessage: null,
      },
      backlinks: {
        key: "backlinks",
        feature: "backlinks",
        availability: "provider_unavailable",
        checkedAt,
        message: getDataProviderUnavailableMessage("backlinks"),
        adminMessage: "Backlinks probe has not run yet.",
        httpStatus: null,
        dataforseoStatusCode: null,
        rawMessage: null,
      },
      competitors: {
        key: "competitors",
        feature: "competitors",
        availability: "provider_unavailable",
        checkedAt,
        message: getDataProviderUnavailableMessage("competitors"),
        adminMessage: "Competitor discovery probe has not run yet.",
        httpStatus: null,
        dataforseoStatusCode: null,
        rawMessage: null,
      },
      rankings: {
        key: "rankings",
        feature: "rankings",
        availability: "provider_unavailable",
        checkedAt,
        message: getDataProviderUnavailableMessage("rankings"),
        adminMessage: "Rankings probe has not run yet.",
        httpStatus: null,
        dataforseoStatusCode: null,
        rawMessage: null,
      },
    },
  };

  if (!hasDataForSeoCredentials()) {
    const missingCreds = errorProbe("auth", "auth", checkedAt, {
      availability: "invalid_credentials",
      message: "DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD is missing in the runtime environment.",
    });
    return {
      ...baseReport,
      probes: {
        auth: missingCreds,
        keywords: errorProbe("keywords", "keywords", checkedAt, {
          availability: "invalid_credentials",
          message: "Skipped keyword ideas probe because credentials are missing.",
        }),
        backlinks: errorProbe("backlinks", "backlinks", checkedAt, {
          availability: "invalid_credentials",
          message: "Skipped backlinks probe because credentials are missing.",
        }),
        competitors: errorProbe("competitors", "competitors", checkedAt, {
          availability: "invalid_credentials",
          message: "Skipped competitor probe because credentials are missing.",
        }),
        rankings: errorProbe("rankings", "rankings", checkedAt, {
          availability: "invalid_credentials",
          message: "Skipped rankings probe because credentials are missing.",
        }),
      },
    };
  }

  try {
    const userData = await fetchDataForSeoUserData();
    const account = userData.tasks?.[0]?.result?.[0];
    const backlinksSubscriptionExpiryDate =
      account?.backlinks_subscription_expiry_date ?? null;

    const authProbe = okProbe(
      "auth",
      "auth",
      checkedAt,
      "Credentials authenticated successfully against appendix/user_data."
    );

    const [keywords, rankings, backlinks, competitors] = await Promise.all([
      probeKeywordIdeas(checkedAt),
      probeRankings(checkedAt),
      probeBacklinks(checkedAt, backlinksSubscriptionExpiryDate),
      probeCompetitors(checkedAt),
    ]);

    return {
      ...baseReport,
      account: {
        providerLoginMask: maskValue(account?.login ?? null),
        backlinksSubscriptionExpiryDate,
      },
      probes: {
        auth: authProbe,
        keywords,
        backlinks,
        competitors,
        rankings,
      },
    };
  } catch (error) {
    const authProbe = errorProbe(
      "auth",
      "auth",
      checkedAt,
      error as DataForSeoRequestError
    );
    const inheritedAvailability =
      authProbe.availability === "ok"
        ? "provider_unavailable"
        : authProbe.availability;

    return {
      ...baseReport,
      probes: {
        auth: authProbe,
        keywords: errorProbe("keywords", "keywords", checkedAt, {
          availability: inheritedAvailability,
          message: "Skipped keyword ideas probe because auth verification failed.",
        }),
        backlinks: errorProbe("backlinks", "backlinks", checkedAt, {
          availability: inheritedAvailability,
          message: "Skipped backlinks probe because auth verification failed.",
        }),
        competitors: errorProbe("competitors", "competitors", checkedAt, {
          availability: inheritedAvailability,
          message: "Skipped competitor probe because auth verification failed.",
        }),
        rankings: errorProbe("rankings", "rankings", checkedAt, {
          availability: inheritedAvailability,
          message: "Skipped rankings probe because auth verification failed.",
        }),
      },
    };
  }
}
