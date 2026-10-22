import type { SubscriptionSummary, TrialStatus } from '@/types/dashboard'

export function hasAccess(
  subscription: SubscriptionSummary | null,
  trial: TrialStatus | null
): boolean {
  const hasActiveSub = subscription?.status === 'active'
  const isInTrial = !!trial && trial.is_in_trial && trial.days_remaining > 0
  return hasActiveSub || isInTrial
}