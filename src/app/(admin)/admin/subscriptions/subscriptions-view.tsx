'use client'

import { useMemo, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import type { AdminSubscription } from '@/types/admin'

const STATUSES = ['active', 'expired', 'cancelled', 'pending']

function displayUser(s: AdminSubscription): string {
  const name = [s.user_first_name, s.user_last_name].filter(Boolean).join(' ')
  return name || s.user_email || `User #${s.user_id ?? '—'}`
}

function exportCsv(subs: AdminSubscription[]) {
  const header = ['ID', 'User', 'Email', 'Plan', 'Amount', 'Status', 'Auto-renew', 'Start', 'End']
  const rows = subs.map((s) => [
    String(s.id),
    displayUser(s),
    s.user_email ?? '',
    s.plan_type,
    s.amount != null ? String(s.amount) : '',
    s.status,
    s.auto_renew ? 'Yes' : 'No',
    formatDate(s.start_date),
    formatDate(s.end_date),
  ])
  const csv = [header, ...rows]
    .map((r) =>
      r
        .map((c) => {
          const str = String(c ?? '')
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(','),
    )
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  link.href = url
  link.download = `subscriptions_${stamp}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function SubscriptionsView({
  initialSubscriptions,
}: {
  initialSubscriptions: AdminSubscription[]
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filtered = useMemo(() => {
    let list = initialSubscriptions
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          (s.user_email ?? '').toLowerCase().includes(q) ||
          (s.transaction_id ?? '').toLowerCase().includes(q) ||
          s.plan_type.toLowerCase().includes(q),
      )
    }
    if (statusFilter) list = list.filter((s) => s.status === statusFilter)
    return list
  }, [initialSubscriptions, search, statusFilter])

  const stats = useMemo(() => {
    let active = 0
    let expired = 0
    let pending = 0
    let cancelled = 0
    for (const s of filtered) {
      if (s.status === 'active') active++
      else if (s.status === 'expired') expired++
      else if (s.status === 'pending') pending++
      else if (s.status === 'cancelled') cancelled++
    }
    return { active, expired, pending, cancelled }
  }, [filtered])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Subscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse all user subscriptions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          disabled={filtered.length === 0}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-brand-accent disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total filtered" value={String(filtered.length)} />
        <Stat label="Active" value={String(stats.active)} tone="success" />
        <Stat label="Expired" value={String(stats.expired)} tone="danger" />
        <Stat label="Pending" value={String(stats.pending)} tone="warning" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search by user, transaction, or plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:col-span-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
        >
          <option value="">Any status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No subscriptions match"
          description="Try changing the filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                {['User', 'Plan', 'Amount', 'Status', 'Auto-renew', 'Start', 'End'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{displayUser(s)}</p>
                      {s.user_email && (
                        <p className="truncate text-xs text-muted-foreground">
                          {s.user_email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {s.plan_type}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {s.amount != null ? Math.round(s.amount).toLocaleString('en-US') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        s.status === 'active'
                          ? 'success'
                          : s.status === 'expired'
                            ? 'danger'
                            : s.status === 'pending'
                              ? 'warning'
                              : 'default'
                      }
                    >
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.auto_renew ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(s.start_date)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(s.end_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {initialSubscriptions.length} subscriptions
      </p>
    </div>
  )
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'primary'
}) {
  const colors = {
    default: 'text-foreground',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-amber-600',
    primary: 'text-brand-primary',
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${colors[tone]}`}>{value}</p>
    </div>
  )
}