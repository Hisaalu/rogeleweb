import { getSessionUser } from '@/lib/auth'
import { getMySubscriptionServer } from '@/lib/subscriptions.server'
import { AppShell } from '@/components/layout/app-shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser()
  if (!session) return null

  const subscription = await getMySubscriptionServer()
  
  const isPro = subscription?.status === 'active' && 
    (subscription.plan_type === 'yearly' || subscription.plan_type === '3')

  return (
    <AppShell user={session} isPro={isPro}>
      {children}
    </AppShell>
  )
}