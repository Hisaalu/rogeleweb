import type { Metadata } from 'next'
import { listPlansServer } from '@/lib/plans.server'
import { fetchPublicSettings } from '@/lib/settings.server'
import type { SubscriptionPlan } from '@/types/admin'
import { PlansView } from './plans-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Plans',
}

export default async function AdminPlansPage() {
  let plans: SubscriptionPlan[] = []
  let trialDays = 14 
  
  try {
    const [fetchedPlans, settings] = await Promise.all([
      listPlansServer({ per_page: 100 }),
      fetchPublicSettings(),
    ])
    
    plans = fetchedPlans
    
    if (settings['trial.duration_days']) {
      const parsed = Number(settings['trial.duration_days'])
      if (!isNaN(parsed) && parsed > 0) {
        trialDays = parsed
      }
    }
  } catch {
    plans = []
  }

  return <PlansView initialPlans={plans} initialTrialDays={trialDays} />
}