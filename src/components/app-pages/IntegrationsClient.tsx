"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, RefreshCcw, Lock, Clock } from "lucide-react";
import { MOCK_INTEGRATIONS } from "@/lib/mock-data";

export function IntegrationsClient() {
    const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS);

    const toggle = (id: string) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Integrations</h1>
                <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>Connect your data sources for richer insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((intg, i) => {
                    const isPro = intg.plan === "pro";
                    return (
                        <motion.div key={intg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="rounded-xl border p-5"
                            style={{ background: "#151B27", borderColor: intg.connected ? "rgba(0,200,83,0.2)" : "#1E2940" }}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{intg.icon}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-white text-sm">{intg.name}</p>
                                            {isPro && (
                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                                                    style={{ background: "rgba(255,152,0,0.15)", color: "#FF9800" }}>PRO</span>
                                            )}
                                        </div>
                                        {intg.connected && intg.lastSync && (
                                            <span className="text-[11px] flex items-center gap-1" style={{ color: "#00C853" }}>
                                                <CheckCircle size={10} />
                                                Connected · Last sync {new Date(intg.lastSync).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        )}
                                        {!intg.connected && (
                                            <span className="text-[11px] flex items-center gap-1" style={{ color: "#4A5568" }}>
                                                <XCircle size={10} /> Not connected
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggle(intg.id)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-80"
                                    style={{
                                        background: intg.connected ? "rgba(255,61,61,0.12)" : "rgba(255,100,45,0.12)",
                                        color: intg.connected ? "#FF3D3D" : "#FF642D",
                                        border: `1px solid ${intg.connected ? "rgba(255,61,61,0.25)" : "rgba(255,100,45,0.25)"}`,
                                    }}
                                >
                                    {intg.connected ? "Disconnect" : isPro ? <><Lock size={10} className="inline mr-1" />Connect (Pro)</> : "Connect"}
                                </button>
                            </div>
                            <p className="text-[12px]" style={{ color: "#8B9BB4" }}>{intg.description}</p>
                            {intg.connected && (
                                <button className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold transition hover:opacity-70"
                                    style={{ color: "#6B7A99" }}>
                                    <RefreshCcw size={10} /> Sync Now
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
