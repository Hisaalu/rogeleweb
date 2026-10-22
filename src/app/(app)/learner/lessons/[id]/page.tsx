import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLessonServer, listMaterialsServer } from '@/lib/lessons.server'
import { getTrialStatusServer, getActiveSubscriptionServer } from '@/lib/dashboard.server'
import { hasAccess } from '@/lib/access'
import { UpgradePrompt } from '@/components/upgrade-prompt'
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
  if (!hasAccess(subscription, trial)) {
    return <UpgradePrompt title="Lesson Locked" description="Subscribe to a plan to access learning materials, videos, and downloadable files." />
  }

  const [lesson, materials] = await Promise.all([
    getLessonServer(id),
    listMaterialsServer(id),
  ])
  if (!lesson) notFound()

  return <LearnerLessonDetail lesson={lesson} materials={materials} />
}