import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Book,
  Clock,
  Pencil,
  Eye,
  FileText,
  GraduationCap,
  Paperclip,
  Video,
} from 'lucide-react'
import { getLessonServer, listMaterialsServer } from '@/lib/lessons.server'
import { getYoutubeId, formatDate } from '@/lib/utils'
import { formatFileSize, materialDownloadUrl } from '@/lib/materials'

export const metadata: Metadata = {
  title: 'Preview Lesson',
}

export default async function LessonPreviewPage({
  params,
}: {
  params: { id: string }
}) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [lesson, materials] = await Promise.all([
    getLessonServer(id),
    listMaterialsServer(id),
  ])
  if (!lesson) notFound()

  const youtubeId = getYoutubeId(lesson.video_url)
  const isRealEdit =
    lesson.updated_at &&
    new Date(lesson.updated_at).getTime() -
      new Date(lesson.created_at).getTime() >
      5000

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Eye size={22} style={{ color: 'var(--brand-accent)' }} />
          <span style={{ color: 'var(--brand-primary)' }}>Lesson Preview</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/teacher/lessons/${lesson.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <Pencil size={15} />
            Edit Lesson
          </Link>
          <Link
            href="/teacher/lessons"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
        </div>
      </div>

      <div className="relative rounded-2xl border border-border bg-card p-6 sm:p-10">
        <span
          className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: 'var(--brand-accent)' }}
        >
          Preview Mode
        </span>

        <h2 className="mb-4 pr-24 text-2xl font-bold text-foreground">
          {lesson.title}
        </h2>

        <div className="mb-6 flex flex-wrap gap-5 border-b border-border pb-5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap size={14} style={{ color: 'var(--brand-accent)' }} />
            {lesson.class_name ?? 'NA'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Book size={14} style={{ color: 'var(--brand-accent)' }} />
            {lesson.subject_name ?? 'NA'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} style={{ color: 'var(--brand-accent)' }} />
            {lesson.duration ?? 30} min
          </span>
          <span
            className="rounded-full px-3 py-0.5 text-xs font-semibold"
            style={
              lesson.is_published
                ? { backgroundColor: '#F0FDF4', color: '#166534' }
                : {
                    backgroundColor: 'hsl(var(--muted))',
                    color: 'hsl(var(--muted-foreground))',
                  }
            }
          >
            {lesson.is_published ? 'Published' : 'Draft'}
          </span>
          {isRealEdit ? (
            <span className="inline-flex items-center gap-1.5">
              <Pencil size={14} style={{ color: 'var(--brand-accent)' }} />
              Last edited {formatDate(lesson.updated_at!)}
            </span>
          ) : null}
        </div>

        {youtubeId ? (
          <section className="mb-8">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <Video size={16} style={{ color: 'var(--brand-accent)' }} />
              Video
            </h3>
            <div className="relative overflow-hidden rounded-xl pb-[56.25%]">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={lesson.title}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        <section className="mb-8">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <FileText size={16} style={{ color: 'var(--brand-accent)' }} />
            Lesson Content
          </h3>
          <div className="whitespace-pre-wrap rounded-xl bg-muted px-5 py-4 text-sm leading-relaxed text-foreground">
            {lesson.content || 'No content yet.'}
          </div>
        </section>

        {materials.length > 0 ? (
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <Paperclip size={16} style={{ color: 'var(--brand-accent)' }} />
              Materials
            </h3>
            <div className="space-y-2">
              {materials.map((m) => (
                <a
                  key={m.id}
                  href={materialDownloadUrl(m.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3 text-sm transition hover:bg-muted/70"
                >
                  <FileText
                    size={16}
                    style={{ color: 'var(--brand-accent)' }}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {m.file_name ?? 'Unnamed file'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(m.file_size)}
                  </span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}