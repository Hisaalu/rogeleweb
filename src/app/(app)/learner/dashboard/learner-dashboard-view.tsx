'use client'

import { useState } from 'react'
import { BookOpen, HelpCircle, CreditCard, Calendar, Clock, Crown } from 'lucide-react'
import type { User } from '@/types/api'
import type {
  CalendarEvent,
  SubscriptionSummary,
  TrialStatus,
} from '@/types/dashboard'
import { AccessBanner } from './components/access-banner'
import { NavCard } from './components/nav-card'
import { EventCalendar } from './components/event-calendar'
import { EventFeed } from './components/event-feed'

const accentIcon = { color: 'var(--brand-accent)' } as const

export function LearnerDashboardView({
  profile,
  subscription,
  trial,
  events,
}: {
  profile: User | null
  subscription: SubscriptionSummary | null
  trial: TrialStatus | null
  events: CalendarEvent[]
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const firstName = profile?.first_name ?? 'there'
  const hasActiveSubscription = subscription?.status === 'active'
  const isInTrial =
    !hasActiveSubscription && !!trial && trial.is_in_trial && trial.days_remaining > 0
  const hasAccess = hasActiveSubscription || isInTrial

  const trialProgress =
    trial && trial.total_days > 0
      ? Math.min(100, Math.max(0, ((trial.total_days - trial.days_remaining) / trial.total_days) * 100))
      : 0

  const isMonthly = subscription?.plan_type === 'monthly' || subscription?.plan_type === '1'
  const isTermly = subscription?.plan_type === 'termly' || subscription?.plan_type === '2'
  const isYearly = subscription?.plan_type === 'yearly' || subscription?.plan_type === '3'
  
  const canUpgrade = hasActiveSubscription && (isMonthly || isTermly)
  const buttonLabel = hasActiveSubscription ? (isYearly ? "Pro" : "Upgrade Plan") : "Subscribe Now"

  return (
    <div className="space-y-5 sm:space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
        Welcome back,{' '}
        <span style={{ color: 'var(--brand-primary)' }}>{firstName}</span>!
      </h1>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold sm:mb-5 sm:text-lg">Overview</h2>

        {hasActiveSubscription && subscription && (
          <AccessBanner
            variant="active"
            title="Subscribed."
            description="You have full access to all premium features."
            endDate={subscription.end_date}
            actionLabel={buttonLabel}
            actionHref="/learner/subscription"
            showCrown={isYearly}
          />
        )}

        {isInTrial && trial && (
          <div
            className="rounded-xl border-l-4 p-5"
            style={{ backgroundColor: 'var(--warning-bg)', borderLeftColor: 'var(--warning-border)' }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--warning-border)' }}
              >
                <Clock size={22} className="text-white" />
              </div>
              <div className="min-w-[200px] flex-1">
                <p className="font-semibold" style={{ color: 'var(--warning-fg)' }}>
                  Free Trial: {trial.days_remaining} day{trial.days_remaining === 1 ? '' : 's'} remaining
                </p>
                <p className="text-sm" style={{ color: 'var(--warning-accent)' }}>
                  You have {trial.days_remaining} days to explore all features.
                </p>
                {trial.end_date && (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--warning-accent)' }}>
                    Ends on{' '}
                    {new Date(trial.end_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <a
                href="/learner/subscription"
                className="shrink-0 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              >
                Subscribe Now
              </a>
            </div>

            <div className="mt-4">
              <div
                className="mb-1 flex justify-between text-xs font-medium"
                style={{ color: 'var(--warning-fg)' }}
              >
                <span>{trial.days_remaining} days left</span>
                <span>{trial.total_days} total days</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/40">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${trialProgress}%`,
                    backgroundColor: 'var(--warning-border)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {!hasAccess && (
          <AccessBanner
            variant="expired"
            title="Trial or Subscription Ended!"
            description="Kindly subscribe now to continue accessing lessons, quizzes & more!"
            actionLabel="Subscribe Now"
            actionHref="/learner/subscription"
          />
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          <NavCard
            href={hasAccess ? '/learner/lessons' : '#'}
            icon={<BookOpen size={26} />}
            title="Learning Materials"
            description={
              hasAccess
                ? 'Access all lessons and resources'
                : 'Subscribe to access lessons'
            }
            locked={!hasAccess}
          />
          <NavCard
            href={hasAccess ? '/learner/quizzes' : '#'}
            icon={<HelpCircle size={26} />}
            title="Practice Quizzes"
            description={
              hasAccess ? 'Test your knowledge' : 'Subscribe to access quizzes'
            }
            locked={!hasAccess}
          />
          <NavCard
            href="/learner/subscription"
            icon={<CreditCard size={26} />}
            title="Subscription"
            description={
              hasActiveSubscription
                ? 'Manage your subscription'
                : isInTrial
                  ? 'Upgrade to premium'
                  : 'Subscribe to continue'
            }
            variant="outline"
          />
        </div>

        <h3 className="mt-8 flex items-center gap-2 border-b-2 border-border pb-3 text-base font-semibold sm:mt-10 sm:text-lg">
          <Calendar size={18} style={accentIcon} />
          Institutional Calendar &amp; Events
        </h3>

        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-muted/30 p-3 sm:mt-5 sm:gap-6 sm:p-5 lg:grid-cols-2">
          <EventCalendar
            events={events}
            selectedDate={selectedDate}
            onDaySelect={setSelectedDate}
          />
          <EventFeed
            events={events}
            selectedDate={selectedDate}
            onClearFilter={() => setSelectedDate(null)}
          />
        </div>

        {!hasAccess && (
          <div
            className="mt-6 rounded-xl p-4 text-center sm:mt-8 sm:p-5"
            style={{ backgroundColor: 'var(--danger-bg)' }}
          >
            <p className="mb-4 text-sm" style={{ color: 'var(--danger-fg)' }}>
              Your free trial or subscription has ended. To continue learning,
              please choose a subscription plan!
            </p>
            <a
              href="/learner/subscription"
              className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:px-8 sm:py-3"
              style={{ backgroundColor: '#23a74c' }}
            >
              View Plans
            </a>
          </div>
        )}
      </div>
    </div>
  )
}