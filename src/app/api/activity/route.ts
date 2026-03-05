import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/activity
 * Returns the 20 most recent activity_events for the authenticated user.
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: events, error } = await supabaseAdmin
        .from("activity_events")
        .select("id, type, domain, meta, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        // Gracefully return empty list if table doesn't exist yet
        console.warn("[activity] query error:", error.message);
        return NextResponse.json({ events: [] });
    }

    return NextResponse.json({ events: events ?? [] });
}
