import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
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

const RETURN_TARGETS: Record<string, string> = {
  bookmarks: '/learner/bookmarks',
  lessons: '/learner/lessons',
}

export default async function LearnerLessonPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { from?: string }
}) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) {
    redirect('/learner/lessons?error=not_found')
  }

  const [trial, subscription] = await Promise.all([
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
  ])

  const reason = getAccessReason(subscription, trial)
  if (reason !== 'ok') {
    const target = RETURN_TARGETS[searchParams.from ?? 'lessons'] ?? '/learner/lessons'
    redirect(`${target}?locked=${reason}`)
  }

  const [lesson, materials] = await Promise.all([
    getLessonServer(id),
    listMaterialsServer(id),
  ])
  
  if (!lesson) {
    const target = RETURN_TARGETS[searchParams.from ?? 'lessons'] ?? '/learner/lessons'
    redirect(`${target}?error=not_found`)
  }

  return <LearnerLessonDetail lesson={lesson} materials={materials} />
}