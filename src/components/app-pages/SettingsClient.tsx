"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, CreditCard, Bell, Key, Save } from "lucide-react";
import { useSession } from "next-auth/react";

const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "api", label: "API Keys", icon: Key },
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
            <h3 className="text-sm font-bold text-white mb-4">{title}</h3>
            {children}
        </div>
    );
}

function InputField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
    return (
        <div>
            <label className="block text-[11px] font-semibold mb-1.5" style={{ color: "#6B7A99" }}>{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                style={{ background: "#0D1424", border: "1px solid #1E2940", color: "#C8D0E0" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#FF642D")}
                onBlur={e => (e.currentTarget.style.borderColor = "#1E2940")} />
        </div>
    );
}

export function SettingsClient() {
    const { data: session } = useSession();
    const [tab, setTab] = useState("profile");
    const [name, setName] = useState(session?.user?.name || "");
    const [email, setEmail] = useState(session?.user?.email || "");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
                <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>Manage your account preferences</p>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 border-b" style={{ borderColor: "#1E2940" }}>
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-all relative"
                        style={{ color: tab === t.id ? "#FF642D" : "#8B9BB4" }}
                    >
                        <t.icon size={14} />
                        {t.label}
                        {tab === t.id && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: "#FF642D" }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
                {tab === "profile" && (
                    <div className="space-y-4 max-w-lg">
                        <SectionCard title="Personal Information">
                            <div className="space-y-4">
                                <InputField label="Full Name" value={name} onChange={setName} />
                                <InputField label="Email Address" value={email} onChange={setEmail} type="email" />
                                <InputField label="Company Name" value="RankyPulse User" onChange={() => { }} />
                                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition"
                                    style={{ background: saved ? "rgba(0,200,83,0.2)" : "linear-gradient(135deg, #FF642D, #E8541F)", color: saved ? "#00C853" : "white" }}>
                                    {saved ? "✓ Saved!" : <><Save size={13} /> Save Changes</>}
                                </button>
                            </div>
                        </SectionCard>
                        <SectionCard title="Change Password">
                            <div className="space-y-4">
                                <InputField label="Current Password" value="" onChange={() => { }} type="password" />
                                <InputField label="New Password" value="" onChange={() => { }} type="password" />
                                <InputField label="Confirm Password" value="" onChange={() => { }} type="password" />
                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition hover:bg-white/[0.06] border"
                                    style={{ color: "#8B9BB4", borderColor: "#1E2940" }}>
                                    Update Password
                                </button>
                            </div>
                        </SectionCard>
                    </div>
                )}
                {tab === "billing" && (
                    <div className="space-y-4 max-w-lg">
                        <SectionCard title="Current Plan">
                            <div className="flex items-center justify-between p-4 rounded-lg mb-4" style={{ background: "rgba(255,100,45,0.06)", border: "1px solid rgba(255,100,45,0.15)" }}>
                                <div>
                                    <p className="font-bold text-white">Pro Plan</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#8B9BB4" }}>₹2,999/month · Renews April 5, 2026</p>
                                </div>
                                <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(0,200,83,0.15)", color: "#00C853" }}>Active</span>
                            </div>
                            <div className="space-y-2">
                                {["5 Projects", "500 pages/project crawl", "PDF Export", "Scheduled reports", "Priority support"].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-[13px]" style={{ color: "#C8D0E0" }}>
                                        <span style={{ color: "#00C853" }}>✓</span> {f}
                                    </div>
                                ))}
                            </div>
                            <button className="mt-4 px-4 py-2 rounded-lg text-[12px] font-semibold transition hover:bg-white/[0.04] border"
                                style={{ color: "#FF3D3D", borderColor: "rgba(255,61,61,0.2)" }}>
                                Cancel Subscription
                            </button>
                        </SectionCard>
                    </div>
                )}
                {tab === "notifications" && (
                    <div className="space-y-4 max-w-lg">
                        <SectionCard title="Email Notifications">
                            <div className="space-y-4">
                                {[
                                    { label: "Audit completed", desc: "When a crawl finishes" },
                                    { label: "New issues detected", desc: "When errors spike above threshold" },
                                    { label: "Ranking drops", desc: "Top keywords drop >5 positions" },
                                    { label: "Weekly digest", desc: "Summary of all projects every Monday" },
                                ].map(n => (
                                    <div key={n.label} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{n.label}</p>
                                            <p className="text-[11px]" style={{ color: "#6B7A99" }}>{n.desc}</p>
                                        </div>
                                        <button className="relative w-10 h-5 rounded-full transition" style={{ background: "rgba(255,100,45,0.3)" }}>
                                            <span className="absolute right-1 top-0.5 w-4 h-4 rounded-full bg-[#FF642D]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                )}
                {tab === "api" && (
                    <div className="space-y-4 max-w-lg">
                        <SectionCard title="API Keys">
                            <p className="text-[12px] mb-4" style={{ color: "#6B7A99" }}>Use the RankyPulse API to integrate audit data into your own tools.</p>
                            <div className="rounded-lg p-4 font-mono text-[12px] flex items-center justify-between"
                                style={{ background: "#0D1424", border: "1px solid #1E2940", color: "#FF642D" }}>
                                <span>rp_live_••••••••••••••••••••••••</span>
                                <button className="text-[11px] font-semibold ml-4 transition hover:opacity-70" style={{ color: "#8B9BB4" }}>Reveal</button>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button className="px-4 py-2 rounded-lg text-[12px] font-semibold transition hover:opacity-90 text-white"
                                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                                    Generate New Key
                                </button>
                                <button className="px-4 py-2 rounded-lg text-[12px] font-semibold transition hover:bg-white/[0.06] border"
                                    style={{ color: "#8B9BB4", borderColor: "#1E2940" }}>
                                    Revoke Key
                                </button>
                            </div>
                        </SectionCard>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
