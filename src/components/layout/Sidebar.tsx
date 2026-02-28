"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    LayoutDashboard,
    Search,
    BarChart3,
    TrendingUp,
    Users,
    ListChecks,
    FileText,
    CreditCard,
    ChevronDown,
    ChevronRight,
    Settings,
    HelpCircle,
    Menu,
    X,
    Activity,
    GitCompare,
    Share2,
    PenTool,
    Layout,
    Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_STRUCTURE = [
    {
        category: "Overview",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Site Audit", href: "/audits", icon: BarChart3 },
        ]
    },
    {
        category: "Rankings",
        items: [
            { label: "Position Tracking", href: "/position-tracking", icon: Activity },
            { label: "Competitors", href: "/features/competitors", icon: Users },
        ]
    },
    {
        category: "Analysis",
        items: [
            { label: "Keyword Gap", href: "/features/keyword-gap", icon: GitCompare },
            { label: "Backlink Gap", href: "/features/backlink-gap", icon: Share2 },
        ]
    },
    {
        category: "On-Page SEO",
        items: [
            { label: "On-Page SEO Checker", href: "/features/on-page-checker", icon: Layout },
            { label: "SEO Writing Assistant", href: "/features/writing-assistant", icon: PenTool },
        ]
    },
    {
        category: "Discovery",
        items: [
            { label: "Topic Research", href: "/features/topic-research", icon: Lightbulb },
            { label: "Discoverability", href: "/features/discoverability", icon: Search },
        ]
    },
    {
        category: "Management",
        items: [
            { label: "Action Plan", href: "/features/action-plan", icon: ListChecks },
            { label: "Reports", href: "/reports", icon: FileText },
            { label: "Billing", href: "/billing", icon: CreditCard },
        ]
    }
];

export function Sidebar({ hFull }: { hFull?: boolean } = {}) {
    const pathname = usePathname();
    const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={`hidden lg:flex flex-col w-64 ${hFull ? 'h-full' : 'h-screen sticky top-0'} border-r border-white/5 bg-[#13161f]`}
        >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-2 group">
                    <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        }}
                    >
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-display text-[17px] font-bold text-white tracking-tight">
                        RankyPulse
                    </span>
                </Link>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                <div className="flex flex-col gap-8">
                    {SIDEBAR_STRUCTURE.map((section) => (
                        <div key={section.category} className="flex flex-col gap-2">
                            <button
                                onClick={() => toggleCategory(section.category)}
                                className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {section.category}
                                {collapsedCategories.includes(section.category)
                                    ? <ChevronRight size={10} />
                                    : <ChevronDown size={10} />
                                }
                            </button>

                            {!collapsedCategories.includes(section.category) && (
                                <div className="flex flex-col gap-0.5">
                                    {section.items.map((item) => {
                                        const active = isActive(item.href);
                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                className={cn(
                                                    "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                                    active
                                                        ? "bg-indigo-500/10 text-indigo-400 font-medium"
                                                        : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]"
                                                )}
                                            >
                                                <item.icon className={cn(
                                                    "h-4 w-4 transition-colors",
                                                    active ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
                                                )} />
                                                {item.label}
                                                {active && (
                                                    <motion.div
                                                        layoutId="active-indicator"
                                                        className="ml-auto w-1 h-1 rounded-full bg-indigo-500"
                                                    />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/5">
                <div className="rounded-xl p-4 bg-indigo-500/5 border border-indigo-500/10">
                    <p className="text-[11px] font-medium text-indigo-300 mb-1">PRO PLAN</p>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">Unlock advanced SEO metrics and report daily.</p>
                    <Link
                        href="/pricing"
                        className="block text-center py-2 px-4 rounded-lg bg-indigo-500 text-white text-[11px] font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Upgrade Now
                    </Link>
                </div>

                <div className="mt-4 flex flex-col gap-1">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        <Settings size={14} />
                        Account Settings
                    </Link>
                    <Link
                        href="mailto:support@rankypulse.com"
                        className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        <HelpCircle size={14} />
                        Support Center
                    </Link>
                </div>
            </div>
        </aside>
    );
}

export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm lg:hidden"
                    />
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 z-[120] bottom-0 w-[280px] bg-[#13161f] border-r border-white/5 lg:hidden flex flex-col"
                    >
                        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                            <Link href="/" className="flex items-center gap-2">
                                <div
                                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                                    style={{
                                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    }}
                                >
                                    <Zap className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-display text-[17px] font-bold text-white tracking-tight">
                                    RankyPulse
                                </span>
                            </Link>
                            <button onClick={onClose} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-6 px-4" onClick={onClose}>
                            <div className="flex flex-col gap-8">
                                {SIDEBAR_STRUCTURE.map((section) => (
                                    <div key={section.category} className="flex flex-col gap-2">
                                        <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            {section.category}
                                        </p>
                                        <div className="flex flex-col gap-0.5">
                                            {section.items.map((item) => {
                                                const active = pathname.startsWith(item.href);
                                                return (
                                                    <Link
                                                        key={item.label}
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all",
                                                            active
                                                                ? "bg-indigo-500/10 text-indigo-400 font-medium"
                                                                : "text-gray-400 hover:text-gray-200"
                                                        )}
                                                    >
                                                        <item.icon size={18} className={active ? "text-indigo-400" : "text-gray-500"} />
                                                        {item.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
