'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Clock,
  Eye,
  GraduationCap,
  Loader2,
  Paperclip,
  User,
} from 'lucide-react'
import { getYoutubeId, formatNumber, formatDate } from '@/lib/utils'
import { toggleLessonBookmarkClient } from '@/lib/lessons.client'
import type { Lesson } from '@/types/lesson'
import { ToastViewport, type ToastMessage, type ToastTone } from '@/components/ui/toast'

export function LearnerLessonDetail({ lesson }: { lesson: Lesson }) {
  const [bookmarked, setBookmarked] = useState(lesson.is_bookmarked)
  const [busy, setBusy] = useState(false)
  
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const pushToast = (message: string, tone: ToastTone) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, tone }])
  }
  const closeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const youtubeId = getYoutubeId(lesson.video_url)

  async function handleBookmark() {
    if (busy) return
    setBusy(true)
    try {
      const res = await toggleLessonBookmarkClient(lesson.id)
      setBookmarked(res.bookmarked)
      pushToast(
        res.bookmarked ? 'Added to bookmarks' : 'Removed from bookmarks',
        'success',
      )
    } catch {
      pushToast('Could not update bookmark', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/learner/lessons"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to Lessons
        </Link>

        <button
          type="button"
          onClick={handleBookmark}
          disabled={busy}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition disabled:opacity-60"
          style={{
            backgroundColor: bookmarked ? 'var(--brand-accent)' : 'hsl(var(--card))',
            borderColor: bookmarked ? 'var(--brand-accent)' : 'hsl(var(--border))',
            color: bookmarked ? 'white' : 'hsl(var(--muted-foreground))',
          }}
          title={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
          {busy ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
          )}
        </button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <GraduationCap size={14} style={{ color: 'var(--brand-accent)' }} />
              {lesson.class_name ?? 'All Levels'}
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen size={14} style={{ color: 'var(--brand-accent)' }} />
              {lesson.subject_name ?? 'General'}
            </span>
            <span className="inline-flex items-center gap-1">
              <User size={14} style={{ color: 'var(--brand-accent)' }} />
              Tr. {lesson.teacher_name ?? 'Rays of Grace'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={14} style={{ color: 'var(--brand-accent)' }} />
              {formatNumber(lesson.views)} views
            </span>
            <span className="inline-flex items-center gap-1">
              <Paperclip size={14} style={{ color: 'var(--brand-accent)' }} />
              {lesson.materials_count} file{lesson.materials_count === 1 ? '' : 's'}
            </span>
            {lesson.duration ? (
              <span className="inline-flex items-center gap-1">
                <Clock size={14} style={{ color: 'var(--brand-accent)' }} />
                {lesson.duration} min
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Published {formatDate(lesson.created_at)}
          </p>
        </div>
      </header>

      {youtubeId ? (
        <div className="aspect-video overflow-hidden rounded-2xl border border-border">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : null}

      {lesson.content ? (
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Lesson content
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {lesson.content}
          </p>
        </article>
      ) : null}
      
      <ToastViewport toasts={toasts} onClose={closeToast} />
    </div>
  )
}