'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { CalendarEvent } from '@/types/dashboard'

function monthShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
}

function dayNum(iso: string): string {
  return String(new Date(iso).getDate()).padStart(2, '0')
}

export function EventFeed({ events }: { events: CalendarEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  return (
    <div className="flex flex-col">
      <h4 className="mb-4 text-sm font-semibold text-foreground">
        Upcoming Deadlines &amp; Events
      </h4>

      {sorted.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">
          No scheduled events or deadlines at the moment.
        </p>
      ) : (
        <div className="flex max-h-[280px] flex-col gap-3 overflow-y-auto pr-1">
          {sorted.map((e) => (
            <Link
              key={e.id}
              href={e.url || '#'}
              className="flex gap-3 rounded-lg border border-border bg-card p-3 transition hover:translate-x-1"
              style={{ borderLeft: '4px solid var(--brand-accent)' }}
            >
              <div
                className="flex min-w-[50px] shrink-0 flex-col items-center justify-center rounded-lg px-3 py-2"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--brand-accent) 12%, transparent)',
                }}
              >
                <span
                  className="text-xs font-bold uppercase"
                  style={{ color: 'var(--brand-accent)' }}
                >
                  {monthShort(e.date)}
                </span>
                <span
                  className="text-base font-bold leading-tight"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  {dayNum(e.date)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="mb-1 truncate text-sm font-semibold text-foreground">
                  {e.title}
                </h5>
                <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={11} />
                  {e.time}
                </span>
                <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  Subject: {e.subject ?? 'General'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}