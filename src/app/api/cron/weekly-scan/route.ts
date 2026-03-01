import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { WeeklyReportTemplate } from "@/emails/WeeklyReportTemplate";

export const runtime = "edge";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
    // 1. Verify Vercel Cron Secret
    // Vercel officially requires checking the Authorization header for CRON_SECRET
    if (
        process.env.CRON_SECRET &&
        req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 2. Fetch all saved domains that haven't been scanned in the last 6 days
        // In a real app, you might want to chunk this, but for now we'll do 100 at a time.
        const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();

        const { data: savedDomains, error } = await supabaseAdmin
            .from("saved_domains")
            .select(`
        id,
        domain,
        last_score,
        user_id,
        users (
          email,
          name
        )
      `)
            .or(`last_scanned_at.lt.${sixDaysAgo},last_scanned_at.is.null`)
            .limit(50);

        if (error) {
            console.error("Supabase Error:", error);
            return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 });
        }

        if (!savedDomains || savedDomains.length === 0) {
            return NextResponse.json({ message: "No domains due for scanning." });
        }

        const results = [];

        // 3. Process each domain
        for (const record of savedDomains) {
            const usersVal = record.users as any;
            const userObj = Array.isArray(usersVal) ? usersVal[0] : usersVal;
            if (!userObj || !userObj.email) continue;

            const domain = record.domain;
            const userEmail = userObj.email;
            const userName = userObj.name || "There";
            const previousScore = record.last_score || 0;

            // Make a request to our internal crawl API
            // Since we are in Edge/Serverless, we call our absolute URL (or duplicate the logic).
            // For simplicity in a Cron, duplicating the PSI/HTML logic is safer,
            // but to adhere to DRY, let's call the /api/crawl endpoint.
            const protocol = req.headers.get("x-forwarded-proto") || "http";
            const host = req.headers.get("host");
            const crawlUrl = `${protocol}://${host}/api/crawl?domain=${domain}`;

            try {
                const crawlRes = await fetch(crawlUrl);
                if (!crawlRes.ok) continue;

                const auditData = await crawlRes.json();
                const currentScore = auditData.score;

                if (typeof currentScore !== 'number') continue;

                // 4. Update the database with the new score
                await supabaseAdmin
                    .from("saved_domains")
                    .update({
                        last_score: currentScore,
                        previous_score: previousScore,
                        last_scanned_at: new Date().toISOString()
                    })
                    .eq("id", record.id);

                // 5. Send the Email via Resend
                if (process.env.RESEND_API_KEY) {
                    await resend.emails.send({
                        from: "RankyPulse <reports@rankypulse.com>",
                        to: userEmail,
                        subject: `Your Weekly SEO Score: ${currentScore}/100 (${domain})`,
                        react: WeeklyReportTemplate({
                            domain,
                            currentScore,
                            previousScore,
                            userName,
                        }),
                    });
                }

                results.push({ domain, success: true, emailSent: !!process.env.RESEND_API_KEY });
            } catch (err) {
                console.error(`Failed processing ${domain}:`, err);
                results.push({ domain, success: false });
            }
        }

        return NextResponse.json({
            message: "Weekly scan completed",
            processed: results.length,
            results,
        });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
