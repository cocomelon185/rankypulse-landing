"use client";

import { Card, CircularProgress } from "@/components/horizon";

const sampleIssues = [
  { title: "Meta description missing", severity: "Medium" },
  { title: "Title tag too short", severity: "High" },
  { title: "Open Graph image missing", severity: "Medium" },
  { title: "Canonical URL inconsistent", severity: "Low" },
  { title: "Schema markup incomplete", severity: "Medium" },
];

export function ReportPreviewSection() {
  return (
    <section
      className="py-8 px-4 md:px-8"
      aria-labelledby="report-preview-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="report-preview-heading"
          className="mb-4 text-center text-lg font-semibold text-[#1B2559] md:text-xl"
        >
          See what you get
        </h2>
        <Card
          extra="overflow-hidden border border-gray-200/80 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]"
          default={true}
        >
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start md:gap-8 md:p-8">
            <div className="flex shrink-0 flex-col items-center">
              <CircularProgress percentage={76} size={88} />
              <span className="mt-2 text-xs font-medium text-gray-500">
                Discoverability score
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="mb-3 text-sm font-semibold text-[#1B2559]">
                Sample issues found
              </h4>
              <ul className="space-y-2">
                {sampleIssues.map((issue, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-700">{issue.title}</span>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                        issue.severity === "High"
                          ? "bg-red-100 text-red-700"
                          : issue.severity === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg border border-gray-200/80 bg-gray-50/50 px-4 py-3">
                <p className="text-xs font-medium text-gray-500">
                  How to fix
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  Add a meta description (150–160 chars) that summarizes the
                  page.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
