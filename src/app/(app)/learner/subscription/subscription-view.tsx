'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import type { Payment, Subscription, SubscriptionPlan } from '@/types/subscription'
import { PlanCard } from './plan-card'
import { PaymentModal } from './payment-modal'
import { PaymentHistory } from './payment-history'
import { ActiveBanner } from './active-banner'
import { useToast } from '@/components/ui/toast-provider'
import { Card } from '@/components/ui/card'

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

  const orderedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.price - b.price || a.duration_days - b.duration_days)
  }, [plans])

  const recommendedId = useMemo(() => {
    if (orderedPlans.length < 2) return null
    return orderedPlans[Math.floor(orderedPlans.length / 2)].id
  }, [orderedPlans])

  function handleSuccess() {
    setSelectedPlan(null)
    showToast('Payment confirmed! Your subscription is now active.', 'success', {
      title: 'Subscription active',
    })
    router.refresh()
  }

  const hasActiveSubscription = subscription?.status === 'active'

  const currentPlanIndex = orderedPlans.findIndex(
    (p) =>
      String(p.id) === subscription?.plan_type ||
      p.name.toLowerCase() === subscription?.plan_type?.toLowerCase()
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-3 py-6 sm:px-4 sm:py-10">
      <div className="text-center">
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
          One subscription. Access to everything
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Select your learning path</p>
      </div>

      {hasActiveSubscription && subscription && (
        <ActiveBanner
          subscription={subscription}
          plans={orderedPlans}
          onUpgrade={(plan) => setSelectedPlan(plan)}
        />
      )}

      {orderedPlans.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No subscription plans are available right now. Please check back later.
          </p>
        </Card>
      ) : (
        <div
          id="plans"
          className="grid grid-cols-1 gap-4 pt-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {orderedPlans.map((plan, index) => {
            const isCurrentPlan =
              hasActiveSubscription &&
              (String(plan.id) === subscription?.plan_type ||
                plan.name.toLowerCase() === subscription?.plan_type?.toLowerCase())

            const isUpgrade =
              hasActiveSubscription && currentPlanIndex >= 0 && index > currentPlanIndex
            const showButton = !hasActiveSubscription || isUpgrade

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                allPlans={orderedPlans}
                recommended={plan.id === recommendedId}
                isCurrentPlan={isCurrentPlan}
                showButton={showButton}
                buttonLabel={isUpgrade ? `Upgrade to ${plan.name}` : 'Select Plan'}
                onSelect={() => setSelectedPlan(plan)}
              />
            )
          })}
        </div>
      )}

      {payments.length > 0 && <PaymentHistory payments={payments} plans={orderedPlans} />}

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