import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSessionUser } from '@/lib/auth'
import {
  getLearnerAnalyticsServer,
  getLearnerSubscriptionState,
} from '@/lib/learner-analytics.server'
import { LearnerAnalyticsView } from './learner-analytics-view'

export const metadata: Metadata = { title: 'Analytics' }
export const dynamic = 'force-dynamic'

function defaultRange(days: number) {
  const to = new Date()
  const from = new Date(to.getTime() - days * 86400000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { from: fmt(from), to: fmt(to) }
}

async function AnalyticsContent({
  from,
  to,
}: {
  from: string
  to: string
}) {
  const [data, subscription] = await Promise.all([
    getLearnerAnalyticsServer(from, to),
    getLearnerSubscriptionState(),
  ])

  return <LearnerAnalyticsView data={data} subscription={subscription} />
}

export default async function LearnerAnalyticsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string }
}) {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  const range = defaultRange(30)
  const from = searchParams.from || range.from
  const to = searchParams.to || range.to

  return (
    <Suspense
      key={`${from}:${to}`}
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Loading your analytics…
        </div>
      }
    >
      <AnalyticsContent from={from} to={to} />
    </Suspense>
  )
}