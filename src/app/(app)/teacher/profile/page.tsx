import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import { getProfileServer } from '@/lib/profile.server'
import type { AdminOverview } from '@/types/admin'
import { TeacherProfileView } from './teacher-profile-view'

export const metadata: Metadata = { title: 'Profile' }
export const dynamic = 'force-dynamic'

export default async function TeacherProfilePage() {
  const session = await getSessionUser()
  if (!session) return null

  const [profile, statsRes] = await Promise.all([
    getProfileServer(),
    serverApiRequest<AdminOverview>('/api/v1/admin/stats').catch(() => null),
  ])

  let totalStudents = 0
  let totalLessons = 0

  if (statsRes) {
    const learners = statsRes.users_by_role?.learner ?? 0
    const externals = statsRes.users_by_role?.external ?? 0
    totalStudents = learners + externals
    totalLessons = statsRes.total_lessons ?? 0
  }

  return (
    <TeacherProfileView 
      profile={profile} 
      totalLessons={totalLessons}
      totalStudents={totalStudents}
    />
  )
}