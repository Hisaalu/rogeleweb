import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listLearnerHomeworksServer } from '@/lib/homework.server'
import { PremiumGate } from '@/components/premium-gate'
import { ErrorToaster } from '@/components/error-toaster'
import { LearnerHomeworkView } from './learner-homework-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Homework' }

export default async function LearnerHomeworkPage({
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

  const homeworks = await listLearnerHomeworksServer({
    class_id: session.class_id ?? 0,
  })

  return (
    <>
      <ErrorToaster />
      <LearnerHomeworkView homeworks={homeworks} />
      {lockedReason && (
        <PremiumGate open context="homework" reason={lockedReason} />
      )}
    </>
  )
}