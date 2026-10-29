'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Clock,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  Paperclip,
  Pencil,
  User,
} from 'lucide-react'
import { getYoutubeId, formatNumber, formatDate } from '@/lib/utils'
import { toggleLessonBookmarkClient } from '@/lib/lessons.client'
import { formatFileSize, materialDownloadUrl } from '@/lib/materials'
import { useToast } from '@/components/ui/toast-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Lesson, LessonMaterial } from '@/types/lesson'

const accentIcon = { color: 'var(--brand-accent)' } as const
const bookmarkOn = {
  backgroundColor: 'var(--brand-accent)',
  borderColor: 'var(--brand-accent)',
  color: 'white',
} as const
const bookmarkOff = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: 'hsl(var(--muted-foreground))',
} as const
const downloadBadgeBg = {
  backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
} as const

function isRealEdit(createdAt: string, updatedAt?: string | null): boolean {
  if (!updatedAt) return false
  const created = new Date(createdAt).getTime()
  const updated = new Date(updatedAt).getTime()
  if (!Number.isFinite(created) || !Number.isFinite(updated)) return false
  return updated - created > 5000
}

export function LearnerLessonDetail({
  lesson,
  materials,
}: {
  lesson: Lesson
  materials: LessonMaterial[]
}) {
  const { showToast } = useToast()
  const [bookmarked, setBookmarked] = useState(lesson.is_bookmarked)
  const [busy, setBusy] = useState(false)

  const youtubeId = getYoutubeId(lesson.video_url)
  const edited = isRealEdit(lesson.created_at, lesson.updated_at)

  async function handleBookmark() {
    if (busy) return
    setBusy(true)
    try {
      const res = await toggleLessonBookmarkClient(lesson.id)
      setBookmarked(res.bookmarked)
      showToast(
        res.bookmarked ? 'Added to bookmarks' : 'Removed from bookmarks',
        res.bookmarked ? 'success' : 'info',
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not update bookmark'
      showToast(message, 'error', { title: 'Action failed' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-3 py-5 sm:space-y-6 sm:px-4 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/learner/lessons"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to Lessons
        </Link>

        <Button
          type="button"
          variant="outline"
          onClick={handleBookmark}
          disabled={busy}
          className="rounded-full"
          style={bookmarked ? bookmarkOn : bookmarkOff}
          title={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          )}
          <span className="hidden sm:inline">
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </span>
        </Button>
      </div>

      <Card className="p-4 sm:p-6">
        <h1 className="break-words text-xl font-bold text-foreground sm:text-2xl">
          {lesson.title}
        </h1>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1">
            <GraduationCap size={14} style={accentIcon} />
            {lesson.class_name ?? 'All Levels'}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen size={14} style={accentIcon} />
            {lesson.subject_name ?? 'General'}
          </span>
          <span className="inline-flex items-center gap-1">
            <User size={14} style={accentIcon} />
            Tr. {lesson.teacher_name ?? 'Rays of Grace'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye size={14} style={accentIcon} />
            {formatNumber(lesson.views)} views
          </span>
          <span className="inline-flex items-center gap-1">
            <Paperclip size={14} style={accentIcon} />
            {lesson.materials_count} file{lesson.materials_count === 1 ? '' : 's'}
          </span>
          {lesson.duration ? (
            <span className="inline-flex items-center gap-1">
              <Clock size={14} style={accentIcon} />
              {lesson.duration} min
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Published {formatDate(lesson.created_at)}
          {edited && lesson.updated_at ? (
            <>
              {' · '}
              <span className="inline-flex items-center gap-1 font-medium text-brand-accent">
                <Pencil size={12} />
                Updated {formatDate(lesson.updated_at)}
              </span>
            </>
          ) : null}
        </p>
      </Card>

      {youtubeId ? (
        <Card className="aspect-video overflow-hidden p-0">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            loading="lazy"
          />
        </Card>
      ) : null}

      {lesson.content ? (
        <Card className="p-4 sm:p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
            Lesson content
          </h2>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {lesson.content}
          </p>
        </Card>
      ) : null}

      {materials.length > 0 ? (
        <Card className="p-4 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
            <Paperclip size={16} style={accentIcon} />
            Downloadable materials
          </h2>
          <ul className="space-y-2">
            {materials.map((m) => {
              const href = materialDownloadUrl(m.file_path)
              const name = m.file_name ?? 'Unnamed file'
              return (
                <li key={m.id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="group flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3 text-sm transition hover:border-brand-accent hover:bg-muted sm:flex-row sm:items-center sm:gap-3 sm:p-3.5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <FileText size={18} style={accentIcon} className="shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(m.file_size)}
                        </p>
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center justify-center gap-1.5 self-stretch rounded-md px-3 py-1.5 text-xs font-semibold text-brand-accent transition group-hover:bg-brand-accent group-hover:text-white sm:self-auto"
                      style={downloadBadgeBg}
                    >
                      <Download size={13} />
                      Download
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}