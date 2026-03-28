"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, CheckCircle2, AlertCircle, Monitor, Smartphone } from "lucide-react";
import type { RankKeyword } from "@/lib/rank-engine";

const COUNTRIES = [
    { code: "US", label: "United States" },
    { code: "GB", label: "United Kingdom" },
    { code: "CA", label: "Canada" },
    { code: "AU", label: "Australia" },
    { code: "IN", label: "India" },
    { code: "DE", label: "Germany" },
    { code: "FR", label: "France" },
    { code: "BR", label: "Brazil" },
    { code: "SG", label: "Singapore" },
];

interface BulkImportModalProps {
    domain: string;
    open: boolean;
    onClose: () => void;
    onAdded: (keywords: RankKeyword[]) => void;
    keywordsUsed: number;
    keywordCap: number;
}

interface ImportResult {
    keyword: string;
    status: "success" | "error" | "limit";
    message?: string;
    kw?: RankKeyword;
}

export function BulkImportModal({ domain, open, onClose, onAdded, keywordsUsed, keywordCap }: BulkImportModalProps) {
    const [text, setText] = useState("");
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
    const [country, setCountry] = useState("US");
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState<ImportResult[]>([]);
    const [done, setDone] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    if (!open) return null;

    const keywords = text
        .split(/[\n,]+/)
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 0 && k.length < 200);

    const uniqueKeywords = Array.from(new Set(keywords));
    const slotsLeft = keywordCap - keywordsUsed;
    const importable = uniqueKeywords.slice(0, slotsLeft);
    const willExceed = uniqueKeywords.length > slotsLeft;

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            // Strip CSV header if it looks like one
            const lines = content.split(/[\r\n]+/).map((l) => l.split(",")[0].trim()).filter(Boolean);
            const firstLine = lines[0]?.toLowerCase() ?? "";
            const start = ["keyword", "keywords", "query", "queries"].includes(firstLine) ? 1 : 0;
            setText(lines.slice(start).join("\n"));
        };
        reader.readAsText(file);
        e.target.value = "";
    }

    async function handleImport() {
        if (importable.length === 0) return;
        setImporting(true);
        setDone(false);
        setResults([]);

        const added: RankKeyword[] = [];
        const newResults: ImportResult[] = [];

        for (const kw of importable) {
            try {
                const res = await fetch("/api/rank/keywords", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ domain, keyword: kw, device, country }),
                });
                const data = await res.json();
                if (res.ok) {
                    added.push(data.keyword);
                    newResults.push({ keyword: kw, status: "success", kw: data.keyword });
                } else if (data.limitReached) {
                    newResults.push({ keyword: kw, status: "limit", message: "Keyword limit reached" });
                } else {
                    newResults.push({ keyword: kw, status: "error", message: data.error ?? "Failed" });
                }
            } catch {
                newResults.push({ keyword: kw, status: "error", message: "Network error" });
            }
            setResults([...newResults]);
        }

        if (added.length > 0) onAdded(added);
        setImporting(false);
        setDone(true);
    }

    function handleClose() {
        if (importing) return;
        setText("");
        setResults([]);
        setDone(false);
        onClose();
    }

    const successCount = results.filter((r) => r.status === "success").length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="relative w-full max-w-lg rounded-2xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#1E2940" }}>
                    <div>
                        <h2 className="text-base font-bold text-white">Bulk Import Keywords</h2>
                        <p className="text-[11px] mt-0.5" style={{ color: "#8B9BB4" }}>
                            {slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining on your plan
                        </p>
                    </div>
                    <button onClick={handleClose} disabled={importing} className="p-1.5 rounded-lg hover:bg-white/5 transition" style={{ color: "#8B9BB4" }}>
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {!done ? (
                        <>
                            {/* Textarea */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold" style={{ color: "#8B9BB4" }}>
                                        Keywords <span className="font-normal">(one per line or comma-separated)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="flex items-center gap-1 text-[11px] font-semibold hover:opacity-80 transition"
                                        style={{ color: "#FF642D" }}
                                    >
                                        <Upload size={11} /> Upload CSV
                                    </button>
                                    <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileChange} />
                                </div>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="seo audit tool&#10;website audit checker&#10;technical seo services&#10;..."
                                    rows={8}
                                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 border outline-none focus:border-orange-500/50 transition resize-none font-mono"
                                    style={{ background: "#0D1424", borderColor: "#1E2940" }}
                                />
                                {uniqueKeywords.length > 0 && (
                                    <div className="flex items-center justify-between mt-1.5">
                                        <p className="text-[11px]" style={{ color: "#8B9BB4" }}>
                                            {uniqueKeywords.length} unique keyword{uniqueKeywords.length !== 1 ? "s" : ""} detected
                                        </p>
                                        {willExceed && (
                                            <p className="text-[11px] font-semibold" style={{ color: "#F59E0B" }}>
                                                Only {slotsLeft} will be imported (plan limit)
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Device + Country */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-2" style={{ color: "#8B9BB4" }}>Device</label>
                                    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#1E2940" }}>
                                        {(["desktop", "mobile"] as const).map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setDevice(d)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition"
                                                style={{
                                                    background: device === d ? "rgba(255,100,45,0.15)" : "transparent",
                                                    color: device === d ? "#FF642D" : "#8B9BB4",
                                                }}
                                            >
                                                {d === "desktop" ? <Monitor size={11} /> : <Smartphone size={11} />}
                                                {d === "desktop" ? "Desktop" : "Mobile"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-2" style={{ color: "#8B9BB4" }}>Country</label>
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full rounded-lg px-3 py-2 text-sm text-white border outline-none focus:border-orange-500/50 transition appearance-none"
                                        style={{ background: "#0D1424", borderColor: "#1E2940" }}
                                    >
                                        {COUNTRIES.map((c) => (
                                            <option key={c.code} value={c.code}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Preview */}
                            {importable.length > 0 && (
                                <div className="rounded-xl border p-3 max-h-32 overflow-y-auto" style={{ background: "#0D1424", borderColor: "#1E2940" }}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#4A5568" }}>
                                        Preview — {importable.length} to import
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {importable.slice(0, 30).map((kw) => (
                                            <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ background: "rgba(255,100,45,0.06)", borderColor: "rgba(255,100,45,0.2)", color: "#FF642D" }}>
                                                {kw}
                                            </span>
                                        ))}
                                        {importable.length > 30 && (
                                            <span className="text-[11px]" style={{ color: "#4A5568" }}>+{importable.length - 30} more</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Progress during import */}
                            {importing && results.length > 0 && (
                                <div className="space-y-1">
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1E2940" }}>
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${(results.length / importable.length) * 100}%`,
                                                background: "linear-gradient(90deg, #FF642D, #E8541F)",
                                            }}
                                        />
                                    </div>
                                    <p className="text-[11px]" style={{ color: "#8B9BB4" }}>
                                        Importing {results.length}/{importable.length}…
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Results view */
                        <div className="space-y-3">
                            <div className="text-center py-3">
                                <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: "#00C853" }} />
                                <p className="text-sm font-bold text-white">
                                    {successCount}/{importable.length} keywords imported
                                </p>
                                <p className="text-[11px] mt-0.5" style={{ color: "#8B9BB4" }}>
                                    Rankings will appear after the next daily refresh (6am UTC)
                                </p>
                            </div>
                            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1E2940" }}>
                                {results.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b last:border-b-0 text-xs" style={{ borderColor: "#1E2940" }}>
                                        <span className="font-medium text-white">{r.keyword}</span>
                                        {r.status === "success" ? (
                                            <CheckCircle2 size={14} style={{ color: "#00C853" }} />
                                        ) : (
                                            <div className="flex items-center gap-1.5" style={{ color: "#FF3D3D" }}>
                                                <AlertCircle size={14} />
                                                <span className="text-[11px]">{r.message}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: "#1E2940" }}>
                    <button
                        onClick={handleClose}
                        disabled={importing}
                        className="px-4 py-2 rounded-lg text-xs font-semibold border transition hover:bg-white/5 disabled:opacity-50"
                        style={{ borderColor: "#1E2940", color: "#8B9BB4" }}
                    >
                        {done ? "Close" : "Cancel"}
                    </button>
                    {!done && (
                        <button
                            onClick={handleImport}
                            disabled={importing || importable.length === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                        >
                            {importing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                            {importing ? `Importing ${results.length}/${importable.length}…` : `Import ${importable.length} Keyword${importable.length !== 1 ? "s" : ""}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
