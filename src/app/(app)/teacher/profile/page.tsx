import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import { getProfileServer, getClassesServer } from '@/lib/profile.server'
import type { Lesson } from '@/types/lesson'
import type { AdminOverview } from '@/types/admin'
import { TeacherProfileView } from './teacher-profile-view'

export const metadata: Metadata = { title: 'My Profile' }
export const dynamic = 'force-dynamic'

export default async function TeacherProfilePage() {
  const session = await getSessionUser()
  if (!session) return null

  const [profile, classes] = await Promise.all([
    getProfileServer(),
    getClassesServer(),
  ])

  let lessons: Lesson[] = []
  try {
    const res = await serverApiRequest<unknown>(`/api/v1/lessons?per_page=1000`)
    const r = (res ?? {}) as { data?: Lesson[]; value?: Lesson[] }
    if (Array.isArray(res)) lessons = res
    else if (Array.isArray(r.data)) lessons = r.data
    else if (Array.isArray(r.value)) lessons = r.value
  } catch {
    lessons = []
  }

  let totalStudents = 0
  try {
    const stats = await serverApiRequest<AdminOverview>('/api/v1/admin/stats')
    const learners = stats?.users_by_role?.learner ?? 0
    const externals = stats?.users_by_role?.external ?? 0
    totalStudents = learners + externals
  } catch {
    totalStudents = 0
  }

  return (
    <TeacherProfileView 
      profile={profile} 
      classes={classes} 
      totalLessons={lessons.length}
      totalStudents={totalStudents}
    />
  )
}