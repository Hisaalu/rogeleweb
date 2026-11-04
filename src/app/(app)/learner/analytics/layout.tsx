import { redirect } from 'next/navigation'
import { getLearnerSubscriptionState } from '@/lib/learner-analytics.server'

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const state = await getLearnerSubscriptionState()
  if (!state.hasAccess) {
    redirect('/learner/subscription')
  }
  return <>{children}</>
}