import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import type { FreeTrial, Subscription, User } from '@/types/api'
import { DashboardView } from './dashboard-view'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await getSessionUser()
  if (!session) return null

  let profile: User | null = null
  let subscription: Subscription | null = null
  let trial: FreeTrial | null = null

  try {
    profile = await apiRequest<User>('/api/v1/auth/me')
  } catch {
    profile = null
  }

  if (session.role === 'learner' || session.role === 'external') {
    try {
      subscription = await apiRequest<Subscription>('/api/v1/subscriptions/me')
    } catch {
      subscription = null
    }
    try {
      trial = await apiRequest<FreeTrial>('/api/v1/trials/me')
    } catch {
      trial = null
    }
  }

  return <DashboardView profile={profile} subscription={subscription} trial={trial} />
}