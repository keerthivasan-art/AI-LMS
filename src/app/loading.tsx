import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col space-y-6 p-8 bg-background">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b pb-4">
        <Skeleton className="h-8 w-36" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-12 w-3/4 max-w-2xl rounded-lg" />
        <Skeleton className="h-6 w-1/2 max-w-lg rounded-md" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-6xl mx-auto w-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-xl space-y-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
