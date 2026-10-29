'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Subscription, SubscriptionPlan } from '@/types/subscription'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ActiveBanner({
  subscription,
  plans,
}: {
  subscription: Subscription
  plans: SubscriptionPlan[]
}) {
  const currentPlan = plans.find(
    (p) =>
      String(p.id) === subscription.plan_type ||
      p.name.toLowerCase() === subscription.plan_type?.toLowerCase()
  )
  const planName = currentPlan?.name ?? subscription.plan_type ?? 'Subscription'
  
  const currentIndex = plans.findIndex(
    (p) =>
      String(p.id) === subscription.plan_type ||
      p.name.toLowerCase() === subscription.plan_type?.toLowerCase()
  )
  const nextPlan = currentIndex >= 0 ? plans[currentIndex + 1] : undefined

  return (
    <Card
      className="flex flex-col items-start gap-4 border-2 p-5 sm:flex-row sm:items-center sm:gap-5"
      style={{
        backgroundColor: 'var(--success-bg)',
        borderColor: 'var(--success-border)',
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: 'var(--success-border)' }}
      >
        <CheckCircle2 size={24} />
      </div>
      <div className="min-w-0 flex-1">
        <h3
          className="text-base font-bold sm:text-lg"
          style={{ color: 'var(--success-fg)' }}
        >
          You&apos;re on the {planName} Plan!
        </h3>
        <p className="text-sm" style={{ color: 'var(--success-fg)' }}>
          Valid until {formatDate(subscription.end_date)}
        </p>
      </div>
      {nextPlan && (
        <Link href="#plans" className="shrink-0">
          <Button variant="primary">
            Upgrade to {nextPlan.name}
          </Button>
        </Link>
      )}
    </Card>
  )
}