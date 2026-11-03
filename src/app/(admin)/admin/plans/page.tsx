import type { Metadata } from 'next'
import { listPlansServer } from '@/lib/plans.server'
import { fetchPublicSettings } from '@/lib/settings.server'
import type { SubscriptionPlan } from '@/types/admin'
import { PlansView } from './plans-view'

export const metadata: Metadata = {
  title: 'Plans',
}

// Cache for 60 seconds so repeat visits are instant
export const revalidate = 60

export default async function AdminPlansPage() {
  const [plansRes, settingsRes] = await Promise.allSettled([
    listPlansServer({ per_page: 100 }),
    fetchPublicSettings(),
  ])

  const plans: SubscriptionPlan[] = plansRes.status === 'fulfilled' ? plansRes.value : []
  let trialDays = 14

  if (settingsRes.status === 'fulfilled' && settingsRes.value['trial.duration_days']) {
    const parsed = Number(settingsRes.value['trial.duration_days'])
    if (!isNaN(parsed) && parsed > 0) {
      trialDays = parsed
    }
  }

  return <PlansView initialPlans={plans} initialTrialDays={trialDays} />
}