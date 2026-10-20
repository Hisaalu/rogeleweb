import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { getTeacherDashboardDataServer } from '@/lib/teacher-dashboard.server'
import { serverApiRequest } from '@/lib/server-api'
import type { User } from '@/types/api'
import { TeacherDashboardView } from './teacher-dashboard-view'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function TeacherDashboardPage() {
  const session = await getSessionUser()
  if (!session) return null

  let profile: User | null = null
  try {
    profile = await serverApiRequest<User>('/api/v1/auth/me')
  } catch {
    profile = null
  }

  const data = await getTeacherDashboardDataServer(session.id)
  return <TeacherDashboardView profile={profile} data={data} />
}