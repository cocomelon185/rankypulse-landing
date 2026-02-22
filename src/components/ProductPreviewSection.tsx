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
    <section className="py-14 px-4 md:px-8 bg-[#f8fafc]" aria-labelledby="product-preview-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="product-preview-heading" className="mb-3 text-center text-2xl font-bold text-[#1B2559] md:text-3xl">
          Your SEO command center
        </h2>
        <p className="mx-auto mb-6 max-w-2xl text-center text-base text-gray-600 md:text-lg">
          Track issues, prioritize fixes, and monitor improvements — all in one place.
        </p>
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
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden />
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
          <div className="border-t border-gray-200 bg-white p-6">
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
