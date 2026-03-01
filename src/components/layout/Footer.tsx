"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full mt-auto border-t border-[#1e2336] bg-[#0c0e14] py-8">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-sm text-[#545a72]">
                    <Link href="/dashboard" className="flex items-center gap-2 mr-4">
                        <div
                            className="w-6 h-6 rounded bg-gradient-to-tr from-[#f97316] to-[#fb923c] flex items-center justify-center -rotate-12 transform shadow-lg shadow-[#f97316]/20"
                        >
                            <span className="text-white font-bold text-[10px]">RP</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-[#e8eaf0] uppercase hidden sm:block">RankyPulse</span>
                    </Link>
                    <span className="hidden md:block w-px h-4 bg-[#1e2336]" />
                    <span>© {new Date().getFullYear()} RankyPulse, Inc.</span>
                </div>

                <div className="flex items-center gap-6 text-sm font-medium text-[#8b91a8]">
                    <Link href="/privacy-policy" className="hover:text-[#e8eaf0] transition-colors">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="hover:text-[#e8eaf0] transition-colors">Terms of Service</Link>
                    <div className="flex items-center gap-4 ml-4">
                        <Link href="https://twitter.com" target="_blank" className="hover:text-[#f97316] transition-colors"><Twitter size={18} /></Link>
                        <Link href="https://linkedin.com" target="_blank" className="hover:text-[#f97316] transition-colors"><Linkedin size={18} /></Link>
                        <Link href="https://github.com" target="_blank" className="hover:text-[#f97316] transition-colors"><Github size={18} /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
