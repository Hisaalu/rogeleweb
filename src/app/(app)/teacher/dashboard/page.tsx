import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getSessionUser } from '@/lib/auth'
import { getTeacherDashboardDataServer } from '@/lib/teacher-dashboard.server'
import type { User } from '@/types/api'
import { TeacherDashboardView } from './teacher-dashboard-view'
import { PageSkeleton } from '@/components/ui/page-skeleton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Dashboard' }

async function DashboardContent({ session }: { session: User }) {
  const data = await getTeacherDashboardDataServer(session.id).catch((err) => {
    console.error('[dashboard] Failed to load data:', err)
    return {
      totalLessons: 0,
      totalQuizzes: 0,
      totalStudents: 0,
      averageScore: null,
      recentLessons: [],
      recentQuizzes: [],
    }
  })

  return <TeacherDashboardView profile={session} data={data} />
}

export default async function TeacherDashboardPage() {
  const raw = await getSessionUser()
  if (!raw) return null

  const session: User = {
    id: raw.id,
    email: raw.email,
    first_name: raw.first_name,
    last_name: raw.last_name,
    role: raw.role,
    class_id: raw.class_id,
    profile_photo: raw.profile_photo,
  } as User

  return (
    <Suspense fallback={<PageSkeleton variant="dashboard" />}>
      <DashboardContent session={session} />
    </Suspense>
  )
}