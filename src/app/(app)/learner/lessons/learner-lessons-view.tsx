'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Bookmark } from 'lucide-react'
import type { Subject } from '@/types/admin'
import type { Lesson } from '@/types/lesson'
import { getBookmarkCountClient, toggleLessonBookmarkClient } from '@/lib/lessons.client'
import { LearnerHeader } from './components/learner-header'
import { LearnerFilters } from './components/learner-filters'
import { LearnerLessonCard } from './components/learner-lesson-card'

export function LearnerLessonsView({
  lessons: initialLessons,
  subjects,
  bookmarkCount: initialCount,
}: {
  lessons: Lesson[]
  subjects: Subject[]
  bookmarkCount: number
}) {
  const [lessons, setLessons] = useState(initialLessons)
  const [bookmarkCount, setBookmarkCount] = useState(initialCount)

  useEffect(() => {
    setLessons(initialLessons)
  }, [initialLessons])

  const handleToggleBookmark = useCallback(
    async (lessonId: number) => {
      try {
        const res = await toggleLessonBookmarkClient(lessonId)
        const next = await getBookmarkCountClient()
        setBookmarkCount(next)
        return res.bookmarked
      } catch (err) {
        throw err
      }
    },
    [],
  )

  return (
    <div className="space-y-6">
      <LearnerHeader bookmarkCount={bookmarkCount} />

      <LearnerFilters subjects={subjects} />

      {lessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)' }}>
            <BookOpen size={40} style={{ color: 'var(--brand-accent)' }} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">No Lessons Found</h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">We couldn&apos;t find any lessons matching your criteria. Try adjusting your search or check back later!</p>
          <Link href="/learner/bookmarks" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <Bookmark size={15} /> View Bookmarks
          </Link>
        </div>
      ) : (
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
      )}
    </div>
  )
}