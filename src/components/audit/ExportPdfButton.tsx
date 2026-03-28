"use client";

import { useState } from "react";
import { Download, Lock, X } from "lucide-react";
import { generatePdfFromElements } from "@/lib/export-pdf";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { useAuditStore } from "@/lib/use-audit";

interface ExportPdfButtonProps {
    domain: string;
    agencyName?: string;
    agencyLogoUrl?: string;
}

export function ExportPdfButton({
    domain,
    agencyName,
    agencyLogoUrl,
}: ExportPdfButtonProps) {
    const { isAuthenticated } = useAuth();
    const { data: session } = useSession();
    const brandingConfig = useAuditStore((s) => s.brandingConfig);
    const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
    const [progress, setProgress] = useState("");
    const [showUpgrade, setShowUpgrade] = useState(false);

    // Determine if user is Pro tier — we check session.user.plan if present, default to free
    const userPlan = (session?.user as { plan?: string } | undefined)?.plan ?? "free";
    const isPro = userPlan === "pro";

    const handleExport = async () => {
        if (!isAuthenticated) {
            window.location.href = `/auth/signin?callbackUrl=/report/${domain}`;
            return;
        }
        if (!isPro) {
            setShowUpgrade(true);
            return;
        }

        setStatus("generating");
        setProgress("Preparing report...");

        // Inject branding header overlay into DOM before capture
        let brandingEl: HTMLDivElement | null = null;
        if (brandingConfig.logoUrl || brandingConfig.primaryColor !== "#FF642D") {
            brandingEl = document.createElement("div");
            brandingEl.id = "pdf-branding-header";
            brandingEl.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                width: 800px;
                pointer-events: none;
                visibility: hidden;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px;
                background: white;
            `;
            brandingEl.setAttribute("tabindex", "-1");
            brandingEl.setAttribute("aria-hidden", "true");
            if (brandingConfig.logoUrl) {
                const img = document.createElement("img");
                img.src = brandingConfig.logoUrl;
                img.style.cssText = "height: 40px; object-fit: contain;";
                brandingEl.appendChild(img);
            }
            const label = document.createElement("span");
            label.textContent = "SEO Audit Report";
            label.style.cssText = `font-size: 14px; font-weight: 600; color: ${brandingConfig.primaryColor};`;
            brandingEl.appendChild(label);
            document.body.appendChild(brandingEl);
        }

        try {
            // Sections to screenshot, by DOM element ID
            const sections = [
                ...(brandingEl ? [{ id: "pdf-branding-header", name: "Branding" }] : []),
                { id: "pdf-cover", name: "Cover" },
                { id: "pdf-hero", name: "Score Overview" },
                { id: "pdf-findings", name: "Issue Findings" },
                { id: "pdf-roadmap", name: "Action Roadmap" },
            ];

            const filename = `SEO_Audit_${domain.replace(/\./g, "_")}.pdf`;

            await generatePdfFromElements(sections, filename, (msg) =>
                setProgress(msg)
            );

            setStatus("done");
            setTimeout(() => setStatus("idle"), 3000);
        } catch (err) {
            console.error(err);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        } finally {
            // Clean up branding overlay
            brandingEl?.remove();
        }
    };

    const buttonLabel =
        status === "generating"
            ? progress || "Generating..."
            : status === "done"
                ? "✓ Downloaded!"
                : status === "error"
                    ? "Error — Try Again"
                    : isAuthenticated && isPro
                        ? "Export PDF"
                        : "Export PDF (Pro)";

    return (
        <>
            {/* Export Button */}
            <button
                onClick={handleExport}
                disabled={status === "generating"}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-indigo-500/50 hover:text-white disabled:opacity-60"
            >
                {isPro || !isAuthenticated ? (
                    <Download size={15} />
                ) : (
                    <Lock size={15} className="text-amber-400" />
                )}
                <span>{buttonLabel}</span>
            </button>

            {/* Upgrade Modal */}
            {showUpgrade && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-8 shadow-2xl">
                        <button
                            onClick={() => setShowUpgrade(false)}
                            className="absolute right-4 top-4 text-[var(--text-secondary)] hover:text-white"
                        >
                            <X size={18} />
                        </button>
                        <div className="mb-1 text-2xl">📄</div>
                        <h2 className="mb-2 font-['DM_Sans'] text-xl font-bold text-white">
                            White-Label PDF Reports
                        </h2>
                        <p className="mb-6 font-['DM_Sans'] text-sm text-[var(--text-secondary)]">
                            Export branded PDF audit reports with your agency logo and name.
                            Available on the <strong className="text-white">Pro plan</strong>.
                        </p>
                        <ul className="mb-6 space-y-2 text-sm text-[var(--text-secondary)]">
                            {[
                                "Custom agency branding (logo + name)",
                                "Full multi-page A4 PDF report",
                                "Share with clients professionally",
                                "Unlimited exports",
                            ].map((f) => (
                                <li key={f} className="flex items-center gap-2">
                                    <span className="text-emerald-400">✓</span> {f}
                                </li>
                            ))}
                        </ul>
                        <a
                            href="/pricing"
                            className="block w-full rounded-lg bg-indigo-600 py-3 text-center font-['DM_Sans'] font-semibold text-white transition hover:bg-indigo-500"
                        >
                            Upgrade to Pro — Get PDF Exports
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}
