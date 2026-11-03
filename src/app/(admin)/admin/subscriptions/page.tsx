import type { Metadata } from 'next'
import { listSubscriptionsServer } from '@/lib/subscriptions.server'
import type { AdminSubscription } from '@/types/admin'
import { SubscriptionsView } from './subscriptions-view'

export const metadata: Metadata = {
  title: 'Subscriptions',
}

export const revalidate = 60

export default async function AdminSubscriptionsPage() {
  let subscriptions: AdminSubscription[] = []
  let meta = { page: 1, per_page: 50, total: 0, last_page: 1 }

  try {
    const result = await listSubscriptionsServer({ page: 1, per_page: 50 })
    subscriptions = result.subscriptions
    meta = result.meta
  } catch {
    subscriptions = []
  }

  return <SubscriptionsView initialSubscriptions={subscriptions} initialMeta={meta} />
}