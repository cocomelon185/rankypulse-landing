import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const domain = req.nextUrl.searchParams.get("domain") || "rankypulse.com";

    const metrics = await getDashboardData(session.user.id, domain);

    return NextResponse.json(metrics);
  } catch (err) {
    console.error("Error fetching dashboard metrics:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
