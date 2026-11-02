import { getSessionUser } from '@/lib/auth'
import { getMySubscriptionServer } from '@/lib/subscriptions.server'
import { getTrialStatusServer } from '@/lib/dashboard.server'
import { AppShell } from '@/components/layout/app-shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser()
  if (!session) return null

  const [subscription, trial] = await Promise.all([
    getMySubscriptionServer(),
    getTrialStatusServer(),
  ])
  
  const isPro = subscription?.status === 'active' && 
    (subscription.plan_type === 'yearly' || subscription.plan_type === '3')

  const hasActiveSubscription = subscription?.status === 'active'
  const isInTrial = !hasActiveSubscription && trial?.is_in_trial === true

  return (
    <AppShell 
      user={session} 
      isPro={isPro} 
      isInTrial={isInTrial}
      hasActiveSubscription={hasActiveSubscription}
    >
      {children}
    </AppShell>
  )
}