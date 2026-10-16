import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import { getDashboardDataServer } from '@/lib/dashboard.server'
import type { User } from '@/types/api'
import { DashboardView } from './dashboard-view'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await getSessionUser()
  if (!session) return null

  let profile: User | null = null
  try {
    profile = await serverApiRequest<User>('/api/v1/auth/me')
  } catch {
    profile = null
  }

  const isLearnerSide = session.role === 'learner' || session.role === 'external'
  const dashboard = isLearnerSide
    ? await getDashboardDataServer()
    : { trial: null, subscription: null, events: [] }

  return (
    <DashboardView
      profile={profile}
      trial={dashboard.trial}
      subscription={dashboard.subscription}
      events={dashboard.events}
    />
  )
}