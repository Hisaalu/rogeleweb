'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getUserPaymentsClient, type PaymentRow } from '@/lib/users.client'
import { formatDate } from '@/lib/utils'

export function UserPaymentsCard({ userId }: { userId: number }) {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getUserPaymentsClient(userId)
      .then(setPayments)
      .finally(() => setLoading(false))
  }, [userId])

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">Recent payments</h3>
      </header>

      <div className="p-2">
        {loading ? (
          <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Loading...
          </div>
        ) : payments.length === 0 ? (
          <div className="flex items-center gap-3 px-3 py-4 text-sm text-muted-foreground">
            <DollarSign size={16} />
            No payments on record.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {p.plan_type ?? 'subscription'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.payment_method ?? 'unknown'} ·{' '}
                    {p.transaction_id?.slice(0, 12) ?? 'no txn'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold">
                    {p.amount != null ? p.amount.toFixed(2) : '—'}
                  </span>
                  <Badge
                    tone={
                      p.status === 'completed'
                        ? 'success'
                        : p.status === 'failed'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {p.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(p.payment_date ?? p.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}