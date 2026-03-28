import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin-access";
import { getDataForSeoHealthReport } from "@/lib/dataforseo-health";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const report = await getDataForSeoHealthReport();
  return NextResponse.json(report);
}
