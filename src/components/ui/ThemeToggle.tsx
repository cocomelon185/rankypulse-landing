"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch by only rendering after mount
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="w-9 h-9 opacity-0" />; // Placeholder
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-white/10"
            aria-label="Toggle theme"
        >
            <div className="relative w-4 h-4 overflow-hidden flex items-center justify-center">
                <motion.div
                    initial={false}
                    animate={{
                        y: isDark ? 24 : 0,
                        opacity: isDark ? 0 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute"
                >
                    <Sun size={16} strokeWidth={2.5} />
                </motion.div>

                <motion.div
                    initial={false}
                    animate={{
                        y: isDark ? 0 : -24,
                        opacity: isDark ? 1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute"
                >
                    <Moon size={16} strokeWidth={2.5} />
                </motion.div>
            </div>
        </button>
    );
}
