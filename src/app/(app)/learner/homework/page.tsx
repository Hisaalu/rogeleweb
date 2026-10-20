import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listHomeworksServer } from '@/lib/homework.server'
import { LearnerHomeworkView } from './learner-homework-view'

export const metadata: Metadata = { title: 'My Homework' }
export const dynamic = 'force-dynamic'

export default async function LearnerHomeworkPage() {
  const session = await getSessionUser()
  if (!session) return null

  const homeworks = await listHomeworksServer({
    class_id: session.class_id ?? undefined,
  })

  return <LearnerHomeworkView homeworks={homeworks} />
}