'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const QUICK_RANGES = [
  { label: '7D', days: 7 },
  { label: '2W', days: 14 },
  { label: '4W', days: 28 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
] as const

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10)
}

function rangeFor(days: number) {
  const to = new Date()
  const from = new Date(to.getTime() - days * 86400000)
  return { from: isoDay(from), to: isoDay(to) }
}

function matchesRange(activeFrom: string, activeTo: string, days: number) {
  const r = rangeFor(days)
  return r.from === activeFrom && r.to === activeTo
}

export function DateFilterBar({ busy }: { busy: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const currentFrom = searchParams.get('from') ?? ''
  const currentTo = searchParams.get('to') ?? ''

  const [fromInput, setFromInput] = useState(currentFrom)
  const [toInput, setToInput] = useState(currentTo)

  useEffect(() => {
    setFromInput(currentFrom)
    setToInput(currentTo)
  }, [currentFrom, currentTo])

  const activeDays = useMemo(() => {
    for (const r of QUICK_RANGES) {
      if (matchesRange(currentFrom, currentTo, r.days)) return r.days
    }
    return null
  }, [currentFrom, currentTo])

  const navigate = (from: string, to: string) => {
    const params = new URLSearchParams()
    params.set('from', from)
    params.set('to', to)
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false })
    })
  }

  const isLoading = busy || pending

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar size={12} /> From
          </label>
          <Input
            type="date"
            value={fromInput}
            max={toInput || undefined}
            onChange={(e) => setFromInput(e.target.value)}
            onBlur={() => {
              if (fromInput && toInput && fromInput !== currentFrom) {
                navigate(fromInput, toInput)
              }
            }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar size={12} /> To
          </label>
          <Input
            type="date"
            value={toInput}
            min={fromInput || undefined}
            onChange={(e) => setToInput(e.target.value)}
            onBlur={() => {
              if (fromInput && toInput && toInput !== currentTo) {
                navigate(fromInput, toInput)
              }
            }}
          />
        </div>
        <div className="ml-auto flex flex-wrap gap-1">
          {QUICK_RANGES.map((r) => {
            const isActive = activeDays === r.days
            return (
              <button
                key={r.label}
                type="button"
                onClick={() => {
                  const { from, to } = rangeFor(r.days)
                  navigate(from, to)
                }}
                className={cn(
                  'rounded-sm border px-3 py-1.5 text-xs font-medium transition',
                  isActive
                    ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                    : 'border-border bg-card text-foreground hover:border-brand-accent',
                )}
                aria-pressed={isActive}
              >
                {r.label}
              </button>
            )
          })}
        </div>
        {isLoading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
      </div>
    </Card>
  )
}