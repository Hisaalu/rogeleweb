'use client'

import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import type { Lesson } from '@/types/lesson'
import { LearnerLessonCard } from '../lessons/components/learner-lesson-card'
import { toggleLessonBookmarkClient } from '@/lib/lessons.client'
import { useState, useCallback } from 'react'

export function BookmarksView({ lessons: initial }: { lessons: Lesson[] }) {
  const [lessons, setLessons] = useState(initial)

  const handleToggle = useCallback(async (id: number): Promise<boolean> => {
    const res = await toggleLessonBookmarkClient(id)
    if (!res.bookmarked) {
      setLessons((prev) => prev.filter((l) => l.id !== id))
    }
    return res.bookmarked
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center">
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
            Bookmarks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Lessons you&apos;ve saved.</p>
      </div>

      {lessons.length === 0 ? (
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
            No bookmarks yet
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            Tap the bookmark icon on any lesson to save it here.
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LearnerLessonCard
              key={lesson.id}
              lesson={{ ...lesson, is_bookmarked: true }}
              onToggleBookmark={handleToggle}
              from="bookmarks"
            />
          ))}
        </div>
      )}
    </div>
  )
}