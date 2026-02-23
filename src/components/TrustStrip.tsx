import { Check } from "lucide-react";

const trustBullets = [
  "Agency-grade SEO checks",
  "Actionable fixes in minutes",
  "Built for founders & teams",
];

export function TrustStrip() {
  return (
    <section className="py-5 px-4 md:px-8" aria-label="Trust signals">
      <div className="mx-auto max-w-4xl">
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-gray-600 sm:gap-x-6 sm:text-sm md:flex-nowrap md:gap-x-10">
          {trustBullets.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
