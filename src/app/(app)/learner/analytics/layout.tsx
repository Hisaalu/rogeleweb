import { redirect } from 'next/navigation'
import { getLearnerSubscriptionState } from '@/lib/learner-analytics.server'

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}