'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarEvent } from '@/types/dashboard'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function EventCalendar({
  events,
  selectedDate,
  onDaySelect,
}: {
  events: CalendarEvent[]
  selectedDate: string | null
  onDaySelect: (dateKey: string | null) => void
}) {
  const today = new Date()
  const [current, setCurrent] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      if (!e.date) continue
      const key = e.date.slice(0, 10)
      const list = map.get(key) ?? []
      list.push(e)
      map.set(key, list)
    }
    return map
  }, [events])

  const cells = useMemo(() => {
    const year = current.getFullYear()
    const month = current.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const lastDay = new Date(year, month + 1, 0).getDate()
    const out: Array<{ day: number | null; key: string | null }> = []
    for (let i = 0; i < firstDay; i++) out.push({ day: null, key: null })
    for (let d = 1; d <= lastDay; d++) {
      out.push({ day: d, key: toKey(new Date(year, month, d)) })
    }
    return out
  }, [current])

  function changeMonth(delta: number) {
    setCurrent((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  function handleDayClick(dayKey: string, dayEvents: CalendarEvent[]) {
    if (dayEvents.length === 1) {
      window.location.href = dayEvents[0].url
      return
    }
    onDaySelect(selectedDate === dayKey ? null : dayKey)
    const feed = document.getElementById('dashboard-event-feed')
    if (feed) {
      feed.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h4
          className="text-sm font-bold"
          style={{ color: 'var(--brand-primary)' }}
        >
          {MONTHS[current.getMonth()]} {current.getFullYear()}
        </h4>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-brand-accent"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-brand-accent"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {cells.map((cell, i) => {
          if (!cell.day || !cell.key) return <div key={i} />
          const dayEvents = eventsByDate.get(cell.key) ?? []
          const hasEvents = dayEvents.length > 0
          const isToday = cell.key === toKey(today)
          const isSelected = cell.key === selectedDate

          const style: React.CSSProperties = {
            padding: '8px 0',
            borderRadius: '6px',
            color: 'hsl(var(--muted-foreground))',
            position: 'relative',
          }

          if (hasEvents) {
            style.backgroundColor =
              'color-mix(in srgb, var(--brand-accent) 15%, transparent)'
            style.color = 'var(--brand-accent)'
            style.fontWeight = 700
            style.border = '1px solid var(--brand-accent)'
            style.cursor = 'pointer'
          }

          if (isToday) {
            style.backgroundColor = 'var(--brand-primary)'
            style.color = 'white'
            style.fontWeight = 700
          }

          if (isSelected && !isToday) {
            style.outline = '2px solid var(--brand-primary)'
            style.outlineOffset = '1px'
          }

          return (
            <button
              type="button"
              key={i}
              onClick={() => handleDayClick(cell.key!, dayEvents)}
              disabled={!hasEvents}
              aria-pressed={isSelected}
              title={
                hasEvents
                  ? dayEvents.length === 1
                    ? dayEvents[0].title
                    : `${dayEvents.length} events — click to filter`
                  : undefined
              }
              style={style}
            >
              {cell.day}
              {hasEvents && dayEvents.length > 1 && (
                <span
                  className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: 'var(--brand-accent)' }}
                >
                  {dayEvents.length}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}