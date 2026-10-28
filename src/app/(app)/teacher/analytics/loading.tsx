export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="h-9 w-48 rounded-lg bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-[340px] rounded-2xl bg-muted" />
        <div className="h-[340px] rounded-2xl bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-[340px] rounded-2xl bg-muted" />
        <div className="h-[340px] rounded-2xl bg-muted" />
      </div>
    </div>
  )
}