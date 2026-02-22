import Link from "next/link";

export function FinalCTASection() {
  return (
    <section className="bg-[#1B2559] relative overflow-hidden py-14 px-4 md:px-8 lg:py-16" aria-labelledby="final-cta-heading">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 id="final-cta-heading" className="mb-4 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
          Start improving your rankings today — free
        </h2>
        <p className="mb-6 text-base text-white/90 md:text-lg">
          Your first audit takes 30 seconds. Your growth starts immediately.
        </p>
        <Link
          href="/audit"
          className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-10 text-base font-semibold text-[#4318ff] shadow-xl transition-all hover:bg-gray-100"
        >
          Run your first audit
        </Link>
      </div>
    </section>
  );
}
