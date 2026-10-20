import { notFound } from 'next/navigation'
import { getHomeworkServer, listSubmissionsServer } from '@/lib/homework.server'
import { SubmissionsView } from './submissions-view'

export default async function HomeworkSubmissionsPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [hw, submissions] = await Promise.all([getHomeworkServer(id), listSubmissionsServer(id)])
  if (!hw) notFound()

  return <SubmissionsView homework={hw} submissions={submissions} />
}