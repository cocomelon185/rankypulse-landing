import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * POST /api/gsc/performance
 * Body: { siteUrl: string, startDate: string, endDate: string, dimensions?: string[] }
 * Returns click/impression/position data from Google Search Console Search Analytics.
 */
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const accessToken = token?.gscAccessToken;

    if (!accessToken) {
        return NextResponse.json(
            {
                error: "no_gsc_token",
                message:
                    "No Google Search Console token found. Please sign in with Google and grant GSC access.",
            },
            { status: 403 }
        );
    }

    let body: {
        siteUrl: string;
        startDate?: string;
        endDate?: string;
        dimensions?: string[];
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.siteUrl) {
        return NextResponse.json({ error: "siteUrl is required" }, { status: 400 });
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = body.startDate ?? thirtyDaysAgo.toISOString().split("T")[0];
    const endDate = body.endDate ?? today.toISOString().split("T")[0];
    const dimensions = body.dimensions ?? ["query", "page"];

    const encodedUrl = encodeURIComponent(body.siteUrl);
    const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodedUrl}/searchAnalytics/query`;

    try {
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                startDate,
                endDate,
                dimensions,
                rowLimit: 100,
                startRow: 0,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: "gsc_api_error", details: err },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (e) {
        console.error("[GSC /performance] error:", e);
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
}
