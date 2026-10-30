import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getLessonServer,
  listClassesServer,
  listSubjectsServer,
} from '@/lib/lessons.server'
import { LessonForm } from '../../create/lesson-form'
import { ExistingMaterialsPanel } from './existing-materials-panel'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Edit Lesson',
}

export default async function EditLessonPage({
  params,
}: {
  params: { id: string }
}) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [lesson, classes, subjects] = await Promise.all([
    getLessonServer(id),
    listClassesServer(),
    listSubjectsServer(),
  ])
  if (!lesson) notFound()

  return (
    <div className="space-y-6">
      <LessonForm
        classes={classes}
        subjects={subjects}
        mode="edit"
        initial={lesson}
      />
      <ExistingMaterialsPanel lessonId={id} />
    </div>
  )
}