"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card } from "@/components/horizon";
import { SmallTrendChart } from "@/components/charts/SmallTrendChart";
import { DomainSelector } from "./DomainSelector";

export function DashboardClient() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-[#0d0f14] text-white">
      {/* ── Top Bar: Domain Selector ── */}
      <DomainSelector />

      <div className="p-6 flex flex-col gap-6 w-full max-w-[1600px] mx-auto overflow-y-auto overflow-x-hidden h-[calc(100vh-64px)] scrollbar-hide">

        {/* ── First Row: AI Search & SEO Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* AI Search Panel */}
          <Card extra="p-0 border border-white/5 bg-[#13161f] overflow-hidden" default={true}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-[#d946ef] bg-[#d946ef]/10 border border-[#d946ef]/20">AI Search</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 flex items-center gap-1.5"><span className="w-4 h-3 rounded-sm bg-blue-600 block rounded-[2px]" /> United States</span>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Visibility</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full border-4 border-gray-700 border-t-indigo-500 border-l-indigo-500 transform -rotate-45 block"></div>
                    <span className="text-3xl font-bold text-indigo-400 font-serif">0</span>
                  </div>
                </div>
                <div className="flex flex-col text-left sm:text-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mentions</span>
                  <span className="text-3xl font-bold font-serif text-blue-400 mt-1">0</span>
                </div>
                <div className="flex flex-col text-left sm:text-right">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cited pages</span>
                  <span className="text-3xl font-bold font-serif text-sky-400 mt-1">0</span>
                </div>
              </div>
              <div className="flex flex-col divide-y divide-white/5 text-sm text-gray-400">
                {[
                  { label: "ChatGPT", m: 0, c: 0, iconColor: "text-emerald-500" },
                  { label: "AI Overview", m: 0, c: 0, iconColor: "text-blue-500" },
                  { label: "AI Mode", m: 0, c: 0, iconColor: "text-amber-500" },
                  { label: "Gemini", m: 0, c: 0, iconColor: "text-indigo-500" },
                ].map(ai => (
                  <div key={ai.label} className="flex justify-between items-center py-2.5 hover:bg-white/[0.02] cursor-pointer px-2 -mx-2 rounded transition-colors">
                    <span className="flex items-center gap-2 font-medium">
                      <span className={`w-2 h-2 rounded-full bg-current ${ai.iconColor}`}></span> {ai.label}
                    </span>
                    <span className="text-blue-400 font-mono w-16 text-center">{ai.m}</span>
                    <span className="text-sky-400 font-mono w-16 text-right">{ai.c}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Traditional SEO Panel */}
          <Card extra="p-0 border border-white/5 bg-[#13161f] overflow-hidden" default={true}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">SEO</span>
              </div>
              <div className="flex gap-4 text-xs text-gray-500 lg:hidden xl:flex">
                <span>Scope: Root Domain</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-3 bg-blue-600 rounded-[2px] block"></span> United States</span>
                <span>Desktop</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-6 gap-x-4 p-5">
              <div className="flex flex-col cursor-pointer group">
                <span className="text-sm font-bold text-gray-400 group-hover:text-indigo-400 transition-colors">Authority Score</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-4xl font-bold font-serif text-white">0</span>
                </div>
                <span className="text-xs text-gray-500 mt-2">Semrush Rank: <span className="text-blue-400">28.6M</span></span>
              </div>

              <div className="flex flex-col cursor-pointer group">
                <span className="text-sm font-bold text-gray-400 group-hover:text-indigo-400 transition-colors flex justify-between">Organic Traffic <span className="text-gray-600 text-xs">0%</span></span>
                <span className="text-4xl font-bold font-serif text-blue-400 mt-2">0</span>
              </div>

              <div className="flex flex-col cursor-pointer group">
                <span className="text-sm font-bold text-gray-400 group-hover:text-indigo-400 transition-colors flex justify-between">Organic Keywords <span className="text-gray-600 text-xs text-emerald-400">1</span></span>
                <span className="text-4xl font-bold font-serif text-sky-400 mt-2">1</span>
                <div className="mt-2"><SmallTrendChart data={[0, 0, 1, 0, 0, 1, 1]} color="#38bdf8" /></div>
              </div>

              <div className="flex flex-col cursor-pointer group border-t border-white/5 pt-4">
                <span className="text-sm font-bold text-gray-400 group-hover:text-indigo-400 transition-colors flex justify-between">Paid Keywords <span className="text-gray-600 text-xs">0%</span></span>
                <span className="text-4xl font-bold font-serif text-amber-500 mt-2">0</span>
                <span className="text-xs text-gray-500 mt-2">Paid Traffic: <span className="text-amber-500">0</span></span>
              </div>

              <div className="flex flex-col cursor-pointer group border-t border-white/5 pt-4">
                <span className="text-sm font-bold text-gray-400 group-hover:text-indigo-400 transition-colors flex justify-between">Ref. Domains <span className="text-gray-600 text-xs">0%</span></span>
                <span className="text-4xl font-bold font-serif text-emerald-400 mt-2">4</span>
                <span className="text-xs text-gray-500 mt-2">Backlinks: <span className="text-emerald-400">6</span></span>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Second Row: Position Tracking & Site Audit ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Position Tracking Panel (Takes up 2/3 width) */}
          <Card extra="p-0 border border-white/5 bg-[#13161f] overflow-hidden lg:col-span-2 flex flex-col" default={true}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
              <span className="font-bold text-white hover:text-indigo-400 cursor-pointer">Position Tracking</span>
              <span className="text-xs text-gray-500">Updated: 24 hours ago | last 7 days</span>
            </div>
            <div className="p-5 flex flex-col xl:flex-row gap-8 flex-1">
              <div className="flex-1 xl:border-r border-b xl:border-b-0 border-white/5 pb-6 xl:pb-0 xl:pr-8">
                <span className="text-sm font-bold text-gray-400">Visibility</span>
                <span className="text-4xl font-bold font-serif text-blue-400 block mt-2">0%</span>
              </div>

              <div className="flex-[1.5] xl:border-r border-b xl:border-b-0 border-white/5 pb-6 xl:pb-0 xl:pr-8">
                <span className="text-sm font-bold text-gray-400 block mb-3">Keywords</span>
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: "Top 3", v: 0 }, { label: "Top 10", v: 0 }, { label: "Top 20", v: 0 }, { label: "Top 100", v: 0 }].map(g => (
                    <div key={g.label} className="border-b border-blue-500/20 pb-2">
                      <span className="text-xs text-gray-500">{g.label}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full border border-blue-400"></div>
                        <span className="text-xl font-bold text-blue-400 font-serif">{g.v}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">new {g.v} | lost 0</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <span className="text-sm font-bold text-gray-400 block mb-3">Top Keywords</span>
                <div className="text-xs text-gray-500 grid-cols-3 grid pb-2 border-b border-white/5">
                  <span className="col-span-1">Keywords</span>
                  <span className="text-center">Position</span>
                  <span className="text-right">Visibility</span>
                </div>
                <div className="text-sm grid-cols-3 grid py-3 cursor-pointer group">
                  <span className="col-span-1 text-blue-400 truncate group-hover:underline">www.rankypulse...</span>
                  <span className="text-center text-gray-400">-</span>
                  <span className="text-right text-gray-400">0%</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-white/5 bg-[#1a1e2e]/50">
              <button onClick={() => router.push('/position-tracking')} className="text-xs font-bold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors text-white">View full report</button>
            </div>
          </Card>

          {/* Site Audit Panel (Takes up 1/3 width) */}
          <Card extra="p-0 border border-white/5 bg-[#13161f] overflow-hidden flex flex-col" default={true}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
              <span className="font-bold text-white hover:text-indigo-400 cursor-pointer">Site Audit</span>
              <span className="text-xs text-gray-500">Updated: Tue, Feb 3</span>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6">
                <div className="flex flex-col relative items-center justify-center">
                  <span className="text-sm font-bold text-gray-400 mb-2 w-full text-center sm:text-left">Site Health</span>
                  {/* Half donut chart representation */}
                  <div className="w-28 h-14 overflow-hidden relative mt-2">
                    <div className="w-28 h-28 border-[12px] border-blue-400 rounded-full border-b-transparent border-r-transparent transform -rotate-[45deg]"></div>
                  </div>
                  <div className="absolute bottom-0 text-center flex flex-col leading-none">
                    <span className="text-2xl font-bold text-blue-400 font-serif">90%</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-1 scale-90">No changes</span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col gap-6 sm:gap-3 w-full justify-center sm:justify-end">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div> Errors</span>
                    <div className="flex gap-2 items-baseline"><span className="text-2xl font-bold font-serif text-rose-500">2</span> <span className="text-xs text-gray-600">0</span></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div> Warnings</span>
                    <div className="flex gap-2 items-baseline"><span className="text-2xl font-bold font-serif text-amber-500">10</span> <span className="text-xs text-gray-600">0</span></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col pt-4 border-t border-white/5">
                <span className="text-sm font-bold text-gray-400 flex justify-between">Crawled Pages</span>
                <span className="text-3xl font-bold font-serif text-blue-400 my-2">12</span>
                <div className="w-full h-4 rounded overflow-hidden flex">
                  <div className="bg-rose-500 w-[20%] border-r border-[#13161f]"></div>
                  <div className="bg-amber-500 w-[50%] border-r border-[#13161f]"></div>
                  <div className="bg-blue-400 w-[30%]"></div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-white/5 bg-[#1a1e2e]/50">
              <button onClick={() => router.push('/audits')} className="text-xs font-bold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors text-white">View full report</button>
            </div>
          </Card>
        </div>

        {/* ── Banner Action ── */}
        <div className="w-full p-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-[#1a1c2e] to-[#25203f] relative overflow-hidden group hover:border-indigo-500/40 transition-colors shadow-2xl flex items-center my-4">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 tracking-tight">You're optimizing for rankings — now optimize for visibility everywhere.</h2>
            <p className="text-indigo-200/80 mb-6 text-sm">See your SEO and AI search performance in one place, instantly.</p>
            <button className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold tracking-wide px-8 py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all">Start Free Trial</button>
          </div>
          {/* Decorative abstract art */}
          <div className="absolute right-[-100px] top-[-50px] w-96 h-96 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none hidden md:block"></div>
          <div className="absolute right-[10%] top-[40%] hidden xl:flex gap-4 opacity-70 group-hover:transform group-hover:-translate-y-2 transition-transform duration-500">
            <div className="w-24 h-32 rounded-xl bg-white/5 border border-white/10 rotate-12 backdrop-blur-sm p-3">
              <div className="w-full h-2 bg-indigo-500/40 rounded-full mb-2"></div>
              <div className="w-3/4 h-2 bg-white/10 rounded-full"></div>
            </div>
            <div className="w-32 h-40 rounded-xl bg-white/10 border border-white/20 -rotate-6 backdrop-blur-md z-10 p-4 shadow-2xl shadow-black/50">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Domain Analytics</span>
              <span className="text-3xl font-bold font-serif text-blue-400 block pb-2 border-b border-white/10">74 <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded ml-1 font-sans mt-0 absolute">Good</span></span>
            </div>
            <div className="w-24 h-32 rounded-xl bg-amber-500/5 border border-amber-500/10 rotate-[20deg] backdrop-blur-sm p-3 mt-4">

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
