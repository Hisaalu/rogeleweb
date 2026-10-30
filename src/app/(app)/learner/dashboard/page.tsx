import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { getLearnerDashboardDataServer } from '@/lib/dashboard.server'
import { serverApiRequest } from '@/lib/server-api'
import type { User } from '@/types/api'
import { LearnerDashboardView } from './learner-dashboard-view'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'
export const revalidate = 0 // Forces fresh execution on every request, disabling route cache

export default async function LearnerDashboardPage() {
  const session = await getSessionUser()
  if (!session) return null

  const [profile, dashboard] = await Promise.all([
    serverApiRequest<User>('/api/v1/auth/me').catch(() => null),
    getLearnerDashboardDataServer().catch(() => ({
      trial: null,
      subscription: null,
      events: []
    })),
  ])

  return (
    <LearnerDashboardView 
      profile={profile} 
      trial={dashboard.trial} 
      subscription={dashboard.subscription} 
      events={dashboard.events} 
    />
  )
}