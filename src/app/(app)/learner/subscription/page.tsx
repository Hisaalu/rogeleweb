import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import {
  getMySubscriptionServer,
  listActivePlansServer,
  listMyPaymentsServer,
} from '@/lib/subscriptions.server'
import { SubscriptionView } from './subscription-view'

export const metadata: Metadata = { title: 'Subscription' }

export default async function LearnerSubscriptionPage() {
  const session = await getSessionUser()
  if (!session) return null

  const [plans, subscription, payments] = await Promise.all([
    listActivePlansServer(),
    getMySubscriptionServer(),
    listMyPaymentsServer(),
  ])

  return (
    <SubscriptionView
      plans={plans}
      subscription={subscription}
      payments={payments}
    />
  )
}