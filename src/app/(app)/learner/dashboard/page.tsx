import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { getLearnerDashboardDataServer } from '@/lib/dashboard.server'
import { serverApiRequest } from '@/lib/server-api'
import type { User } from '@/types/api'
import { LearnerDashboardView } from './learner-dashboard-view'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function LearnerDashboardPage() {
  const session = await getSessionUser()
  if (!session) return null

  let profile: User | null = null
  try {
    profile = await serverApiRequest<User>('/api/v1/auth/me')
  } catch {
    profile = null
  }

  const dashboard = await getLearnerDashboardDataServer()
  return <LearnerDashboardView profile={profile} trial={dashboard.trial} subscription={dashboard.subscription} events={dashboard.events} />
}