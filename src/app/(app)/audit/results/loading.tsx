import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/layout/PageLayout";

export default function AuditResultsLoading() {
  return (
    <PageLayout>
      <div className="space-y-8">
        <div>
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-5 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </PageLayout>
  );
}
