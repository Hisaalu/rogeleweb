import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listLearnerHomeworksServer } from '@/lib/homework.server'
import { ErrorToaster } from '@/components/error-toaster'
import { LearnerHomeworkView } from './learner-homework-view'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Homework' }

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

export default async function LearnerHomeworkPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const page = parsePositiveInt(searchParams.page) ?? 1
  const status = searchParams.status

  const result = await listLearnerHomeworksServer({
    class_id: session.class_id ?? 0,
    status,
    page,
  })

  return (
    <>
      <ErrorToaster />
      <LearnerHomeworkView 
        homeworks={result.homeworks} 
        meta={result.meta}
        currentPage={page}
      />
    </>
  )
}