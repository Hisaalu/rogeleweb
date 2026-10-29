'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import type { Payment, Subscription, SubscriptionPlan } from '@/types/subscription'
import { PlanCard } from './plan-card'
import { PaymentModal } from './payment-modal'
import { PaymentHistory } from './payment-history'
import { ActiveBanner } from './active-banner'
import { useToast } from '@/components/ui/toast-provider'

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
  const { showToast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  const recommendedId = useMemo(() => {
    if (plans.length < 2) return null
    return plans[Math.floor(plans.length / 2)].id
  }, [plans])

  function handleSuccess() {
    setSelectedPlan(null)
    showToast('Payment confirmed! Your subscription is now active.', 'success', {
      title: 'Subscription active',
    })
    router.refresh()
  }

  const hasActiveSubscription = subscription?.status === 'active'

  const currentPlanIndex = plans.findIndex(
    (p) =>
      String(p.id) === subscription?.plan_type ||
      p.name.toLowerCase() === subscription?.plan_type?.toLowerCase()
  )

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
          {plans.map((plan, index) => {
            const isCurrentPlan =
              hasActiveSubscription &&
              (String(plan.id) === subscription?.plan_type ||
                plan.name.toLowerCase() === subscription?.plan_type?.toLowerCase())

            const isUpgrade = hasActiveSubscription && currentPlanIndex >= 0 && index > currentPlanIndex
            const showButton = !hasActiveSubscription || isUpgrade

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                allPlans={plans}
                recommended={plan.id === recommendedId}
                isCurrentPlan={isCurrentPlan}
                showButton={showButton}
                buttonLabel={isUpgrade ? `Upgrade to ${plan.name}` : "Select Plan"}
                onSelect={() => setSelectedPlan(plan)}
              />
            )
          })}
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