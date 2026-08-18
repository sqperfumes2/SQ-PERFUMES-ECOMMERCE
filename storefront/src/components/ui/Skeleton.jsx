export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden border border-border bg-charcoal">
      <div className="aspect-[4/5] bg-elevated" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-elevated" />
        <div className="h-4 w-2/3 rounded bg-elevated" />
        <div className="h-3 w-1/2 rounded bg-elevated" />
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="container-site section-pad animate-pulse py-10">
      <div className="mb-8 h-8 w-48 rounded bg-elevated" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
