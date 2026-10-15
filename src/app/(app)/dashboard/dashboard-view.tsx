'use client'

import Link from 'next/link'
import { BookOpen, HelpCircle, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useBranding } from '@/components/brand/brand-provider'
import type { FreeTrial, Subscription, User } from '@/types/api'
import { formatDate } from '@/lib/utils'

export function DashboardView({
  profile,
  subscription,
  trial,
}: {
  profile: User | null
  subscription: Subscription | null
  trial: FreeTrial | null
}) {
  const branding = useBranding()

  const firstName = profile?.first_name ?? 'there'
  const hasActiveSubscription = subscription?.status === 'active'
  const isInTrial = !hasActiveSubscription && !!trial && trial.days > 0
  const hasAccess = hasActiveSubscription || isInTrial

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Welcome back,{' '}
          <span style={{ color: branding.colorAccent }}>{firstName}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is an overview of your account and activity.
        </p>
      </div>

      {hasActiveSubscription && subscription && (
        <Banner
          tone="success"
          icon={<CheckCircle2 size={20} />}
          title="Active subscription"
          description={`You have full access until ${formatDate(subscription.end_date)}.`}
          action={{ label: 'Manage plan', href: '/subscription' }}
        />
      )}

      {isInTrial && trial && (
        <Banner
          tone="warning"
          icon={<Clock size={20} />}
          title={`Free trial: ${trial.days} day${trial.days === 1 ? '' : 's'} remaining`}
          description={`Ends on ${formatDate(trial.end_date)}. Subscribe now to keep full access.`}
          action={{ label: 'View plans', href: '/subscription' }}
        />
      )}

      {!hasAccess && !hasActiveSubscription && (
        <Banner
          tone="danger"
          icon={<AlertCircle size={20} />}
          title="Your trial or subscription has ended"
          description="Subscribe now to continue accessing lessons, quizzes, and materials."
          action={{ label: 'Choose a plan', href: '/subscription' }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NavCard
          href={hasAccess ? '/lessons' : '#'}
          icon={<BookOpen size={28} />}
          title="Learning materials"
          description={hasAccess ? 'Browse all lessons and resources' : 'Subscribe to unlock'}
          locked={!hasAccess}
        />
        <NavCard
          href={hasAccess ? '/quizzes' : '#'}
          icon={<HelpCircle size={28} />}
          title="Practice quizzes"
          description={hasAccess ? 'Test your knowledge' : 'Subscribe to unlock'}
          locked={!hasAccess}
        />
        <NavCard
          href="/subscription"
          icon={<CreditCard size={28} />}
          title="Subscription"
          description={
            hasActiveSubscription
              ? 'Manage your subscription'
              : isInTrial
                ? 'Upgrade to premium'
                : 'Subscribe to continue'
          }
        />
      </div>
    </div>
  )
}

function Banner({
  tone,
  icon,
  title,
  description,
  action,
}: {
  tone: 'success' | 'warning' | 'danger'
  icon: React.ReactNode
  title: string
  description: string
  action?: { label: string; href: string }
}) {
  const styles = {
    success: 'border-green-200 bg-green-50 text-green-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-900',
  }[tone]

  return (
    <div className={`flex flex-wrap items-center gap-4 rounded-xl border px-4 py-4 ${styles}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70">
        {icon}
      </div>
      <div className="min-w-[200px] flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm opacity-90">{description}</p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

function NavCard({
  href,
  icon,
  title,
  description,
  locked,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  locked?: boolean
}) {
  const branding = useBranding()
  const className = `group flex flex-col rounded-2xl border border-border bg-card p-6 transition ${
    locked ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-1 hover:shadow-lg'
  }`

  const content = (
    <>
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${branding.colorAccent}15`, color: branding.colorAccent }}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {locked && (
        <span className="mt-3 inline-block w-fit rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
          Locked
        </span>
      )}
    </>
  )

  if (locked) {
    return <div className={className}>{content}</div>
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}