import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLessonServer, listMaterialsServer } from '@/lib/lessons.server'
import { LearnerLessonDetail } from './learner-lesson-detail'

export const metadata: Metadata = {
  title: 'Lesson',
}

export default async function LearnerLessonPage({
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

  return <LearnerLessonDetail lesson={lesson} materials={materials} />
}