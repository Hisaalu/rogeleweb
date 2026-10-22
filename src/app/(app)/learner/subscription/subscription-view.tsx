'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import type { Payment, Subscription, SubscriptionPlan } from '@/types/subscription'
import { PlanCard } from './plan-card'
import { PaymentModal } from './payment-modal'
import { PaymentHistory } from './payment-history'
import { ActiveBanner } from './active-banner'

export function SubscriptionView({
  plans,
  subscription,
  payments,
}: {
  plans: SubscriptionPlan[]
  subscription: Subscription | null
  payments: Payment[]
}) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const recommendedId = useMemo(() => {
    if (plans.length < 2) return null
    return plans[Math.floor(plans.length / 2)].id
  }, [plans])

  function handleSuccess() {
    setSelectedPlan(null)
    setSuccessMessage('Payment confirmed! Your subscription is now active.')
    router.refresh()
  }

  const hasActiveSubscription = subscription?.status === 'active'

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-3 py-6 sm:px-4 sm:py-10">
      <div className="text-center">
        <span
          className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          Subscription
        </span>
        <h1
          className="mt-4 text-2xl font-bold sm:text-3xl lg:text-4xl"
          style={{ color: 'var(--brand-primary)' }}
        >
          Choose Your Learning Path
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Select the perfect plan for your educational journey
        </p>
      </div>

      {successMessage && (
        <div
          className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--success-bg)',
            borderColor: 'var(--success-border)',
            color: 'var(--success-fg)',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {hasActiveSubscription && subscription && (
        <ActiveBanner subscription={subscription} plans={plans} />
      )}

      {plans.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No subscription plans are available right now. Please check back later.
          </p>
        </div>
      ) : (
        <div
          id="plans"
          className="grid grid-cols-1 gap-4 pt-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              allPlans={plans}
              recommended={plan.id === recommendedId}
              hasActiveSubscription={hasActiveSubscription}
              onSelect={() => setSelectedPlan(plan)}
            />
          ))}
        </div>
      )}

      {payments.length > 0 && <PaymentHistory payments={payments} plans={plans} />}

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}