import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Users, GraduationCap, Book, Calendar, Paperclip, Download, Eye, FileText } from 'lucide-react'
import { getHomeworkServer, listAttachmentsServer } from '@/lib/homework.server'
import { materialDownloadUrl, formatFileSize } from '@/lib/materials'
import { fetchPublicSettings } from '@/lib/settings.server.public'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await fetchPublicSettings()
    const siteTitle = settings['site.browser_title']?.trim() || 'NexaT'
    return { title: `Preview Homework | ${siteTitle}` }
  } catch {
    return { title: 'Preview Homework' }
  }
}

export default async function PreviewHomeworkPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [hw, attachments] = await Promise.all([getHomeworkServer(id), listAttachmentsServer(id)])
  if (!hw) notFound()

  const isExpired = new Date(hw.due_date).getTime() < new Date().getTime()

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/teacher/homework" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Homework
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-foreground">
            <Eye size={24} style={{ color: 'var(--brand-primary)' }} /> Preview Homework
          </h1>
        </div>
        <div className="flex gap-2">
          <Link 
            href={`/teacher/homework/${hw.id}/edit`} 
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
            style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}
          >
            <Edit size={15} /> Edit
          </Link>
          <Link 
            href={`/teacher/homework/${hw.id}/submissions`} 
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" 
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <Users size={15} /> Submissions
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <h2 className="text-2xl font-bold text-foreground">{hw.title}</h2>
          <span 
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={{
              backgroundColor: isExpired ? 'var(--danger-bg)' : 'var(--success-bg)',
              color: isExpired ? 'var(--danger-fg)' : 'var(--success-fg)'
            }}
          >
            {isExpired ? 'Expired' : 'Active'}
          </span>
        </div>

        <div className="mb-8 grid gap-4 rounded-xl bg-muted p-5 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <GraduationCap size={24} style={{ color: 'var(--brand-accent)' }} />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Class</p>
              <p className="font-semibold">{hw.class_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Book size={24} style={{ color: 'var(--brand-accent)' }} />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Subject</p>
              <p className="font-semibold">{hw.subject_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={24} style={{ color: 'var(--brand-accent)' }} />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Due Date</p>
              <p className="font-semibold">{new Date(hw.due_date).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <FileText size={18} style={{ color: 'var(--brand-accent)' }} /> Description & Instructions
          </h3>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {hw.description || 'No detailed instructions provided.'}
          </div>
        </div>

        {attachments.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Paperclip size={18} style={{ color: 'var(--brand-accent)' }} /> Attached Materials
            </h3>
            <div className="space-y-2">
              {attachments.map(a => (
                <a 
                  key={a.id} 
                  href={materialDownloadUrl(a.file_path)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm transition hover:border-brand-accent"
                >
                  <Download size={16} style={{ color: 'var(--brand-accent)' }} />
                  <span className="flex-1 font-medium text-foreground">{a.file_name}</span>
                  <span className="text-xs text-muted-foreground">({formatFileSize(a.file_size)})</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}