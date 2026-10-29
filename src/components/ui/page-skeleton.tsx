import { cn } from '@/lib/utils'

export function PageSkeleton({ 
  variant = 'grid',
  className 
}: { 
  variant?: 'grid' | 'list' | 'dashboard'
  className?: string 
}) {
  return (
    <div className={cn("mx-auto max-w-7xl animate-pulse space-y-6 px-4 py-6 sm:px-6 sm:py-8", className)}>
      <div className="space-y-3">
        <div className="h-8 w-48 rounded-lg bg-muted sm:h-10 sm:w-64" />
        <div className="h-4 w-64 rounded-lg bg-muted/60" />
      </div>

      {variant === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-[340px] rounded-2xl bg-muted" />
            <div className="h-[340px] rounded-2xl bg-muted" />
          </div>
          <div className="h-[240px] rounded-2xl bg-muted" />
        </>
      )}

      {variant === 'grid' && (
        <>
          <div className="h-16 w-full rounded-2xl bg-muted" /> 
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted" />
            ))}
          </div>
        </>
      )}

      {variant === 'list' && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />
                <div className="h-6 flex-1 rounded-lg bg-muted" />
                <div className="h-8 w-24 shrink-0 rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}