import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAttemptServer, getQuizServer } from '@/lib/quizzes.server'
import { fetchPublicSettings } from '@/lib/settings.server'
import { ResultView } from './result-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: { attemptId: string }
}): Promise<Metadata> {
  const id = Number(params.attemptId)
  if (!Number.isFinite(id)) return { title: 'Results' }

  try {
    const attempt = await getAttemptServer(id)
    const [quiz, settings] = await Promise.all([
      attempt?.quiz_id ? getQuizServer(attempt.quiz_id) : Promise.resolve(null),
      fetchPublicSettings(),
    ])
    const siteTitle = settings['site.browser_title']?.trim() || 'NexaT'
    const quizTitle = quiz?.title?.trim()
    return {
      title: quizTitle ? `Results · ${quizTitle}` : `Results | ${siteTitle}`,
    }
  } catch {
    return { title: 'Results' }
  }
}

export default async function ResultPage({
  params,
}: {
  params: { attemptId: string }
}) {
  const id = Number(params.attemptId)
  if (!Number.isFinite(id)) notFound()

  const attempt = await getAttemptServer(id)
  if (!attempt) notFound()

  return <ResultView attempt={attempt} />
}