import { NextResponse } from "next/server";
import fs from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
    const log = (msg: string) => {
        try { fs.appendFileSync('api-debug.log', new Date().toISOString() + ': ' + msg + '\n'); } catch (e) { }
    };

    log("API /audits/data hit!");
    const session = await getServerSession(authOptions);
    log("API /audits/data session: " + session?.user?.id);
    if (!session?.user?.id) {
        log("Unauthorized");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'issues', 'speed', 'vitals', or 'links'
    const domain = searchParams.get("domain");
    log(`API /audits/data type=${type}, domain=${domain}`);

    try {
        // 1. Authenticate user and get their authorized crawl_job
        let jobQuery = supabaseAdmin
            .from("crawl_jobs")
            .select("id, domain")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (domain) {
            jobQuery = jobQuery.eq("domain", domain);
        }

        const { data: jobData, error: jobError } = await jobQuery;

        log("API /audits/data jobData length: " + jobData?.length + " error: " + jobError);

        if (jobError) throw jobError;
        if (!jobData || jobData.length === 0) {
            log("API /audits/data returning empty array because no jobData found");
            return NextResponse.json([]); // No authorized data found
        }

        const jobId = jobData[0].id;
        const jobDomain = jobData[0].domain;

        // 2. Fetch the corresponding granular data
        if (type === "issues" || type === "speed" || type === "vitals") {
            const { data, error } = await supabaseAdmin
                .from("audit_pages")
                .select(type === "issues" ? "issues, score, url" : "metadata, url")
                .eq("job_id", jobId)
                .order("created_at", { ascending: false })
                .limit(1);

            log("API /audits/data audit_pages returned length: " + data?.length + " for job_id: " + jobId);

            if (error) throw error;
            return NextResponse.json({ data, hostname: jobDomain });
        } else if (type === "links") {
            const { data: queueData, error: queueError } = await supabaseAdmin
                .from('crawl_queue')
                .select('url, status')
                .eq('job_id', jobId)
                .limit(200);

            if (queueError) throw queueError;
            return NextResponse.json({ job: jobData[0], queue: queueData, hostname: jobDomain });
        }

        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });

    } catch (error: any) {
        console.error("API /audits/data error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
