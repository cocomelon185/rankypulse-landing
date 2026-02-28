export default function AuditDomainLoading() {
  return (
    <div className="audit-dark min-h-screen">
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main skeleton */}
          <div className="space-y-6">
            {/* Hero skeleton */}
            <div className="audit-card animate-pulse p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div className="h-6 w-48 rounded-lg bg-white/[0.06]" />
                <div className="h-4 w-32 rounded bg-white/[0.06]" />
              </div>
              <div className="mt-8 flex flex-col items-center">
                <div className="h-[240px] w-[240px] rounded-full bg-white/[0.04]" />
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="audit-card h-20 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Radar skeleton */}
            <div className="audit-card animate-pulse p-6 md:p-8">
              <div className="h-5 w-36 rounded bg-white/[0.06]" />
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="h-[320px] rounded-xl bg-white/[0.04]" />
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 rounded-lg bg-white/[0.04]" />
                  ))}
                </div>
              </div>
            </div>

            {/* Findings skeleton */}
            <div className="animate-pulse">
              <div className="h-5 w-28 rounded bg-white/[0.06]" />
              <div className="mt-4 grid gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-6 w-24 rounded bg-white/[0.06]" />
                    <div className="audit-card-elevated h-32 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="hidden lg:block">
            <div className="space-y-4">
              <div className="audit-card animate-pulse p-5">
                <div className="h-4 w-24 rounded bg-white/[0.06]" />
                <div className="mt-3 h-16 rounded-lg bg-white/[0.04]" />
                <div className="mt-3 h-2 rounded-full bg-white/[0.06]" />
                <div className="mt-4 h-10 rounded-lg bg-white/[0.06]" />
              </div>
              <div className="audit-card animate-pulse p-5">
                <div className="h-4 w-20 rounded bg-white/[0.06]" />
                <div className="mt-3 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-5 rounded bg-white/[0.04]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
