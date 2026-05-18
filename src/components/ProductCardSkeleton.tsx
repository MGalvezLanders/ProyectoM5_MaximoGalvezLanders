export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-cream-50 border border-sepia-300 rounded-xl overflow-hidden shadow-warm-sm animate-pulse"
    >
      <div className="aspect-square bg-cream-200" />

      <div className="p-4 flex flex-col gap-3">
        <div className="h-5 bg-cream-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-cream-200 rounded w-full" />
          <div className="h-3 bg-cream-200 rounded w-5/6" />
        </div>

        <div className="flex items-end justify-between pt-2 border-t border-sepia-300/60">
          <div className="space-y-1.5">
            <div className="h-2.5 bg-cream-200 rounded w-12" />
            <div className="h-6 bg-cream-200 rounded w-20" />
          </div>
          <div className="h-8 w-20 bg-cream-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
