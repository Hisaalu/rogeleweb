'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, HelpCircle, CreditCard, Calendar, Clock } from 'lucide-react'
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
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const accentIcon = { color: 'var(--brand-accent)' } as const

export function LearnerDashboardView({
  profile,
  subscription,
  trial,
  events,
  quizzes,
}: {
  profile: User | null
  subscription: SubscriptionSummary | null
  trial: TrialStatus | null
  events: CalendarEvent[]
  quizzes: any[]
}) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    router.refresh()
  }, [router])

  const firstName = profile?.first_name ?? 'there'
  const className = profile?.class_name ?? 'No Class Assigned'
  
  const hasActiveSubscription = subscription?.status === 'active'
  const isInTrial =
    !hasActiveSubscription && !!trial && trial.is_in_trial && trial.days_remaining > 0
  const hasAccess = hasActiveSubscription || isInTrial

  const trialProgress =
    trial && trial.total_days > 0
      ? Math.min(100, Math.max(0, ((trial.total_days - trial.days_remaining) / trial.total_days) * 100))
      : 0

  const isYearly = subscription?.plan_type === 'yearly' || subscription?.plan_type === '3'
  
  let buttonLabel = ""
  let showButton = false

  if (isInTrial || (!hasActiveSubscription && !isInTrial)) {
    buttonLabel = "Subscribe Now"
    showButton = true
  } else if (hasActiveSubscription && isYearly) {
    buttonLabel = "Completed"
    showButton = true
  } else if (hasActiveSubscription && !isYearly) {
    showButton = false
  }

  const now = new Date();
  const nextQuiz = quizzes
    ?.filter(q => {
      const deadline = q.end_date || q.start_date;
      return deadline && new Date(deadline) > now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.end_date || a.start_date).getTime();
      const dateB = new Date(b.end_date || b.start_date).getTime();
      return dateA - dateB;
    })[0];

  let quizDeadlineText = 'Test your knowledge';
  if (hasAccess && nextQuiz) {
    const deadlineDate = new Date(nextQuiz.end_date || nextQuiz.start_date);
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const quizClassName = nextQuiz.class_name || className;
    
    quizDeadlineText = daysLeft === 1 
      ? `Latest ${quizClassName} quiz is due tomorrow` 
      : `Latest ${quizClassName} quiz is due in ${daysLeft} days`;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8">
      
      <Card className="p-5 sm:p-6 bg-card/50">
        <h1 className="text-xl sm:text-2xl lg:text-3xl">
          Welcome back, <span className="font-bold">{firstName}</span>
        </h1>
        <p className="mt-1 text-sm sm:text-base">
          This is <span className="font-bold text-foreground">{className}</span> Class. Please you can{' '}
          <Link href="/learner/profile" className="hover:underline" style={{ color: 'var(--brand-accent)' }}>
            click here to change to another class
          </Link>
        </p>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold sm:mb-5 sm:text-lg">Overview</h2>

        {hasActiveSubscription && subscription && (
          <AccessBanner
            variant="active"
            title="Subscribed."
            description="You have full access to all premium features."
            endDate={subscription.end_date}
            actionLabel={showButton ? buttonLabel : undefined}
            actionHref={showButton ? "/learner/subscription" : undefined}
            showCrown={isYearly}
            isPro={isYearly}
          />
        )}

        {isInTrial && trial && (
          <div
            className="rounded-md border-l-4 p-5"
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
                <p className="text-sm" style={{ color: 'var(--warning-fg)', opacity: 0.8 }}>
                  You have {trial.days_remaining} days to explore all features.
                </p>
                {trial.end_date && (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--warning-fg)', opacity: 0.8 }}>
                    Ends on{' '}
                    {new Date(trial.end_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              {showButton && (
                <Link href="/learner/subscription" className="shrink-0">
                  <Button variant="secondary">{buttonLabel}</Button>
                </Link>
              )}
            </div>

            <div className="mt-4">
              <div
                className="mb-1 flex justify-between text-xs font-medium"
                style={{ color: 'var(--warning-fg)' }}
              >
                <span>{trial.days_remaining} days left</span>
                <span>{trial.total_days} total days</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
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
              !hasAccess
                ? 'Subscribe to access quizzes'
                : nextQuiz 
                  ? quizDeadlineText
                  : 'Test your knowledge'
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

        <Card className="mt-4 flex flex-col gap-6 bg-muted/30 p-4 sm:grid sm:p-5 lg:grid-cols-2">
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
        </Card>

        {!hasAccess && (
          <Card
            className="mt-6 border-none p-4 text-center sm:mt-8 sm:p-5"
            style={{ backgroundColor: 'var(--danger-bg)' }}
          >
            <p className="mb-4 text-sm" style={{ color: 'var(--danger-fg)' }}>
              Your free trial or subscription has ended. To continue learning,
              please choose a subscription plan!
            </p>
            <Link href="/learner/subscription">
              <Button>View Plans</Button>
            </Link>
          </Card>
        )}
      </Card>
    </div>
  )
}