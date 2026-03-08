import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * PATCH /api/opportunities/[id]
 * Update the status of an opportunity (dismiss / complete / reopen).
 * Body: { status: "open" | "dismissed" | "completed" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { status } = body;
  if (!status || !["open", "dismissed", "completed"].includes(status)) {
    return NextResponse.json(
      { error: "status must be one of: open, dismissed, completed" },
      { status: 400 }
    );
  }

  // Verify ownership + update
  const { data, error } = await supabaseAdmin
    .from("seo_opportunities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)  // ownership check
    .select("id, status")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Opportunity not found or update failed" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, id: data.id, status: data.status });
}
