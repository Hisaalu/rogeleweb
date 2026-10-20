'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Calendar,
  Eye,
  FileText,
  Loader2,
  User,
} from 'lucide-react'
import { getYoutubeId } from '@/lib/utils'
import {
  listMaterials,
  toggleBookmark,
} from '@/lib/lessons.detail.client'
import { formatFileSize, materialDownloadUrl } from '@/lib/materials'
import type { Lesson, LessonMaterial } from '@/types/lesson'

export function LearnerLessonDetail({ lesson }: { lesson: Lesson }) {
  const [bookmarked, setBookmarked] = useState(lesson.is_bookmarked)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [materials, setMaterials] = useState<LessonMaterial[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    listMaterials(lesson.id).then((list) => {
      if (mounted) {
        setMaterials(list)
        setMaterialsLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [lesson.id])

  async function handleBookmark() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await toggleBookmark(lesson.id)
      setBookmarked(res.bookmarked)
    } catch {
      setError('Could not update bookmark')
    } finally {
      setBusy(false)
    }
  }

  const youtubeId = getYoutubeId(lesson.video_url)

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/learner/lessons"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to Materials
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

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}
        >
          {error}
        </div>
      )}

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        {lesson.title}
      </h1>

      <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen size={14} style={{ color: 'var(--brand-accent)' }} />
          {lesson.subject_name ?? 'General'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <User size={14} style={{ color: 'var(--brand-accent)' }} />
          Tr. {lesson.teacher_name ?? 'Rays of Grace'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye size={14} style={{ color: 'var(--brand-accent)' }} />
          {lesson.views} views
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={14} style={{ color: 'var(--brand-accent)' }} />
          {new Date(lesson.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        {lesson.updated_at &&
        new Date(lesson.updated_at).getTime() -
          new Date(lesson.created_at).getTime() >
          5000 ? (
          <span className="inline-flex items-center gap-1.5">
            <FileText size={14} style={{ color: 'var(--brand-accent)' }} />
            Updated{' '}
            {new Date(lesson.updated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ) : null}
      </div>

      {youtubeId ? (
        <div className="relative overflow-hidden rounded-2xl pb-[56.25%]">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={lesson.title}
            className="absolute inset-0 h-full w-full"
            allowFullScreen
          />
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Lesson Content</h2>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {lesson.content || 'No content available.'}
        </div>
      </div>

      {materialsLoading ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Loading materials...
        </div>
      ) : materials.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Downloadable Materials
          </h2>
          <div className="grid gap-3">
            {materials.map((m) => {
              const url = materialDownloadUrl(m.file_path)
              return (
                <a
                  key={m.id}
                  href={url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-3 rounded-lg px-4 py-3 transition hover:bg-muted sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <FileText
                      size={22}
                      className="shrink-0"
                      style={{ color: 'var(--brand-accent)' }}
                    />
                    <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                      {m.file_name ?? 'Unnamed file'}
                    </span>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatFileSize(m.file_size)}
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-bold sm:self-center"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
                      color: 'var(--brand-accent)',
                    }}
                  >
                    Click to download
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}