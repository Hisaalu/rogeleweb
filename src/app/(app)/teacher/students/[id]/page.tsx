import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { serverApiRequest } from '@/lib/server-api'
import { StudentProgressView } from './student-progress-view'

export const metadata: Metadata = { title: 'Student Progress' }
export const dynamic = 'force-dynamic'

async function fetchPython(endpoint: string, params: Record<string, string> = {}) {
  const search = new URLSearchParams(params).toString()
  const url = `http://localhost:9000/analytics/${endpoint}${search ? `?${search}` : ''}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function StudentProgressPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [data, atRiskData] = await Promise.all([
    serverApiRequest<any>(`/api/v1/admin/users/${id}/details`).catch(() => null),
    fetchPython('at-risk-learners', { limit: '100' }).catch(() => null)
  ])

  if (!data || !data.user) notFound()

  return (
    <StudentProgressView 
      student={data.user} 
      attempts={data.attempts || []} 
      atRiskData={atRiskData} 
    />
  )
}