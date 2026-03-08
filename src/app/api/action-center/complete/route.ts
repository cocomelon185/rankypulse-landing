import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/action-center/complete
 * Persist task completion status to the database.
 * Body: { issueId: string, domain: string, status: "done" | "todo" }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { issueId, domain, status } = body as {
      issueId: string;
      domain: string;
      status: "done" | "todo";
    };

    if (!issueId || !domain || !status) {
      return NextResponse.json(
        { error: "Missing required fields: issueId, domain, status" },
        { status: 400 }
      );
    }

    if (status === "done") {
      // Upsert: mark as done
      const { error } = await supabaseAdmin
        .from("task_completions")
        .upsert(
          {
            user_id: userId,
            domain,
            issue_id: issueId,
            status: "done",
            marked_at: new Date().toISOString(),
          },
          { onConflict: "user_id,domain,issue_id" }
        );

      if (error) {
        console.error("[ActionCenter/complete] Upsert error:", error);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
      }

      // Log activity event
      await supabaseAdmin.from("activity_events").insert({
        user_id: userId,
        type: "task_completed",
        domain,
        meta: { issue_id: issueId },
      });
    } else {
      // Remove completion (undo)
      const { error } = await supabaseAdmin
        .from("task_completions")
        .delete()
        .eq("user_id", userId)
        .eq("domain", domain)
        .eq("issue_id", issueId);

      if (error) {
        console.error("[ActionCenter/complete] Delete error:", error);
        return NextResponse.json({ error: "Failed to undo" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, issueId, domain, status });
  } catch (error) {
    console.error("[ActionCenter/complete] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
