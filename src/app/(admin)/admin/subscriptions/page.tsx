import type { Metadata } from 'next'
import { listSubscriptionsServer } from '@/lib/subscriptions.server'
import type { AdminSubscription } from '@/types/admin'
import { SubscriptionsView } from './subscriptions-view'

export const metadata: Metadata = {
  title: 'Subscriptions',
}

export default async function AdminSubscriptionsPage() {
  let subscriptions: AdminSubscription[] = []
  try {
    subscriptions = await listSubscriptionsServer({ per_page: 200 })
  } catch {
    subscriptions = []
  }

  return <SubscriptionsView initialSubscriptions={subscriptions} />
}