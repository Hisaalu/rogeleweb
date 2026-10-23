import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import { getLearnersByClassServer } from '@/lib/admin.server'
import { AnalyticsView } from './analytics-view'

export const metadata: Metadata = { title: 'Analytics' }
export const dynamic = 'force-dynamic'

const PYTHON_URL = process.env.ANALYTICS_API_URL ?? 'http://localhost:9000'

async function fetchPython(endpoint: string, params: Record<string, string> = {}) {
  const search = new URLSearchParams(params).toString()
  const url = `${PYTHON_URL}/analytics/${endpoint}${search ? `?${search}` : ''}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function TeacherAnalyticsPage({ 
  searchParams 
}: { 
  searchParams: { range?: string } 
}) {
  const session = await getSessionUser()
  if (!session) return null

  const range = searchParams.range ?? '30'
  const fromDate = new Date(Date.now() - Number(range) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const toDate = new Date().toISOString().split('T')[0]

  const [statsRes, lessonsRes, classCountsRes, enrollment, atRisk, scores] = await Promise.all([
    serverApiRequest<any>('/api/v1/admin/stats').catch(() => null),
    serverApiRequest<any>('/api/v1/lessons?per_page=100').catch(() => []),
    getLearnersByClassServer().catch(() => []),
    fetchPython('enrollment-trend', { from: fromDate, to: toDate, interval: 'day' }),
    fetchPython('at-risk-learners', { limit: '50' }),
    fetchPython('score-distribution'),
  ])

  const stats = statsRes || {}
  const lessons = Array.isArray(lessonsRes) ? lessonsRes : (lessonsRes?.data || [])
  const classCounts = Array.isArray(classCountsRes) ? classCountsRes : []

  return (
    <AnalyticsView 
      stats={stats}
      lessons={lessons}
      classCounts={classCounts}
      enrollment={enrollment}
      atRisk={atRisk}
      scores={scores}
      initialRange={range}
    />
  )
}