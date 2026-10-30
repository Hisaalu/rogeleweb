import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listQuizzesServer, listMyAttemptsServer } from '@/lib/quizzes.server'
import { PremiumGate } from '@/components/premium-gate'
import { ErrorToaster } from '@/components/error-toaster'
import { LearnerQuizzesView } from './learner-quizzes-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Practice Quizzes' }

export default async function LearnerQuizzesPage({
  searchParams,
}: {
  searchParams: { locked?: string; error?: string; page?: string }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const lockedReason =
    searchParams.locked === 'trial_expired' ||
    searchParams.locked === 'no_plan'
      ? searchParams.locked
      : null

  const page = Number(searchParams.page)
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1

  const [{ quizzes }, attempts] = await Promise.all([
    listQuizzesServer({
      class_id: session.class_id ?? undefined,
      page: safePage,
      per_page: 12,
    }),
    listMyAttemptsServer(),
  ])

  return (
    <>
      <ErrorToaster />
      <LearnerQuizzesView quizzes={quizzes} attempts={attempts} />
      {lockedReason && (
        <PremiumGate open context="quiz" reason={lockedReason} />
      )}
    </>
  )
}