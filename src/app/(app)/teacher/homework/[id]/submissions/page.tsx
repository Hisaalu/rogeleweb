import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getHomeworkServer, listSubmissionsServer } from '@/lib/homework.server'
import { fetchPublicSettings } from '@/lib/settings.server'
import { SubmissionsView } from './submissions-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  try {
    await fetchPublicSettings()
    return { title: `Submissions` }
  } catch {
    return { title: 'Submissions' }
  }
}

export default async function HomeworkSubmissionsPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { q?: string }
}) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [hw, submissions] = await Promise.all([
    getHomeworkServer(id),
    listSubmissionsServer(id),
  ])
  if (!hw) notFound()

  return (
    <SubmissionsView
      homework={hw}
      submissions={submissions}
      initialQuery={searchParams.q ?? ''}
    />
  )
}