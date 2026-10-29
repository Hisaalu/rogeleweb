import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { getProfileServer } from '@/lib/profile.server'
import { getTeacherCountsServer } from '@/lib/teacher-dashboard.server'
import { TeacherProfileView } from './teacher-profile-view'

export const metadata: Metadata = { title: 'Profile' }
export const dynamic = 'force-dynamic'

export default async function TeacherProfilePage() {
  const session = await getSessionUser()
  if (!session) return null

  const [profile, counts] = await Promise.all([
    getProfileServer(),
    getTeacherCountsServer().catch(() => ({
      totalLessons: 0,
      totalStudents: 0,
    })),
  ])

  return (
    <TeacherProfileView
      profile={profile}
      totalLessons={counts.totalLessons}
      totalStudents={counts.totalStudents}
    />
  )
}