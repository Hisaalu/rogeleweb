'use client'

import { Check, CreditCard, Crown, Rocket } from 'lucide-react'
import type { SubscriptionPlan } from '@/types/subscription'

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
      className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
      }}
    >
      <Icon size={26} style={{ color: 'var(--brand-primary)' }} />
    </div>
  )
}

export function PlanCard({
  plan,
  allPlans,
  recommended,
  hasActiveSubscription,
  onSelect,
}: {
  plan: SubscriptionPlan
  allPlans: SubscriptionPlan[]
  recommended: boolean
  hasActiveSubscription: boolean
  onSelect: () => void
}) {
  const tier = tierFor(plan.duration_days)
  const savings = computeSavings(plan, allPlans)
  
  // Calculate the monthly equivalent for termly and yearly plans
  const months = Math.max(1, Math.round(plan.duration_days / 30))
  const perMonth = plan.price / months

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

  return (
    <div
      className="relative flex h-full flex-col rounded-3xl border-2 bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg"
      style={{
        borderColor: recommended ? 'var(--brand-accent)' : 'hsl(var(--border))',
        background:
          recommended
            ? 'linear-gradient(135deg, hsl(var(--card)), color-mix(in srgb, var(--brand-accent) 4%, hsl(var(--card))))'
            : undefined,
      }}
    >
      {recommended && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          Recommended
        </div>
      )}

      <PlanIcon tier={tier} />

      <h3 className="text-lg font-bold text-foreground sm:text-xl">{plan.name}</h3>
      {plan.description && (
        <p className="mt-1 min-h-[40px] text-sm text-muted-foreground">
          {plan.description}
        </p>
      )}

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-xs font-semibold text-muted-foreground">UGX</span>
        <span className="text-3xl font-extrabold leading-none text-foreground">
          {fmtMoney(plan.price)}
        </span>
      </div>
      
      <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
        <p>{periodLabel(plan.duration_days)}</p>
        {/* Show the per month equivalent if it's not the monthly plan */}
        {tier !== 'monthly' && (
          <p className="font-medium text-foreground/80">
            (approx. {fmtMoney(perMonth)} UGX / month)
          </p>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {benefits.map((b) => {
          const isSavings = b.startsWith('Save')
          return (
            <li key={b} className="flex items-start gap-2.5 text-muted-foreground">
              <span
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: 'var(--success-border)' }}
              >
                <Check size={10} strokeWidth={3} />
              </span>
              <span
                className={isSavings ? 'font-semibold' : ''}
                style={{ color: isSavings ? 'var(--success-fg)' : undefined }}
              >
                {b}
              </span>
            </li>
          )
        })}
      </ul>

      {!hasActiveSubscription && (
        <button
          type="button"
          onClick={onSelect}
          className="mt-6 w-full rounded-full py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{
            backgroundColor: recommended
              ? 'var(--brand-primary)'
              : 'var(--brand-accent)',
          }}
        >
          Select Plan
        </button>
      )}
    </div>
  )
}