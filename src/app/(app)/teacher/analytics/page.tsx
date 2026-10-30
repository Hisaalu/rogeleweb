import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import { getLearnersByClassServer } from '@/lib/admin.server'
import { AnalyticsView } from './analytics-view'
import type { TeacherOverview } from '@/lib/analytics.client'

export const metadata: Metadata = { title: 'Analytics' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ANALYTICS_URL = process.env.ANALYTICS_API_URL ?? 'http://localhost:9000'

async function fetchPython<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T | null> {
  const search = new URLSearchParams(params).toString()
  const url = `${ANALYTICS_URL}/analytics/${endpoint}${search ? `?${search}` : ''}`
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function dateWindow(rangeDays: number) {
  const toDate = new Date()
  const fromDate = new Date(toDate.getTime() - rangeDays * 24 * 60 * 60 * 1000)
  return {
    from: fromDate.toISOString().split('T')[0],
    to: toDate.toISOString().split('T')[0],
  }
}

export default async function TeacherAnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const range = Number(searchParams.range) || 30
  const { from, to } = dateWindow(range)

  const [statsRes, lessonsRes, classCountsRes, enrollment, atRisk, teacherOverview] =
    await Promise.all([
      serverApiRequest<any>('/api/v1/admin/stats').catch(() => null),
      serverApiRequest<any>('/api/v1/lessons?per_page=5&sort=-views').catch(() => []),
      getLearnersByClassServer().catch(() => []),
      fetchPython<any>('enrollment-trend', { from, to, interval: 'day' }),
      fetchPython<any>('at-risk-learners', { limit: '50' }),
      fetchPython<TeacherOverview>('teacher-overview', { teacher_id: String(session.id) }),
    ])

  const stats = statsRes || {}
  const lessons = Array.isArray(lessonsRes) ? lessonsRes : (lessonsRes?.data || [])
  const classCounts = Array.isArray(classCountsRes) ? classCountsRes : []

  return (
    <AnalyticsView
      stats={stats}
      lessons={lessons}
      classCounts={classCounts}
      initialEnrollment={enrollment}
      initialAtRisk={atRisk}
      initialTeacherOverview={teacherOverview}
      initialRange={String(range)}
    />
  )
}