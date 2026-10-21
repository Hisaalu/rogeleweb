import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import type { AdminOverview } from '@/types/admin'
import { AnalyticsView } from './analytics-view'

export const metadata: Metadata = { title: 'Analytics' }
export const dynamic = 'force-dynamic'

export default async function TeacherAnalyticsPage({ searchParams }: { searchParams: { range?: string } }) {
  const session = await getSessionUser()
  if (!session) return null

  const range = searchParams.range ?? '30'

  let stats: AdminOverview | null = null
  try {
    stats = await serverApiRequest<AdminOverview>('/api/v1/admin/stats')
  } catch {
    stats = null
  }

  let quizzes: any[] = []
  let lessons: any[] = []
  
  try {
    const res = await serverApiRequest<unknown>('/api/v1/quizzes?per_page=100')
    if (Array.isArray(res)) quizzes = res
  } catch {}
  
  try {
    const res = await serverApiRequest<unknown>('/api/v1/lessons?per_page=100')
    if (Array.isArray(res)) lessons = res
  } catch {}

  return (
    <AnalyticsView 
      stats={stats} 
      quizzes={quizzes} 
      lessons={lessons} 
      initialRange={range}
    />
  )
}