import { cn } from "../lib/utils";

function Skeleton({ className, ...props }) {
  return <div data-slot="skeleton" className={cn("", className)} {...props} />;
}

function ProductCardSkeleton() {
  return (
    <div className="border-border space-y-4 rounded-xl border p-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export { Skeleton, ProductCardSkeleton, ProductGridSkeleton };
