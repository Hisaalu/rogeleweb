import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { getTeacherDashboardDataServer } from '@/lib/teacher-dashboard.server'
import { serverApiRequest } from '@/lib/server-api'
import type { User } from '@/types/api'
import { TeacherDashboardView } from './teacher-dashboard-view'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function TeacherDashboardPage() {
  const session = await getSessionUser()
  if (!session) return null

  const [profile, data] = await Promise.all([
    serverApiRequest<User>('/api/v1/auth/me').catch(() => null),
    getTeacherDashboardDataServer().catch(() => ({
      totalLessons: 0,
      totalQuizzes: 0,
      totalStudents: 0,
      averageScore: 0,
      recentLessons: [],
      recentQuizzes: [],
    })),
  ])

  return <TeacherDashboardView profile={profile} data={data} />
}