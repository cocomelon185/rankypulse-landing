import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const domain = req.nextUrl.searchParams.get("domain") || "rankypulse.com";

    // TODO: Replace mock data with actual Supabase queries
    // For now, return the same structure as the hardcoded constants in DashboardClient

    const metrics = {
      spark: {
        seo: [68, 72, 70, 75, 78, 80, 92],
        traffic: [120, 135, 128, 148, 160, 172, 187],
        keywords: [13200, 13400, 13100, 12900, 12700, 12500, 12450],
        backlinks: [3300, 3420, 3500, 3600, 3700, 3820, 3892],
      },
      kpis: [
        {
          label: "Organic Traffic",
          value: "187.3K",
          suffix: "",
          delta: "+12.8%",
          context: "Last 30 days",
          trend: "up" as const,
          sparkKey: "traffic",
          deltaColor: "#00C853",
        },
        {
          label: "Keywords Ranking",
          value: "12,450",
          suffix: "",
          delta: "+340",
          context: "in top 100",
          trend: "up" as const,
          sparkKey: "keywords",
          deltaColor: "#00C853",
        },
        {
          label: "Indexed Pages",
          value: "324",
          suffix: "",
          delta: "+18",
          context: "total pages",
          trend: "up" as const,
          sparkKey: "seo",
          deltaColor: "#00C853",
        },
        {
          label: "Backlinks",
          value: "3,892",
          suffix: "",
          delta: "+6.4%",
          context: "referring domains",
          trend: "up" as const,
          sparkKey: "backlinks",
          deltaColor: "#00C853",
        },
      ],
      trafficData: [
        { month: "Oct", organic: 141, paid: 14, direct: 28 },
        { month: "Nov", organic: 155, paid: 18, direct: 31 },
        { month: "Dec", organic: 148, paid: 22, direct: 27 },
        { month: "Jan", organic: 162, paid: 25, direct: 34 },
        { month: "Feb", organic: 170, paid: 21, direct: 36 },
        { month: "Mar", organic: 180, paid: 28, direct: 39 },
        { month: "Apr", organic: 187, paid: 30, direct: 42 },
      ],
      rankingsData: [
        { month: "Jan", top3: 18, top10: 42, top100: 95 },
        { month: "Feb", top3: 22, top10: 50, top100: 108 },
        { month: "Mar", top3: 28, top10: 58, top100: 120 },
        { month: "Apr", top3: 32, top10: 68, top100: 135 },
        { month: "May", top3: 35, top10: 75, top100: 145 },
        { month: "Jun", top3: 38, top10: 82, top100: 158 },
      ],
      healthTrend: [
        { month: "Jan", score: 72 },
        { month: "Feb", score: 75 },
        { month: "Mar", score: 80 },
        { month: "Apr", score: 82 },
        { month: "May", score: 85 },
        { month: "Jun", score: 88 },
      ],
      errorsTrend: [
        { month: "Jan", count: 128 },
        { month: "Feb", count: 115 },
        { month: "Mar", count: 98 },
        { month: "Apr", count: 87 },
        { month: "May", count: 72 },
        { month: "Jun", count: 58 },
      ],
      crawlTrend: [
        { month: "Jan", pages: 285 },
        { month: "Feb", pages: 291 },
        { month: "Mar", pages: 305 },
        { month: "Apr", pages: 312 },
        { month: "May", pages: 318 },
        { month: "Jun", pages: 324 },
      ],
      crawlDistribution: [
        { name: "Healthy", value: 287, color: "#00C853" },
        { name: "Broken", value: 18, color: "#FF3D3D" },
        { name: "Redirects", value: 12, color: "#FF9800" },
        { name: "Blocked", value: 7, color: "#C8D0E0" },
      ],
      recentAudits: [
        {
          domain: domain,
          date: "2 hours ago",
          issuesFound: 16,
          status: "complete",
          pages: 324,
          score: 88,
        },
        {
          domain: domain,
          date: "2 days ago",
          issuesFound: 22,
          status: "complete",
          pages: 312,
          score: 82,
        },
        {
          domain: domain,
          date: "7 days ago",
          issuesFound: 34,
          status: "complete",
          pages: 305,
          score: 75,
        },
      ],
      competitors: [
        { domain: "ahrefs.com", traffic: "5.2M", keywords: "142K", score: 98 },
        { domain: "semrush.com", traffic: "3.8M", keywords: "98K", score: 96 },
        { domain: "ahrefs.com", traffic: "2.8M", keywords: "218K", score: 94 },
      ],
      keywordDist: [
        { range: "Top 3", keywords: 38, color: "#FF642D" },
        { range: "Top 10", keywords: 82, color: "#7B5CF5" },
        { range: "Top 100", keywords: 158, color: "#1E4D8C" },
      ],
      priorityIssues: [
        {
          rank: 1,
          label: "Missing Meta Descriptions",
          pages: 25,
          impact: "high",
          action: "Fix Now",
          actionHref: "/audits/issues",
          gain: "+3–5 ranking positions",
        },
        {
          rank: 2,
          label: "Broken Internal Links",
          pages: 12,
          impact: "high",
          action: "View URLs",
          actionHref: "/audits/links",
          gain: "+2–4 authority pages",
        },
        {
          rank: 3,
          label: "Large Images Slowing Pages",
          pages: 18,
          impact: "medium",
          action: "Optimize",
          actionHref: "/audits/speed",
          gain: null,
        },
        {
          rank: 4,
          label: "Duplicate Title Tags",
          pages: 8,
          impact: "medium",
          action: "Fix Now",
          actionHref: "/audits/issues",
          gain: null,
        },
        {
          rank: 5,
          label: "Images Missing Alt Text",
          pages: 34,
          impact: "low",
          action: "Fix Now",
          actionHref: "/audits/issues",
          gain: null,
        },
      ],
      projectDomains: ["rankypulse.com", "clientsite.io", "newproject.com"],
      currentDomain: domain,
    };

    return NextResponse.json(metrics);
  } catch (err) {
    console.error("Error fetching dashboard metrics:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
