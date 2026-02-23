"use client";

import { Card } from "@/components/horizon";

type Checks = {
  fetch_ok?: boolean;
  https?: boolean;
  title_present?: boolean;
  meta_description_present?: boolean;
  h1_present?: boolean;
  canonical_present?: boolean;
  robots_noindex?: boolean;
  images_missing_alt?: number;
};

type Issue = {
  id?: string;
  title?: string;
  msg?: string;
  severity?: string;
};

export function ScoreBreakdown({
  score,
  checks,
  issues,
}: {
  score: number;
  checks?: Checks;
  issues?: Issue[];
}) {
  const items: Array<{ label: string; ok: boolean; points: number }> = [
    { label: "HTTPS enabled", ok: !!checks?.https, points: 10 },
    { label: "Title tag present", ok: !!checks?.title_present, points: 10 },
    { label: "Meta description present", ok: !!checks?.meta_description_present, points: 10 },
    { label: "H1 present", ok: !!checks?.h1_present, points: 10 },
    { label: "Robots allows indexing", ok: !checks?.robots_noindex, points: 10 },
    { label: "Images have alt text", ok: (checks?.images_missing_alt ?? 0) === 0, points: 10 },
    { label: "Canonical tag present", ok: !!checks?.canonical_present, points: 10 },
  ];

  const canonicalMissing =
    (issues || []).some((i) => (i.id || "").toLowerCase().includes("canonical")) ||
    !checks?.canonical_present;

  const deductions: Array<{ label: string; points: number }> = [];
  if (canonicalMissing) deductions.push({ label: "Missing canonical", points: 10 });

  const earned = items.reduce((sum, x) => sum + (x.ok ? x.points : 0), 0);
  const lost = deductions.reduce((sum, x) => sum + x.points, 0);

  return (
    <Card extra="p-6 md:p-8" default={true}>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-[#1B2559]">How your score was calculated</h3>
        <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
          Score: {score} / 100
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Transparent breakdown of what helped your score and what reduced it.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((x) => (
          <div
            key={x.label}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
              x.ok ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  x.ok ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {x.ok ? "✓" : "—"}
              </span>
              <span className="text-sm font-semibold text-gray-800">{x.label}</span>
            </div>
            <span className={`text-sm font-bold ${x.ok ? "text-green-700" : "text-gray-500"}`}>
              {x.ok ? `+${x.points}` : "+0"}
            </span>
          </div>
        ))}
      </div>

      {deductions.length > 0 && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50/30 p-4">
          <div className="text-sm font-bold text-red-700">Deductions</div>
          <div className="mt-2 space-y-2">
            {deductions.map((d) => (
              <div key={d.label} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                <span className="text-sm font-semibold text-gray-800">{d.label}</span>
                <span className="text-sm font-bold text-red-700">-{d.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-gray-700">Earned:</span>
          <span className="rounded-full bg-white px-3 py-1 font-bold text-gray-900">{earned}</span>
          <span className="font-semibold text-gray-700">Lost:</span>
          <span className="rounded-full bg-white px-3 py-1 font-bold text-gray-900">{lost}</span>
          <span className="font-semibold text-gray-700">Final:</span>
          <span className="rounded-full bg-white px-3 py-1 font-bold text-[#4318ff]">{score}</span>
        </div>
      </div>
    </Card>
  );
}
