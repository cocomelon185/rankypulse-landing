import { Skeleton } from "@/components/ui/skeleton";

export default function AuditResultsLoading() {
  return (
    <div className="audit-results-page audit-bg min-h-screen" style={{ contain: "layout" }}>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <Skeleton className="h-14 w-full max-w-2xl rounded-xl" />
        <div className="mt-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl sm:col-span-1" />
          </div>
          <div className="mt-4 pt-4">
            <Skeleton className="h-4 w-40" />
            <div className="mt-2 space-y-2">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:gap-6">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-[220px] rounded-xl" />
          </div>
          <div className="hidden lg:block lg:w-72 lg:shrink-0">
            <div className="sticky top-24 space-y-3">
              <Skeleton className="h-[220px] rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
