'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { LessonListMeta } from '@/types/lesson'

export function Pagination({ meta }: { meta: LessonListMeta }) {
  const params = useSearchParams()

  function href(page: number): string {
    const sp = new URLSearchParams(params.toString())
    if (page <= 1) sp.delete('page')
    else sp.set('page', String(page))
    const qs = sp.toString()
    return `/teacher/lessons${qs ? `?${qs}` : ''}`
  }

  if (meta.last_page <= 1) return null

  const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1)

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {meta.page > 1 && (
        <Link
          href={href(meta.page - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-brand-accent"
        >
          <ChevronLeft size={15} />
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition"
          style={
            p === meta.page
              ? {
                  backgroundColor: 'var(--brand-primary)',
                  borderColor: 'var(--brand-primary)',
                  color: 'white',
                }
              : {
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }
          }
        >
          {p}
        </Link>
      ))}

      {meta.page < meta.last_page && (
        <Link
          href={href(meta.page + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-brand-accent"
        >
          <ChevronRight size={15} />
        </Link>
      )}
    </div>
  )
}