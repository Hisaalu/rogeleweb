'use client'

import Link from 'next/link'
import { Clock, X } from 'lucide-react'
import type { CalendarEvent } from '@/types/dashboard'

function monthShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
}

function dayNum(iso: string): string {
  return String(new Date(iso).getDate()).padStart(2, '0')
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

export function EventFeed({
  events,
  selectedDate,
  onClearFilter,
}: {
  events: CalendarEvent[]
  selectedDate: string | null
  onClearFilter: () => void
}) {
  const filtered = selectedDate
    ? events.filter((e) => dayKey(e.date) === selectedDate)
    : events

  const sorted = [...filtered].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const headerLabel = selectedDate
    ? `Events on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}`
    : 'Upcoming Deadlines & Events'

  return (
    <div id="dashboard-event-feed" className="flex w-full flex-col scroll-mt-24">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <h4 className="truncate text-sm font-semibold text-foreground sm:text-base">
          {headerLabel}
        </h4>
        {selectedDate && (
          <button
            type="button"
            onClick={onClearFilter}
            aria-label="Clear date filter"
            className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center sm:h-auto sm:min-h-[240px]">
          <p className="text-sm italic text-muted-foreground">
            {selectedDate
              ? 'No events scheduled for this date.'
              : 'No scheduled events or deadlines at the moment.'}
          </p>
        </div>
      ) : (
        <div className="h-[320px] overflow-y-auto pr-2 sm:h-auto sm:flex-1">
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {sorted.map((e) => (
              <Link
                key={e.id}
                href={e.url || '#'}
                className="group flex w-full gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-brand-accent hover:shadow-md"
                style={{ borderLeft: '4px solid var(--brand-accent)' }}
              >
                <div
                  className="flex min-w-[50px] shrink-0 flex-col items-center justify-center rounded-lg px-1.5 py-1 sm:min-w-[54px] sm:px-2 sm:py-1.5"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
                  }}
                >
                  <span className="text-[9px] font-bold uppercase sm:text-[10px]" style={{ color: 'var(--brand-accent)' }}>
                    {monthShort(e.date)}
                  </span>
                  <span className="text-base font-extrabold leading-none sm:text-lg" style={{ color: 'var(--brand-primary)' }}>
                    {dayNum(e.date)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="mb-0.5 truncate text-sm font-semibold text-foreground transition group-hover:text-brand-accent sm:mb-1">
                    {e.title}
                  </h5>
                  <span className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground sm:mb-1.5 sm:text-xs">
                    <Clock size={11} className="shrink-0 sm:size-3" />
                    {e.time}
                  </span>
                  <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground sm:px-2 sm:text-[10px]">
                    {e.subject ?? 'General'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}