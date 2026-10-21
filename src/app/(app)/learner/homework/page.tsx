import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listHomeworksServer } from '@/lib/homework.server'
import { LearnerHomeworkView } from './learner-homework-view'

export const metadata: Metadata = { title: 'My Homework' }
export const dynamic = 'force-dynamic'

export default async function LearnerHomeworkPage() {
  const session = await getSessionUser()
  if (!session) return null

  const allHomeworks = await listHomeworksServer({
    class_id: session.class_id ?? undefined,
  })

  const now = new Date().getTime()
  const HOURS_24 = 24 * 60 * 60 * 1000

  const visibleHomeworks = allHomeworks.filter(hw => {
    const dueDate = new Date(hw.due_date).getTime()
    return dueDate >= (now - HOURS_24)
  })

  return <LearnerHomeworkView homeworks={visibleHomeworks} />
}