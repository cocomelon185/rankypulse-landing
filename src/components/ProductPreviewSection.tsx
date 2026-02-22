"use client";

import { Card, CircularProgress } from "@/components/horizon";
import { LineAreaChart } from "@/components/charts/LineAreaChart";

const issues = [
  "Meta description missing",
  "Title too short",
  "No Open Graph image",
  "Schema markup incomplete",
];

const actionItems = [
  { label: "Add meta description", done: false },
  { label: "Expand title to 55 chars", done: false },
  { label: "Add og:image", done: true },
];

export function ProductPreviewSection() {
  return (
    <section className="section-padding bg-gradient-to-b from-white to-gray-50 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#1B2559] md:text-4xl">
            Live product preview
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            See what your SEO dashboard looks like
          </p>
        </div>
        <Card extra="overflow-hidden border-2 border-gray-200/80 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]" default={true}>
          <div className="grid gap-8 p-8 md:grid-cols-3 md:p-10">
            <div className="flex flex-col items-center border-r border-gray-200 pr-8">
              <CircularProgress percentage={76} title="Discoverability" size={140} />
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-[#1B2559]">Issues found</h4>
              <ul className="space-y-3">
                {issues.map((issue, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-[#1B2559]">Action plan</h4>
              <div className="space-y-3">
                {actionItems.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl p-3 text-sm ${
                      item.done ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.done ? "✓" : "○"} {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 bg-gray-50/50 p-6">
            <p className="mb-4 text-sm font-semibold text-[#1B2559]">Score trend</p>
            <LineAreaChart
              series={[{ name: "Discoverability", data: [62, 65, 68, 72, 74, 76, 76] }]}
              categories={["6d ago", "5d", "4d", "3d", "2d", "1d", "Today"]}
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
