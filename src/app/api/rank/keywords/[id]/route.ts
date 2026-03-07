import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// DELETE /api/rank/keywords/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  // Verify ownership before deletion
  const { data: kw } = await supabaseAdmin
    .from("rank_keywords")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!kw) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Cascade deletes rank_history via FK
  const { error } = await supabaseAdmin
    .from("rank_keywords")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
