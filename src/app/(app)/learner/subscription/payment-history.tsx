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
    .sort((a, b) => {
      const dateA = new Date(a.created_at ?? 0).getTime()
      const dateB = new Date(b.created_at ?? 0).getTime()
      return dateB - dateA
    })
    .slice(0, 5)

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
        Recent Payments
      </h2>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-8 text-center">
          <History size={32} className="mb-2 opacity-30 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No payment history found.</p>
        </div>
      ) : (
        <>
          <div className="hidden w-full overflow-hidden rounded-xl border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {recent.map((p) => {
                  const s = statusStyle(p.status)
                  return (
                    <tr key={p.id} className="transition hover:bg-muted/20">
                      <td className="whitespace-nowrap px-4 py-3 text-foreground">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {planName(p.plan_type)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {formatMoneyUGX(p.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Smartphone size={14} className="shrink-0" />
                          <span className="capitalize">{p.payment_method ?? 'Mobile Money'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
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

          <div className="grid gap-3 md:hidden">
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
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(p.created_at)}
                    </p>
                    <p className="mt-1.5 text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
                      {formatMoneyUGX(p.amount)}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: s.bg, color: s.fg }}
                  >
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}