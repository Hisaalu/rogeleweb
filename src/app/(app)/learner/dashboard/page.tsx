import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { getLearnerDashboardDataServer, getLearnerQuizzesServer } from '@/lib/dashboard.server'
import { serverApiRequest } from '@/lib/server-api'
import type { User } from '@/types/api'
import { LearnerDashboardView } from './learner-dashboard-view'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function LearnerDashboardPage() {
  const session = await getSessionUser()
  if (!session) return null

  const [profile, dashboard, quizzes] = await Promise.all([
    serverApiRequest<User>('/api/v1/auth/me').catch(() => null),
    getLearnerDashboardDataServer().catch(() => ({
      trial: null,
      subscription: null,
      events: [],
      class_name: 'No Class Assigned'
    })),
    getLearnerQuizzesServer().catch(() => []),
  ])

  return (
    <LearnerDashboardView 
      profile={{ ...profile, class_name: dashboard.class_name } as User} 
      trial={dashboard.trial} 
      subscription={dashboard.subscription} 
      events={dashboard.events} 
      quizzes={quizzes}
    />
  )
}