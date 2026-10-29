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

  const currentPage = meta.page
  const totalPages = meta.last_page
  const delta = 2
  
  const range = []
  for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
    range.push(i)
  }
  
  if (currentPage - delta > 2) range.unshift('...')
  if (currentPage + delta < totalPages - 1) range.push('...')

  const pages = [1, ...range, totalPages].filter(
    (item, index, arr) => arr.indexOf(item) === index
  )

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
      {meta.page > 1 && (
        <Link
          href={href(meta.page - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-brand-accent hover:text-brand-primary"
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      {pages.map((p, i) => {
        if (p === '...') {
          return (
            <span key={`ellipsis-${i}`} className="flex h-10 w-10 items-center justify-center text-muted-foreground">
              ...
            </span>
          )
        }
        return (
          <Link
            key={p}
            href={href(p as number)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition hover:bg-muted"
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
        )
      })}

      {meta.page < totalPages && (
        <Link
          href={href(meta.page + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-brand-accent hover:text-brand-primary"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  )
}