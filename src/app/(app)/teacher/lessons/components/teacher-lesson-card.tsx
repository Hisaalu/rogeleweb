'use client'

import Link from 'next/link'
import {
  BookOpen,
  Clock,
  Eye,
  GraduationCap,
  Paperclip,
  Calendar,
  Pencil,
  Trash2,
} from 'lucide-react'
import { getYoutubeId, truncate, formatNumber, formatDate } from '@/lib/utils'
import type { Lesson } from '@/types/lesson'

export function TeacherLessonCard({
  lesson,
  onDelete,
  onPublishToggle,
}: {
  lesson: Lesson
  onDelete: (id: number) => void
  onPublishToggle: (id: number, published: boolean) => void
}) {
  const youtubeId = getYoutubeId(lesson.video_url)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className="relative h-[180px] overflow-hidden"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        {youtubeId ? (
          <img
            src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
            alt={lesson.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen size={56} className="text-white opacity-50" />
          </div>
        )}

        {lesson.duration ? (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white">
            <Clock size={11} />
            {lesson.duration} min
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => onPublishToggle(lesson.id, !lesson.is_published)}
          className="absolute right-2.5 top-2.5 rounded-full px-3 py-1 text-xs font-semibold text-white transition hover:opacity-80"
          style={{
            backgroundColor: lesson.is_published ? 'var(--success-border)' : 'var(--brand-accent)',
          }}
        >
          {lesson.is_published ? 'Published' : 'Draft'}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2.5 line-clamp-2 text-base font-semibold text-foreground">
          {lesson.title}
        </h3>

        <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <GraduationCap size={13} style={{ color: 'var(--brand-accent)' }} />
            {lesson.class_name ?? 'All Classes'}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen size={13} style={{ color: 'var(--brand-accent)' }} />
            {lesson.subject_name ?? 'General'}
          </span>
        </div>

        {lesson.content ? (
          <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {truncate(lesson.content, 120)}
          </p>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 border-y border-border py-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Eye size={12} style={{ color: 'var(--brand-accent)' }} />
            {formatNumber(lesson.views)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Paperclip size={12} style={{ color: 'var(--brand-accent)' }} />
            {lesson.materials_count}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} style={{ color: 'var(--brand-accent)' }} />
            {formatDate(lesson.created_at)}
          </span>
          {lesson.updated_at ? (
            <span className="inline-flex items-center gap-1">
              <Pencil size={12} style={{ color: 'var(--brand-accent)' }} />
              {formatDate(lesson.updated_at)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex gap-2">
          <Link
            href={`/teacher/lessons/${lesson.id}/edit`}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:opacity-80"
            style={{
              backgroundColor: 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
            }}
            title="Edit lesson"
          >
            <Pencil size={15} />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(lesson.id)}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:opacity-80"
            style={{
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger-fg)',
            }}
            title="Delete lesson"
          >
            <Trash2 size={15} />
          </button>
          <Link
            href={`/teacher/lessons/${lesson.id}/preview`}
            target="_blank"
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            Preview
          </Link>
        </div>
      </div>
    </div>
  )
}