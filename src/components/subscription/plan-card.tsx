'use client'

import { Check, CreditCard, Crown, Rocket } from 'lucide-react'
import Link from 'next/link'
import type { SubscriptionPlan } from '@/types/subscription'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function fmtMoney(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

function periodLabel(days: number): string {
  if (days <= 31) return 'per month'
  if (days <= 100) return `per term (${Math.round(days / 30)} months)`
  return `per year (${Math.round(days / 30)} months)`
}

function tierFor(days: number): 'monthly' | 'termly' | 'yearly' {
  if (days <= 31) return 'monthly'
  if (days <= 100) return 'termly'
  return 'yearly'
}

function computeSavings(
  plan: SubscriptionPlan,
  allPlans: SubscriptionPlan[],
): { amount: number; percent: number } | null {
  if (allPlans.length < 2) return null

  const perDay = allPlans.map((p) => ({
    id: p.id,
    perDay: p.price / Math.max(1, p.duration_days),
  }))
  const maxPerDay = Math.max(...perDay.map((p) => p.perDay))
  const planPerDay = plan.price / Math.max(1, plan.duration_days)

  if (planPerDay >= maxPerDay) return null
  if (maxPerDay === 0) return null

  const baselineCost = maxPerDay * plan.duration_days
  const amount = Math.round(baselineCost - plan.price)
  const percent = Math.round((1 - planPerDay / maxPerDay) * 100)

  if (amount <= 0 || percent <= 0) return null
  return { amount, percent }
}

function PlanIcon({ tier }: { tier: 'monthly' | 'termly' | 'yearly' }) {
  const Icon = tier === 'yearly' ? Crown : tier === 'termly' ? Rocket : CreditCard
  return (
    <div
      className="mb-4 flex h-14 w-14 items-center justify-center rounded-sm"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
      }}
    >
      <Icon size={26} style={{ color: 'var(--brand-primary)' }} />
    </div>
  )
}

function buildBenefits(
  tier: 'monthly' | 'termly' | 'yearly',
  savings: { amount: number; percent: number } | null,
): string[] {
  const benefits: string[] = []

  if (tier === 'monthly') {
    benefits.push('Full access to all lessons')
    benefits.push('Practice quizzes & assessments')
    benefits.push('Homework support')
    benefits.push('Progress tracking dashboard')
    benefits.push('Change from one class to the next')
  }

  if (tier === 'termly') {
    benefits.push('Everything in Monthly')
    if (savings) benefits.push(`Save ${fmtMoney(savings.amount)} UGX (${savings.percent}%)`)
    benefits.push('Priority email support')
    benefits.push('Downloadable lesson materials')
    benefits.push('Bookmark Lessons for later')
  }

  if (tier === 'yearly') {
    benefits.push('Everything in Termly')
    if (savings) benefits.push(`Save ${fmtMoney(savings.amount)} UGX (${savings.percent}%)`)
    benefits.push('AI Study Assistant')
    benefits.push('24/7 Dedicated Support')
  }

  return benefits
}

export function PlanCard({
  plan,
  allPlans,
  recommended,
  isCurrentPlan = false,
  showButton = true,
  buttonLabel = 'Select Plan',
  onSelect,
  href,
}: {
  plan: SubscriptionPlan
  allPlans: SubscriptionPlan[]
  recommended: boolean
  isCurrentPlan?: boolean
  showButton?: boolean
  buttonLabel?: string
  onSelect?: () => void
  href?: string
}) {
  const tier = tierFor(plan.duration_days)
  const savings = computeSavings(plan, allPlans)
  const months = Math.max(1, Math.round(plan.duration_days / 30))
  const perMonth = plan.price / months
  const benefits = buildBenefits(tier, savings)

  return (
    <Card
      className="relative flex h-full flex-col items-start text-left border-2 p-6 transition hover:-translate-y-1 hover:shadow-lg"
      style={{
        borderColor: recommended ? 'var(--brand-accent)' : 'hsl(var(--border))',
        background: recommended
          ? 'linear-gradient(135deg, hsl(var(--card)), color-mix(in srgb, var(--brand-accent) 4%, hsl(var(--card))))'
          : undefined,
      }}
    >
      {recommended && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          Recommended
        </div>
      )}

      <PlanIcon tier={tier} />

      <h3 className="text-lg font-bold text-foreground sm:text-xl text-left w-full">
        {plan.name}
      </h3>
      {plan.description && (
        <p className="mt-1 min-h-[40px] text-sm text-muted-foreground text-left w-full">
          {plan.description}
        </p>
      )}

      <div className="mt-4 flex w-full flex-col items-start">
        <div className="flex items-baseline gap-1">
          <span className="text-xs font-semibold text-muted-foreground">UGX</span>
          <span className="text-3xl font-extrabold leading-none text-foreground">
            {fmtMoney(plan.price)}
          </span>
        </div>

        <div className="mt-1 flex w-full flex-col gap-0.5 text-left text-xs text-muted-foreground">
          <p className="text-left">{periodLabel(plan.duration_days)}</p>
          {tier !== 'monthly' && (
            <p className="text-left font-medium text-foreground/80">
              (approx. {fmtMoney(perMonth)} UGX / month)
            </p>
          )}
        </div>
      </div>

      <ul className="mt-6 flex w-full flex-1 flex-col space-y-2.5 text-sm text-left">
        {benefits.map((b) => {
          const isSavings = b.startsWith('Save')
          return (
            <li key={b} className="flex w-full items-start gap-2.5 text-left text-muted-foreground">
              <span
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: 'var(--success-border)' }}
              >
                <Check size={10} strokeWidth={3} />
              </span>
              <span
                className={`flex-1 text-left ${isSavings ? 'font-semibold' : ''}`}
                style={{ color: isSavings ? 'var(--success-fg)' : undefined }}
              >
                {b}
              </span>
            </li>
          )
        })}
      </ul>

      {isCurrentPlan && (
        <Button variant="outline" disabled className="mt-6 w-full">
          Current Plan
        </Button>
      )}

      {!isCurrentPlan && showButton && (
        href ? (
          <Link href={href} className="mt-6 w-full">
            <Button variant={recommended ? 'primary' : 'secondary'} className="w-full">
              {buttonLabel}
            </Button>
          </Link>
        ) : (
          <Button
            type="button"
            variant={recommended ? 'primary' : 'secondary'}
            onClick={onSelect}
            className="mt-6 w-full"
          >
            {buttonLabel}
          </Button>
        )
      )}
    </Card>
  )
}