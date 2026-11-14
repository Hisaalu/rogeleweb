'use client'

import Link from 'next/link'
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { Lesson } from '@/types/lesson'
import { LearnerLessonCard } from '../lessons/components/learner-lesson-card'
import { toggleLessonBookmarkClient } from '@/lib/lessons.client'

interface BookmarksMeta {
  page: number
  per_page: number
  total: number
  last_page: number
}

export function BookmarksView({
  lessons,
  meta,
  currentPage,
}: {
  lessons: Lesson[]
  meta: BookmarksMeta
  currentPage: number
}) {
  const pathname = usePathname()
  const params = useSearchParams()
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set())

  const handleToggle = useCallback(async (id: number): Promise<boolean> => {
    const res = await toggleLessonBookmarkClient(id)
    setRemovedIds((prev) => {
      const next = new Set(prev)
      if (res.bookmarked) next.delete(id)
      else next.add(id)
      return next
    })
    return res.bookmarked
  }, [])

  const visible = lessons.filter((l) => !removedIds.has(l.id))

  function pageHref(targetPage: number): string {
    const sp = new URLSearchParams(params.toString())
    if (targetPage > 1) sp.set('page', String(targetPage))
    else sp.delete('page')
    const qs = sp.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const hasPrev = currentPage > 1
  const hasNext = currentPage < meta.last_page

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Library</h1>
        {meta.total > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            Your {meta.total} saved lesson{meta.total === 1 ? '' : 's'}
          </p>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div
            className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--brand-accent) 12%, transparent)',
            }}
          >
            <Bookmark size={40} style={{ color: 'var(--brand-accent)' }} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">
            No lessons yet
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            Tap the Library icon on any lesson to add it to your library.
          </p>
          <Link
            href="/learner/lessons"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            Browse lessons
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((lesson) => (
              <LearnerLessonCard
                key={lesson.id}
                lesson={{ ...lesson, is_bookmarked: true }}
                onToggleBookmark={handleToggle}
                from="bookmarks"
              />
            ))}
          </div>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href={pageHref(Math.max(1, currentPage - 1))}
                aria-disabled={!hasPrev}
                className={
                  !hasPrev
                    ? 'pointer-events-none inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground opacity-50'
                    : 'inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition hover:bg-muted'
                }
              >
                <ChevronLeft size={14} /> Previous
              </Link>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {meta.last_page}
              </span>
              <Link
                href={pageHref(Math.min(meta.last_page, currentPage + 1))}
                aria-disabled={!hasNext}
                className={
                  !hasNext
                    ? 'pointer-events-none inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground opacity-50'
                    : 'inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition hover:bg-muted'
                }
              >
                Next <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}