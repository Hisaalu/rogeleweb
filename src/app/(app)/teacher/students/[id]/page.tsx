import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { serverApiRequest } from '@/lib/server-api'
import { StudentProgressView } from './student-progress-view'

export const metadata: Metadata = { title: 'Student Progress' }
export const dynamic = 'force-dynamic'

export default async function StudentProgressPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  let data: any = null
  try {
    data = await serverApiRequest<any>(`/api/v1/admin/users/${id}/details`)
  } catch {
    data = null
  }

  if (!data || !data.user) notFound()

  return <StudentProgressView student={data.user} attempts={data.attempts || []} />
}