import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getLessonServer, listMaterialsServer } from '@/lib/lessons.server'
import {
  getTrialStatusServer,
  getActiveSubscriptionServer,
} from '@/lib/dashboard.server'
import { getAccessReason } from '@/lib/access'
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

  const [trial, subscription] = await Promise.all([
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
  ])

  const reason = getAccessReason(subscription, trial)
  if (reason !== 'ok') {
    redirect(`/learner/lessons?locked=${reason}`)
  }

  const [lesson, materials] = await Promise.all([
    getLessonServer(id),
    listMaterialsServer(id),
  ])
  if (!lesson) notFound()

  return <LearnerLessonDetail lesson={lesson} materials={materials} />
}