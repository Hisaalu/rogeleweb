import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listLearnerHomeworksServer } from '@/lib/homework.server'
import { ErrorToaster } from '@/components/error-toaster'
import { LearnerHomeworkView } from './learner-homework-view'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Homework' }

export default async function LearnerHomeworkPage() {
  const session = await getSessionUser()
  if (!session) return null

  const homeworks = await listLearnerHomeworksServer({
    class_id: session.class_id ?? 0,
  })

  return (
    <>
      <ErrorToaster />
      <LearnerHomeworkView homeworks={homeworks} />
    </>
  )
}