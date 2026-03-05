"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { CrawlIssuesDashboard, type CrawlPageIssue } from "./CrawlIssuesDashboard";
import { setActiveAudit } from "@/lib/audit-context";

interface LogEntry {
    url: string;
    status: "pending" | "success" | "error";
    score: number;
    issuesFound: number;
    issues?: CrawlPageIssue[];
}

export function FullAuditProgress({ domain }: { domain: string }) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const [jobId, setJobId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [crawled, setCrawled] = useState(0);
    const [isCrawling, setIsCrawling] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [errorMsg, setErrorMsg] = useState("");

    const crawlRef = useRef(false);

    const startCrawl = async () => {
        if (!isAuthenticated) {
            window.location.href = `/auth/signin?callbackUrl=/report/${domain}`;
            return;
        }

        try {
            setIsCrawling(true);
            setErrorMsg("");
            const res = await fetch("/api/crawl/full/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain, plan: "free" }), // Replace with actual plan logic if needed
            });
            if (!res.ok) throw new Error("Failed to start crawl");
            const data = await res.json();
            setJobId(data.jobId);
            // Persist auditId + domain so all pages know the active full audit
            setActiveAudit(data.jobId, domain);
            crawlRef.current = true;
            runNextLoop(data.jobId);
        } catch (e: any) {
            setErrorMsg(e.message);
            setIsCrawling(false);
        }
    };

    const runNextLoop = async (id: string) => {
        if (!crawlRef.current) return;

        try {
            const res = await fetch(`/api/crawl/full/next?job_id=${id}`);
            if (!res.ok) {
                throw new Error("Crawl chunk failed");
            }
            const data = await res.json();

            if (data.url) {
                setLogs((prev) => [
                    {
                        url: data.url,
                        status: "success",
                        score: data.score || 0,
                        issuesFound: data.issuesFound || 0,
                        issues: data.issues
                    },
                    ...prev.slice(0, 9), // Keep last 10 logs
                ]);
            }

            setProgress(data.progress || 0);
            setCrawled(data.crawled || 0);

            if (data.done) {
                setIsCrawling(false);
                setIsCompleted(true);
                crawlRef.current = false;
                // Navigate to the audit overview for this specific job
                if (id) {
                    router.push(`/audits/${id}/overview`);
                }
                return;
            }

            // Polite delay between requests
            setTimeout(() => runNextLoop(id), 1000);

        } catch (e: any) {
            // Pause on error
            setIsCrawling(false);
            crawlRef.current = false;
            setErrorMsg("Connection interrupted. You can resume.");
        }
    };

    const resumeCrawl = () => {
        if (!jobId) return;
        setIsCrawling(true);
        setErrorMsg("");
        crawlRef.current = true;
        runNextLoop(jobId);
    };

    const stopCrawl = () => {
        setIsCrawling(false);
        crawlRef.current = false;
    };

    if (!jobId && !isCrawling && !isCompleted) {
        return (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-sm">
                <h3 className="font-['DM_Sans'] font-semibold text-lg text-[var(--text-primary)]">
                    Full-Site Background Audit (Pro Feature)
                </h3>
                <p className="font-['DM_Sans'] text-sm text-[var(--text-secondary)] mt-1 mb-4">
                    Crawl up to 200 pages on your site to find deep broken links, duplicate content, and orphaned pages.
                </p>
                <button
                    onClick={startCrawl}
                    className="rounded-lg bg-[var(--accents-indigo)] px-5 py-2.5 font-['DM_Sans'] text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                    {isAuthenticated ? "Start Deep Crawl" : "Sign in to Start"}
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-['DM_Sans'] font-semibold text-lg text-white">
                    Deep Site Crawl in Progress
                </h3>
                {isCompleted && <span className="text-emerald-400 text-sm font-bold">Completed</span>}
                {isCrawling && <span className="text-indigo-400 text-sm font-bold animate-pulse">Running...</span>}
                {!isCrawling && !isCompleted && <span className="text-yellow-400 text-sm font-bold">Paused</span>}
            </div>

            <p className="font-['DM_Sans'] text-sm text-gray-400 mb-4">
                {crawled} pages analyzed
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {errorMsg && (
                <p className="text-red-400 text-sm mb-4">{errorMsg}</p>
            )}

            {/* Controls */}
            <div className="flex gap-2 mb-4">
                {!isCrawling && !isCompleted && (
                    <button onClick={resumeCrawl} className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded">
                        Resume
                    </button>
                )}
                {isCrawling && (
                    <button onClick={stopCrawl} className="text-xs bg-white/10 text-white px-3 py-1.5 rounded hover:bg-white/20">
                        Pause
                    </button>
                )}
            </div>

            {/* Live Logs */}
            <div className="bg-[#13161f] rounded-lg p-3 border border-white/5 space-y-2 h-40 overflow-hidden relative">
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#13161f] to-transparent pointer-events-none" />
                {logs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono text-gray-400 opacity-90 transition-all duration-300">
                        <span className="truncate w-1/2 text-gray-300">{log.url}</span>
                        <div className="flex gap-4 w-1/2 justify-end">
                            <span className="text-red-400">{log.issuesFound} issues</span>
                            <span className={log.score && log.score >= 80 ? "text-emerald-400" : "text-yellow-400"}>
                                Score: {log.score}
                            </span>
                        </div>
                    </div>
                ))}
                {logs.length === 0 && <p className="text-xs text-gray-500 font-mono text-center mt-12">Waiting for first page...</p>}
            </div>

            {isCompleted && logs.length > 0 && (
                <CrawlIssuesDashboard logs={logs} />
            )}
        </div>
    );
}
