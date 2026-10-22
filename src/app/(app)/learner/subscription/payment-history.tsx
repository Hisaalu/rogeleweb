'use client'

import { History, Smartphone } from 'lucide-react'
import type { Payment, SubscriptionPlan } from '@/types/subscription'
import { formatMoneyUGX } from '@/lib/format-money'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusStyle(status: string): { bg: string; fg: string; label: string } {
  const s = status.toLowerCase()
  if (s === 'completed' || s === 'active' || s === 'success')
    return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', label: 'Completed' }
  if (s === 'pending' || s === 'processing')
    return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', label: 'Pending' }
  if (s === 'failed' || s === 'expired' || s === 'cancelled')
    return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', label: 'Failed' }
  return { bg: 'hsl(var(--muted))', fg: 'hsl(var(--muted-foreground))', label: status }
}

export function PaymentHistory({
  payments,
  plans,
}: {
  payments: Payment[]
  plans: SubscriptionPlan[]
}) {
  const recent = [...payments]
    .sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime(),
    )
    .slice(0, 8)

  const planName = (planType: string | null | undefined): string => {
    if (!planType) return 'N/A'
    const id = Number(planType)
    if (Number.isFinite(id)) {
      const plan = plans.find((p) => p.id === id)
      if (plan) return plan.name
    }
    return planType
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
        <History size={18} style={{ color: 'var(--brand-primary)' }} />
        Payment History
      </h2>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Date</th>
              <th className="px-4 py-2.5 font-semibold">Plan</th>
              <th className="px-4 py-2.5 font-semibold">Amount</th>
              <th className="px-4 py-2.5 font-semibold">Method</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recent.map((p) => {
              const s = statusStyle(p.status)
              return (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3 font-medium">{planName(p.plan_type)}</td>
                  <td className="px-4 py-3">{formatMoneyUGX(p.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Smartphone size={13} />
                      {p.payment_method ?? 'Mobile Money'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: s.bg, color: s.fg }}
                    >
                      {s.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 md:hidden">
        {recent.map((p) => {
          const s = statusStyle(p.status)
          return (
            <div
              key={p.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {planName(p.plan_type)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(p.created_at)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatMoneyUGX(p.amount)}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: s.bg, color: s.fg }}
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}