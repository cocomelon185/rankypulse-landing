import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: "#0d0f14" }}
    >
      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/6 blur-[120px]" />
      </div>

      <div className="relative">
        {/* Large ghost 404 */}
        <div
          className="mb-2 font-['Fraunces'] font-bold leading-none"
          style={{ fontSize: "clamp(80px, 18vw, 140px)", color: "rgba(255,255,255,0.04)" }}
          aria-hidden="true"
        >
          404
        </div>

        <h1 className="mb-3 font-['Fraunces'] text-3xl font-bold text-white">
          This page doesn&apos;t exist
        </h1>
        <p className="mb-10 font-['DM_Sans'] text-base text-gray-400">
          But your website&apos;s SEO issues do.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
        >
          Run a free audit →
        </Link>
      </div>
    </main>
  );
}
