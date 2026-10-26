'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getUserSubscriptionClient, type SubscriptionSummary } from '@/lib/users.client'
import { formatDate } from '@/lib/utils'

const currencyFormatter = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: 'UGX',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
})

export function UserSubscriptionCard({ userId }: { userId: number }) {
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getUserSubscriptionClient(userId)
      .then(setSubscription)
      .finally(() => setLoading(false))
  }, [userId])

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">Subscription</h3>
      </header>
      <div className="p-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Loading...
          </div>
        ) : !subscription ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CreditCard size={16} /> No subscription on record.
          </div>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            <Row label="Plan">
              <span className="capitalize">{subscription.plan_type}</span>
            </Row>
            <Row label="Status">
              <Badge tone={subscription.status === 'active' ? 'success' : subscription.status === 'pending' ? 'warning' : 'default'}>
                {subscription.status}
              </Badge>
            </Row>
            <Row label="Amount">
              {subscription.amount != null ? currencyFormatter.format(subscription.amount) : '—'}
            </Row>
            <Row label="Method">{subscription.payment_method ?? '—'}</Row>
            <Row label="Started">{formatDate(subscription.start_date)}</Row>
            <Row label="Ends">{formatDate(subscription.end_date)}</Row>
          </dl>
        )}
      </div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  )
}