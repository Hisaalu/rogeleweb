import { notFound } from 'next/navigation'
import { getHomeworkServer, listSubmissionsServer } from '@/lib/homework.server'
import { fetchPublicSettings } from '@/lib/settings.server.public'
import { SubmissionsView } from './submissions-view'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const siteTitle = settings['site.browser_title'] || 'NexaT'
  return { title: `Submissions` }
}

export default async function HomeworkSubmissionsPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [hw, submissions] = await Promise.all([getHomeworkServer(id), listSubmissionsServer(id)])
  if (!hw) notFound()

  return <SubmissionsView homework={hw} submissions={submissions} />
}