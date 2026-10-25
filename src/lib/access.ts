import type { SubscriptionSummary, TrialStatus } from '@/types/dashboard'

export function hasAccess(
  subscription: SubscriptionSummary | null,
  trial: TrialStatus | null,
): boolean {
  const hasActiveSub = subscription?.status === 'active'
  const isInTrial = !!trial && trial.is_in_trial && trial.days_remaining > 0
  return hasActiveSub || isInTrial
}

export type AccessReason = 'ok' | 'trial_expired' | 'no_plan'

export function getAccessReason(
  subscription: SubscriptionSummary | null,
  trial: TrialStatus | null,
): AccessReason {
  if (hasAccess(subscription, trial)) return 'ok'
  if (trial && trial.end_date && trial.days_remaining <= 0) return 'trial_expired'
  return 'no_plan'
}