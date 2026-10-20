import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLessonServer } from '@/lib/lessons.server'
import { listMaterials } from '@/lib/lessons.mutations'
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

  const lesson = await getLessonServer(id)
  if (!lesson) notFound()

  return <LearnerLessonDetail lesson={lesson} />
}