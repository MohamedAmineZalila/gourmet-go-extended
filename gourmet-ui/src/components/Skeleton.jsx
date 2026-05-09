export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-[#2d3148] rounded-lg ${className}`} />
  )
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card flex flex-col items-center gap-2">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}
