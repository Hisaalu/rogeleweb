import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listQuizzesServer, listMyAttemptsServer } from '@/lib/quizzes.server'
import { PremiumGate } from '@/components/premium-gate'
import { LearnerQuizzesView } from './learner-quizzes-view'

export const metadata: Metadata = { title: 'Practice Quizzes' }
export const dynamic = 'force-dynamic'

export default async function LearnerQuizzesPage({
  searchParams,
}: {
  searchParams: { locked?: string }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const lockedReason =
    searchParams.locked === 'trial_expired' ||
    searchParams.locked === 'no_plan'
      ? searchParams.locked
      : null

  const [quizzes, attempts] = await Promise.all([
    listQuizzesServer({ class_id: session.class_id ?? undefined }),
    listMyAttemptsServer(),
  ])

    return (
    <>
      <LearnerQuizzesView quizzes={quizzes} attempts={attempts} />
      {lockedReason && (
        <PremiumGate open context="quiz" reason={lockedReason} />
      )}
    </>
  )
}