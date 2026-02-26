import { ImageResponse } from "next/og";

const OG_PAGES: Record<
  string,
  { title: string; subtitle: string; alt: string }
> = {
  home: {
    title: "Instant SEO Audit & Fix List",
    subtitle: "Score + fixes in minutes. Free to start.",
    alt: "RankyPulse — Instant SEO Audit",
  },
  pricing: {
    title: "Pricing — Plans for Founders & Agencies",
    subtitle: "Free audits, saved reports, ongoing score tracking.",
    alt: "RankyPulse — Pricing",
  },
  audit: {
    title: "Run a Free SEO Audit",
    subtitle: "Enter your URL. Get a score and actionable fixes.",
    alt: "RankyPulse — Audit",
  },
  signin: {
    title: "Sign In",
    subtitle: "Access saved audits and your dashboard.",
    alt: "RankyPulse — Sign In",
  },
  signup: {
    title: "Create Account",
    subtitle: "Save audits, track scores, unlock your dashboard.",
    alt: "RankyPulse — Sign Up",
  },
  "forgot-password": {
    title: "Reset Password",
    subtitle: "Regain access to your RankyPulse account.",
    alt: "RankyPulse — Reset Password",
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Track scores, view history, manage sites.",
    alt: "RankyPulse — Dashboard",
  },
  results: {
    title: "Audit Results",
    subtitle: "Prioritized issues and clear fixes.",
    alt: "RankyPulse — Audit Results",
  },
  about: {
    title: "About RankyPulse",
    subtitle: "Fix SEO issues in minutes, not weeks.",
    alt: "RankyPulse — About",
  },
  growth: {
    title: "Growth Features",
    subtitle: "Monitor rankings and discoverability trends.",
    alt: "RankyPulse — Growth",
  },
  discoverability: {
    title: "Discoverability",
    subtitle: "Track how findable your site is.",
    alt: "RankyPulse — Discoverability",
  },
  competitors: {
    title: "Competitors",
    subtitle: "See why they outrank you.",
    alt: "RankyPulse — Competitors",
  },
  "action-plan": {
    title: "Action Plan",
    subtitle: "Prioritized next steps for your SEO.",
    alt: "RankyPulse — Action Plan",
  },
};

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = OG_PAGES[slug.toLowerCase()] ?? OG_PAGES.home;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f6f8fb 0%, #e9ecf5 50%, #f0f4ff 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#1B2559",
            marginBottom: 12,
          }}
        >
          RankyPulse
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#4318ff",
            marginBottom: 16,
          }}
        >
          {page.title}
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#64748b",
          }}
        >
          {page.subtitle}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}
