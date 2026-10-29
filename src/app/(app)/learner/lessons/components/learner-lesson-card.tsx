'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  BookOpen, Bookmark, Clock, Eye, GraduationCap, Paperclip,
  User, ArrowRight, Loader2,
} from 'lucide-react'
import { getYoutubeId, truncate, formatNumber } from '@/lib/utils'
import { useToast } from '@/components/ui/toast-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Lesson } from '@/types/lesson'

export function LearnerLessonCard({
  lesson,
  onToggleBookmark,
  from,
}: {
  lesson: Lesson
  onToggleBookmark: (id: number) => Promise<boolean>
  from?: string
}) {
  const { showToast } = useToast()
  const [bookmarked, setBookmarked] = useState(lesson.is_bookmarked)
  const [busy, setBusy] = useState(false)

  const youtubeId = getYoutubeId(lesson.video_url)

  async function handleBookmark(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      const result = await onToggleBookmark(lesson.id)
      setBookmarked(result)
      if (result) {
        showToast('Lesson bookmarked', 'success', { title: 'Saved for later' })
      } else {
        showToast('Removed from bookmarks', 'info')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not update bookmark'
      showToast(message, 'error', { title: 'Bookmark update failed' })
    } finally {
      setBusy(false)
    }
  }

  const href = from
    ? `/learner/lessons/${lesson.id}?from=${encodeURIComponent(from)}`
    : `/learner/lessons/${lesson.id}`

  return (
    <Card className="group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-[180px] overflow-hidden" style={{ backgroundColor: 'var(--brand-primary)' }}>
        {youtubeId ? (
          <img src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`} alt={lesson.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen size={56} className="text-white opacity-40" />
          </div>
        )}

        {lesson.duration ? (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1 text-xs text-white">
            <Clock size={11} /> {lesson.duration} min
          </span>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBookmark}
          disabled={busy}
          title={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          className="absolute right-2.5 top-2.5 rounded-full shadow-md"
          style={{
            backgroundColor: bookmarked ? 'var(--brand-accent)' : 'hsl(var(--card))',
            color: bookmarked ? 'white' : 'hsl(var(--muted-foreground))',
          }}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />}
        </Button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-3 text-base font-semibold leading-snug text-foreground">{lesson.title}</h3>

        <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><GraduationCap size={13} style={{ color: 'var(--brand-accent)' }} /> {lesson.class_name ?? 'All Levels'}</span>
          <span className="inline-flex items-center gap-1"><BookOpen size={13} style={{ color: 'var(--brand-accent)' }} /> {lesson.subject_name ?? 'General'}</span>
          <span className="inline-flex items-center gap-1"><User size={13} style={{ color: 'var(--brand-accent)' }} /> Tr. {lesson.teacher_name ?? 'Rays of Grace'}</span>
        </div>

        {lesson.content ? (
          <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">{truncate(lesson.content, 150)}</p>
        ) : (
          <div className="mb-5 flex-1" />
        )}

        <div className="mb-5 flex gap-5 border-y border-border py-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Eye size={13} style={{ color: 'var(--brand-accent)' }} /> {formatNumber(lesson.views)}</span>
          <span className="inline-flex items-center gap-1.5"><Paperclip size={13} style={{ color: 'var(--brand-accent)' }} /> {lesson.materials_count} file{lesson.materials_count === 1 ? '' : 's'}</span>
        </div>

        <Link href={href} className="mt-auto">
          <Button className="w-full">
            <span>Start Learning</span> <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </Card>
  )
}