'use client'

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { CreditCard, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import type { AdminSubscription } from '@/types/admin'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: 'UGX',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
})

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
    dateFormatter.format(new Date(s.start_date)),
    dateFormatter.format(new Date(s.end_date)),
  ])
  const csv = [header, ...rows]
    .map((r) =>
      r.map((c) => {
        const str = String(c ?? '')
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }).join(','),
    ).join('\n')
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

const Stat = React.memo(function Stat({
  label, value, tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'primary'
}) {
  const colors = {
    default: 'text-foreground',
    success: 'text-success-fg',
    danger: 'text-danger-fg',
    warning: 'text-warning-fg',
    primary: 'text-brand-primary',
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${colors[tone]}`}>{value}</p>
    </div>
  )
})

const SubscriptionRow = React.memo(function SubscriptionRow({ sub }: { sub: AdminSubscription }) {
  return (
    <tr className="transition hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{displayUser(sub)}</p>
          {sub.user_email && <p className="truncate text-xs text-muted-foreground">{sub.user_email}</p>}
        </div>
      </td>
      <td className="px-4 py-3 capitalize text-muted-foreground">{sub.plan_type}</td>
      <td className="px-4 py-3 font-semibold">
        {sub.amount != null ? currencyFormatter.format(sub.amount) : '—'}
      </td>
      <td className="px-4 py-3">
        <Badge tone={sub.status === 'active' ? 'success' : sub.status === 'expired' ? 'danger' : sub.status === 'pending' ? 'warning' : 'default'}>
          {sub.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{sub.auto_renew ? 'Yes' : 'No'}</td>
      <td className="px-4 py-3 text-muted-foreground">{dateFormatter.format(new Date(sub.start_date))}</td>
      <td className="px-4 py-3 text-muted-foreground">{dateFormatter.format(new Date(sub.end_date))}</td>
    </tr>
  )
})

const MobileSubscriptionCard = React.memo(function MobileSubscriptionCard({ sub }: { sub: AdminSubscription }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground">{displayUser(sub)}</span>
          {sub.user_email && <span className="truncate text-xs text-muted-foreground">{sub.user_email}</span>}
        </div>
        <Badge tone={sub.status === 'active' ? 'success' : sub.status === 'expired' ? 'danger' : sub.status === 'pending' ? 'warning' : 'default'}>
          {sub.status}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Plan</p>
          <p className="font-medium capitalize">{sub.plan_type}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="font-semibold">{sub.amount != null ? currencyFormatter.format(sub.amount) : '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Start</p>
          <p className="font-medium">{dateFormatter.format(new Date(sub.start_date))}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">End</p>
          <p className="font-medium">{dateFormatter.format(new Date(sub.end_date))}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Auto-renew: {sub.auto_renew ? 'Yes' : 'No'}</p>
    </div>
  )
})

export function SubscriptionsView({
  initialSubscriptions,
}: {
  initialSubscriptions: AdminSubscription[]
}) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const filtered = useMemo(() => {
    let list = initialSubscriptions
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase()
      list = list.filter(
        (s) =>
          (s.user_email ?? '').toLowerCase().includes(q) ||
          (s.transaction_id ?? '').toLowerCase().includes(q) ||
          s.plan_type.toLowerCase().includes(q),
      )
    }
    if (statusFilter) list = list.filter((s) => s.status === statusFilter)
    return list
  }, [initialSubscriptions, debouncedSearch, statusFilter])

  const stats = useMemo(() => {
    let active = 0, expired = 0, pending = 0, cancelled = 0
    for (const s of filtered) {
      if (s.status === 'active') active++
      else if (s.status === 'expired') expired++
      else if (s.status === 'pending') pending++
      else if (s.status === 'cancelled') cancelled++
    }
    return { active, expired, pending, cancelled }
  }, [filtered])

  const handleExport = useCallback(() => {
    exportCsv(filtered)
  }, [filtered])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Subscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse your subscriptions.</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
          <Download size={14} /> Export CSV
        </Button>
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
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No subscriptions match"
          description="Try changing the filters."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  {['User', 'Plan', 'Amount', 'Status', 'Auto-renew', 'Start', 'End'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-semibold tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => <SubscriptionRow key={s.id} sub={s} />)}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:hidden">
            {filtered.map((s) => <MobileSubscriptionCard key={s.id} sub={s} />)}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {initialSubscriptions.length} subscriptions
      </p>
    </div>
  )
}