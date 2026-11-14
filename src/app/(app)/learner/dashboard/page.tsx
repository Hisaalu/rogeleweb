import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { getSessionUser } from '@/lib/auth'
import {
  getLearnerDashboardDataServer,
  getLearnerQuizzesServer,
} from '@/lib/dashboard.server'
import type { User } from '@/types/api'
import { LearnerDashboardView } from './learner-dashboard-view'

export const metadata: Metadata = { title: 'Dashboard' }

async function DashboardContent({ cookieProfile }: { cookieProfile: User }) {
  const [dashboard, quizzes] = await Promise.all([
    getLearnerDashboardDataServer().catch(() => ({
      trial: null,
      subscription: null,
      events: [],
      class_name: 'No Class Assigned',
    })),
    getLearnerQuizzesServer().catch(() => []),
  ])

  return (
    <LearnerDashboardView
      profile={{ ...cookieProfile, class_name: dashboard.class_name } as User}
      trial={dashboard.trial}
      subscription={dashboard.subscription}
      events={dashboard.events}
      quizzes={quizzes}
    />
  )
}

export default async function LearnerDashboardPage() {
  const session = await getSessionUser()
  if (!session) return null

  const cookieProfile: User = {
    id: session.id,
    email: session.email,
    first_name: session.first_name,
    last_name: session.last_name,
    role: session.role,
    class_id: session.class_id,
    profile_photo: session.profile_photo,
  } as User

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DashboardContent cookieProfile={cookieProfile} />
    </Suspense>
  )
}