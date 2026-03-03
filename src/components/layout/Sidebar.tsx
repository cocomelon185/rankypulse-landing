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
    Activity,
    GitCompare,
    Share2,
    PenTool,
    Layout,
    Globe,
    AlertTriangle,
    Zap as ZapIcon,
    Link as LinkIcon,
    Cpu,
    FilePieChart,
    Search as SearchIcon,
    Star,
    Layers,
    FileSearch,
    Wand2,
    BarChart,
    ExternalLink,
    X,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
    label: string;
    href: string;
    icon: any;
    pro?: boolean;
    beta?: boolean;
    new?: boolean;
}

interface SidebarSection {
    category: string;
    items: SidebarItem[];
}

const SIDEBAR_STRUCTURE: SidebarSection[] = [
    {
        category: "Overview",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Projects", href: "/projects", icon: Layers },
        ]
    },
    {
        category: "Site Audit",
        items: [
            { label: "Full Site Audit", href: "/audits/full", icon: Star, pro: true },
            { label: "Crawl Issues", href: "/audits/issues", icon: AlertTriangle },
            { label: "Core Web Vitals", href: "/audits/vitals", icon: ZapIcon },
            { label: "Internal Linking", href: "/audits/links", icon: LinkIcon },
            { label: "Page Speed", href: "/audits/speed", icon: Activity },
        ]
    },
    {
        category: "Rankings",
        items: [
            { label: "Position Tracking", href: "/position-tracking", icon: TrendingUp },
            { label: "Competitors", href: "/features/competitors", icon: Users },
            { label: "SERP Analysis", href: "/features/serp-analysis", icon: Layout },
        ]
    },
    {
        category: "Keyword Research",
        items: [
            { label: "Keyword Gap", href: "/features/keyword-gap", icon: GitCompare },
            { label: "Keyword Explorer", href: "/features/keyword-explorer", icon: SearchIcon },
            { label: "Keyword Difficulty", href: "/features/keyword-difficulty", icon: BarChart },
        ]
    },
    {
        category: "Backlinks",
        items: [
            { label: "Backlink Gap", href: "/features/backlink-gap", icon: Share2 },
            { label: "Backlink Audit", href: "/features/backlink-audit", icon: LinkIcon },
            { label: "Referring Domains", href: "/features/referring-domains", icon: Globe },
        ]
    },
    {
        category: "On-Page SEO",
        items: [
            { label: "On-Page SEO Checker", href: "/features/on-page-checker", icon: Layout },
            { label: "SEO Writing Assistant", href: "/features/writing-assistant", icon: PenTool },
            { label: "Content Audit", href: "/features/content-audit", icon: FileSearch },
        ]
    },
    {
        category: "AI Tools",
        items: [
            { label: "AI Writer", href: "/features/ai-writer", icon: Wand2, beta: true },
            { label: "AI Search Visibility", href: "/features/ai-visibility", icon: Cpu, new: true },
        ]
    },
    {
        category: "Reports",
        items: [
            { label: "My Reports", href: "/reports", icon: FilePieChart },
            { label: "PDF Reports", href: "/reports/pdf", icon: FileText },
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
            className={`hidden md:flex flex-col w-64 ${hFull ? 'h-full' : 'h-screen sticky top-0'} border-r border-[#1e2336] bg-[#0f1119]`}
        >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center px-6 border-b border-[#1e2336]">
                <Link href="/" className="flex items-center gap-2 group">
                    <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg relative overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, #f97316, #fb923c)",
                            boxShadow: "0 2px 12px rgba(249, 115, 22, 0.3)"
                        }}
                    >
                        <span className="text-white font-bold text-sm z-10">RP</span>
                        <div className="absolute inset-x-0 top-0 h-full w-full bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer" style={{ transform: 'rotate(45deg)' }} />
                    </div>
                    <span className="font-bold text-[16px] tracking-tight bg-gradient-to-br from-[#e8eaf0] to-[#8b91a8] bg-clip-text text-transparent">
                        RankyPulse
                    </span>
                </Link>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                <div className="flex flex-col gap-6">
                    {SIDEBAR_STRUCTURE.map((section) => (
                        <div key={section.category} className="flex flex-col gap-1">
                            <button
                                onClick={() => toggleCategory(section.category)}
                                className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-[#545a72] hover:text-[#8b91a8] transition-colors mb-2"
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
                                        const isPro = item.pro;
                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                className={cn(
                                                    "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 relative border border-transparent",
                                                    active
                                                        ? "bg-[#f97316]/10 text-[#f97316] font-medium"
                                                        : "text-[#8b91a8] hover:text-[#e8eaf0] hover:bg-[#171b26]",
                                                    isPro && "bg-gradient-to-r from-[#f97316]/8 to-[#eab308]/6 border-[#f97316]/25 text-[#f97316] font-semibold mt-1 mb-1 overflow-hidden"
                                                )}
                                            >
                                                {/* Active/Pro indicator */}
                                                {(active || isPro) && (
                                                    <div className={cn(
                                                        "absolute left-[-12px] top-1 bottom-1 w-[3px] rounded-r",
                                                        isPro ? "bg-gradient-to-b from-[#f97316] to-[#eab308]" : "bg-[#f97316]"
                                                    )} />
                                                )}

                                                <item.icon className={cn(
                                                    "h-4 w-4 transition-colors",
                                                    active || isPro ? "text-[#f97316]" : "text-[#545a72] group-hover:text-[#8b91a8]"
                                                )} />
                                                {item.label}

                                                {item.pro && (
                                                    <span className="ml-auto text-[9px] font-bold bg-gradient-to-r from-[#f97316] to-[#eab308] text-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-lg shadow-[#f97316]/30 animate-pulse">
                                                        <Star size={8} fill="currentColor" /> PRO
                                                    </span>
                                                )}
                                                {item.beta && (
                                                    <span className="ml-auto text-[10px] font-bold bg-[#a78bfa]/12 text-[#a78bfa] px-1.5 py-0.5 rounded">
                                                        Beta
                                                    </span>
                                                )}
                                                {item.new && (
                                                    <span className="ml-auto text-[10px] font-bold bg-[#22c55e]/12 text-[#22c55e] px-1.5 py-0.5 rounded">
                                                        New
                                                    </span>
                                                )}

                                                {isPro && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f97316]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
            <div className="p-4 border-t border-[#1e2336]">
                {/* Support Block */}
                <div className="flex flex-col gap-1">
                    <Link
                        href="mailto:support@rankypulse.com"
                        className="flex items-center gap-3 px-3 py-2 text-xs text-[#545a72] hover:text-[#8b91a8] transition-colors"
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
                        className="fixed top-0 left-0 z-[120] bottom-0 w-[280px] bg-[#0f1119] border-r border-[#1e2336] lg:hidden flex flex-col"
                    >
                        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1e2336]">
                            <Link href="/" className="flex items-center gap-2">
                                <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                    style={{
                                        background: "linear-gradient(135deg, #f97316, #fb923c)",
                                    }}
                                >
                                    <span className="text-white font-bold text-sm">RP</span>
                                </div>
                                <span className="font-bold text-[16px] text-[#e8eaf0] tracking-tight">
                                    RankyPulse
                                </span>
                            </Link>
                            <button onClick={onClose} className="text-[#545a72] hover:text-[#e8eaf0]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-6 px-4" onClick={onClose}>
                            <div className="flex flex-col gap-8">
                                {SIDEBAR_STRUCTURE.map((section) => (
                                    <div key={section.category} className="flex flex-col gap-2">
                                        <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-[#545a72]">
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
                                                                ? "bg-[#f97316]/10 text-[#f97316] font-medium"
                                                                : "text-[#8b91a8] hover:text-[#e8eaf0]"
                                                        )}
                                                    >
                                                        <item.icon size={18} className={active ? "text-[#f97316]" : "text-[#545a72]"} />
                                                        {item.label}
                                                        {item.pro && (
                                                            <span className="ml-auto text-[9px] font-bold bg-gradient-to-r from-[#f97316] to-[#eab308] text-black px-1.5 py-0.5 rounded">
                                                                PRO
                                                            </span>
                                                        )}
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
