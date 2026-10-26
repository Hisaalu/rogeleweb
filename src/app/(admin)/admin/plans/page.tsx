import type { Metadata } from 'next'
import { listPlansServer } from '@/lib/plans.server'
import type { SubscriptionPlan } from '@/types/admin'
import { PlansView } from './plans-view'

export const metadata: Metadata = {
  title: 'Plans',
}

export default async function AdminPlansPage() {
  let plans: SubscriptionPlan[] = []
  try {
    plans = await listPlansServer({ per_page: 100 })
  } catch {
    plans = []
  }

  return <PlansView initialPlans={plans} />
}