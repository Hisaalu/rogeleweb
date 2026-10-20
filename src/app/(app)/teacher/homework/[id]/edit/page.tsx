import { notFound } from 'next/navigation'
import { getHomeworkServer, listAttachmentsServer } from '@/lib/homework.server'
import { listClassesServer, listSubjectsServer } from '@/lib/lessons.server'
import { HomeworkForm } from '../../components/homework-form'

export default async function EditHomeworkPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [hw, classes, subjects, attachments] = await Promise.all([
    getHomeworkServer(id), listClassesServer(), listSubjectsServer(), listAttachmentsServer(id)
  ])
  
  if (!hw) notFound()
  return <HomeworkForm classes={classes} subjects={subjects} mode="edit" initial={hw} initialAttachments={attachments} />
}