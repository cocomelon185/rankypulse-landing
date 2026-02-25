"use client";

import { Lock, Users } from "lucide-react";
import { track } from "@/lib/analytics";

interface BenchmarkTeaserProps {
  yourScore: number;
  onUnlock: () => void;
}

export function BenchmarkTeaser({ yourScore, onUnlock }: BenchmarkTeaserProps) {
  const fakeCompetitors = [
    { name: "competitor-1.com", score: Math.min(100, yourScore + 12) },
    { name: "competitor-2.com", score: Math.min(100, yourScore + 8) },
    { name: "competitor-3.com", score: Math.min(100, yourScore + 5) },
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-400" aria-hidden />
        <h3 className="text-sm font-bold text-[#1B2559]">Who outranks you & why</h3>
      </div>
      <p className="mt-1 text-xs text-gray-500">Top 3 competing pages for your niche.</p>

      <div className="mt-3 space-y-2 relative">
        {fakeCompetitors.map((c, idx) => (
          <div key={idx} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
            <span className="w-4 shrink-0 text-xs font-bold text-gray-400">{idx + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 truncate font-medium">{c.name}</p>
            </div>
            <span className="text-xs font-semibold text-gray-400">{c.score}</span>
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-[2px]">
          <div className="text-center">
            <Lock className="mx-auto h-5 w-5 text-gray-400" aria-hidden />
            <p className="mt-1 text-xs font-medium text-gray-600">Locked</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          track("upgrade_clicked", { source: "benchmark_teaser" });
          onUnlock();
        }}
        className="mt-3 flex h-9 w-full items-center justify-center rounded-lg border border-[#4318ff]/30 text-xs font-semibold text-[#4318ff] hover:bg-[#4318ff]/5"
      >
        Unlock benchmark
      </button>
    </section>
  );
}
