'use client'

import { useState } from 'react'
import { BookOpen, HelpCircle, CreditCard, Calendar } from 'lucide-react'
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
            actionLabel="Manage Plan"
            actionHref="/subscription"
          />
        )}

        {isInTrial && trial && (
          <AccessBanner
            variant="trial"
            title={`Trial Period: ${trial.days_remaining} day${trial.days_remaining === 1 ? '' : 's'} remaining`}
            description={`You have ${trial.days_remaining} day${trial.days_remaining === 1 ? '' : 's'} to explore all features.`}
            actionLabel="Subscribe Now"
            actionHref="/subscription"
          />
        )}

        {!hasAccess && (
          <AccessBanner
            variant="expired"
            title="Trial or Subscription Ended!"
            description="Kindly subscribe now to continue accessing lessons, quizzes & more!"
            actionLabel="Subscribe Now"
            actionHref="/subscription"
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
            href="/subscription"
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
              href="/subscription"
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