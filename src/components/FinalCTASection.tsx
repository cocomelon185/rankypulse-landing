import Link from "next/link";

export function FinalCTASection() {
  return (
    <section
      className="relative overflow-hidden bg-[#1B2559] py-10 px-4 md:px-8 lg:py-12"
      aria-labelledby="final-cta-heading"
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2
          id="final-cta-heading"
          className="mb-3 text-2xl font-bold text-white md:text-3xl"
        >
          Your first audit is free. Your next step is clear.
        </h2>
        <p className="mb-5 text-base text-white/90 md:text-lg">
          30 seconds to your action plan. No signup required.
        </p>
        <Link
          href="/audit"
          className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-10 text-base font-semibold text-[#4318ff] shadow-xl transition-all hover:bg-gray-100"
          aria-label="Run your free SEO audit"
        >
          Run My Free Audit
        </Link>
      </div>
    </section>
  );
}
