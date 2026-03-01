import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * GET /api/gsc/sites
 * Returns the list of Google Search Console properties for the signed-in user.
 * Requires the user to have signed in with Google (GSC scope).
 */
export async function GET(req: NextRequest) {
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

    try {
        const res = await fetch(
            "https://www.googleapis.com/webmasters/v3/sites",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                },
            }
        );

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
        console.error("[GSC /sites] error:", e);
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
}
