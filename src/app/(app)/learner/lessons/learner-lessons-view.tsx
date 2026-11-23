'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { BookOpen, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Subject } from '@/types/admin'
import type { Lesson } from '@/types/lesson'
import {
  toggleLessonBookmarkClient,
  getBookmarkCountClient,
} from '@/lib/lessons.client'
import { PageHeader } from '@/components/layout/page-header'
import { LearnerFilters } from './components/learner-filters'
import { LearnerLessonCard } from './components/learner-lesson-card'

interface LessonsMeta {
  page: number
  per_page: number
  total: number
  last_page: number
}

export function LearnerLessonsView({
  lessons,
  subjects,
  bookmarkCount: initialCount,
  meta,
  currentPage,
}: {
  lessons: Lesson[]
  subjects: Subject[]
  bookmarkCount: number
  meta: LessonsMeta
  currentPage: number
}) {
  const pathname = usePathname()
  const params = useSearchParams()
  const [bookmarkCount, setBookmarkCount] = useState(initialCount)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleToggleBookmark = useCallback(async (lessonId: number) => {
    const res = await toggleLessonBookmarkClient(lessonId)
    setBookmarkCount((prev) => Math.max(0, prev + (res.bookmarked ? 1 : -1)))

    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(async () => {
      try {
        const fresh = await getBookmarkCountClient()
        setBookmarkCount(fresh)
      } catch {
        // keep optimistic value
      }
    }, 1500)

    return res.bookmarked
  }, [])

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
    <>
      <PageHeader
        title="Lessons"
        fallbackHref="/learner/dashboard"
        action={
          <Link
            href="/learner/bookmarks"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:border-brand-accent hover:bg-muted sm:px-4 sm:py-2 sm:text-sm"
          >
            <Bookmark size={14} style={{ color: 'var(--brand-accent)' }} />
            <span>Library</span>
            <span
              className="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold text-white tabular-nums"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {bookmarkCount}
            </span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <LearnerFilters subjects={subjects} />

        {lessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <div
              className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--brand-accent) 12%, transparent)',
              }}
            >
              <BookOpen size={40} style={{ color: 'var(--brand-accent)' }} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              No Lessons Found
            </h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
              We couldn&apos;t find any lessons matching your criteria. Try
              adjusting your search or check back later!
            </p>
            <Link
              href="/learner/bookmarks"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <Bookmark size={15} /> View Library
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => (
                <LearnerLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onToggleBookmark={handleToggleBookmark}
                  from="lessons"
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
    </>
  )
}