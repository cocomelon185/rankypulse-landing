"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full mt-auto border-t border-white/5 bg-[#0d0f14] py-8">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-sm text-gray-500">
                    <Link href="/dashboard" className="flex items-center gap-2 mr-4">
                        <div className="w-6 h-6 rounded bg-gradient-to-tr from-[#ff7e5f] to-[#feb47b] flex items-center justify-center -rotate-12 transform shadow-lg shadow-orange-500/20">
                            <div className="w-3 h-3 rounded-full bg-white opacity-90 shadow-inner"></div>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white uppercase hidden sm:block">RankyPulse</span>
                    </Link>
                    <span className="hidden md:block w-px h-4 bg-white/10" />
                    <span>© {new Date().getFullYear()} RankyPulse, Inc.</span>
                </div>

                <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
                    <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</Link>
                    <div className="flex items-center gap-4 ml-4">
                        <Link href="https://twitter.com" target="_blank" className="hover:text-indigo-400 transition-colors"><Twitter size={18} /></Link>
                        <Link href="https://linkedin.com" target="_blank" className="hover:text-indigo-400 transition-colors"><Linkedin size={18} /></Link>
                        <Link href="https://github.com" target="_blank" className="hover:text-indigo-400 transition-colors"><Github size={18} /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
