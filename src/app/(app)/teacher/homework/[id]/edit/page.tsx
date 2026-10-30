import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getHomeworkServer, listAttachmentsServer } from '@/lib/homework.server'
import { listClassesServer, listSubjectsServer } from '@/lib/lessons.server'
import { fetchPublicSettings } from '@/lib/settings.server'
import { HomeworkForm } from '../../components/homework-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await fetchPublicSettings()
    const siteTitle = settings['site.browser_title']?.trim() || 'NexaT'
    return { title: `Edit Homework | ${siteTitle}` }
  } catch {
    return { title: 'Edit Homework' }
  }
}

export default async function EditHomeworkPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [hw, classes, subjects, attachments] = await Promise.all([
    getHomeworkServer(id), listClassesServer(), listSubjectsServer(), listAttachmentsServer(id)
  ])
  
  if (!hw) notFound()
  return <HomeworkForm classes={classes} subjects={subjects} mode="edit" initial={hw} initialAttachments={attachments} />
}