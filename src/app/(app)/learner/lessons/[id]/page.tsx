import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getLessonServer, listMaterialsServer } from '@/lib/lessons.server'
import {
  getTrialStatusServer,
  getActiveSubscriptionServer,
} from '@/lib/dashboard.server'
import { LearnerLessonDetail } from './learner-lesson-detail'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Lesson' }

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

  const [lesson, materials] = await Promise.all([
    getLessonServer(id),
    listMaterialsServer(id),
  ])

  if (!lesson) {
    const target =
      RETURN_TARGETS[searchParams.from ?? 'lessons'] ?? '/learner/lessons'
    redirect(`${target}?error=not_found`)
  }

  const hasActiveSubscription = subscription?.status === 'active'
  const inActiveTrial = !!trial?.is_in_trial
  const canDownload = hasActiveSubscription || inActiveTrial

  const gateReason: 'trial_expired' | 'no_plan' | null = canDownload
    ? null
    : trial?.end_date && (trial.days_remaining ?? 0) <= 0
      ? 'trial_expired'
      : 'no_plan'

  return (
    <LearnerLessonDetail
      lesson={lesson}
      materials={materials}
      gateReason={gateReason}
    />
  )
}