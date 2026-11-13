'use client'

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { CreditCard, Download, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { listSubscriptionsClient } from '@/lib/subscriptions.client'
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

const STATUSES = ['active', 'expired', 'cancelled', 'pending'] as const

const STAT_TONES = {
  default: 'text-foreground',
  success: 'text-success-fg',
  danger: 'text-danger-fg',
  warning: 'text-warning-fg',
  primary: 'text-brand-primary',
} as const

type StatTone = keyof typeof STAT_TONES

export interface SubscriptionListMeta {
  page: number
  per_page: number
  total: number
  last_page: number
}

function displayUser(s: AdminSubscription): string {
  const full = [s.user_first_name, s.user_last_name].filter(Boolean).join(' ').trim()
  if (full) return full
  return s.user_email?.trim() || `User #${s.user_id ?? '—'}`
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
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon?: React.ElementType
  label: string
  value: string
  tone?: StatTone
}) {
  return (
    <Card className="p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
      <p className="flex items-center gap-1.5 truncate text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">
        {Icon && <Icon size={13} className="shrink-0" aria-hidden />}
        <span className="truncate">{label}</span>
      </p>
      <p className={`mt-1 truncate text-lg font-semibold tabular-nums sm:text-xl ${STAT_TONES[tone]}`}>
        {value}
      </p>
    </Card>
  )
})

const SubscriptionRow = React.memo(function SubscriptionRow({ sub }: { sub: AdminSubscription }) {
  const name = displayUser(sub)
  const showEmail = Boolean(sub.user_email) && name !== sub.user_email

  return (
    <TableRow>
      <TableCell>
        <div className="min-w-0">
          <p className="truncate font-medium">{name}</p>
          {showEmail && <p className="truncate text-xs text-muted-foreground">{sub.user_email}</p>}
        </div>
      </TableCell>
      <TableCell className="capitalize text-muted-foreground">{sub.plan_type}</TableCell>
      <TableCell className="font-semibold tabular-nums">
        {sub.amount != null ? currencyFormatter.format(sub.amount) : '—'}
      </TableCell>
      <TableCell>
        <Badge
          tone={
            sub.status === 'active'
              ? 'success'
              : sub.status === 'expired'
                ? 'danger'
                : sub.status === 'pending'
                  ? 'warning'
                  : 'default'
          }
        >
          {sub.status}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">{sub.auto_renew ? 'Yes' : 'No'}</TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {dateFormatter.format(new Date(sub.start_date))}
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {dateFormatter.format(new Date(sub.end_date))}
      </TableCell>
    </TableRow>
  )
})

const MobileSubscriptionCard = React.memo(function MobileSubscriptionCard({ sub }: { sub: AdminSubscription }) {
  const name = displayUser(sub)
  const showEmail = Boolean(sub.user_email) && name !== sub.user_email

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/30">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-foreground">{name}</span>
          {showEmail && <span className="truncate text-xs text-muted-foreground">{sub.user_email}</span>}
        </div>
        <Badge
          tone={
            sub.status === 'active'
              ? 'success'
              : sub.status === 'expired'
                ? 'danger'
                : sub.status === 'pending'
                  ? 'warning'
                  : 'default'
          }
        >
          {sub.status}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Plan</p>
          <p className="break-words font-medium capitalize">{sub.plan_type}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="break-words font-semibold tabular-nums">
            {sub.amount != null ? currencyFormatter.format(sub.amount) : '—'}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Start</p>
          <p className="break-words font-medium">{dateFormatter.format(new Date(sub.start_date))}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">End</p>
          <p className="break-words font-medium">{dateFormatter.format(new Date(sub.end_date))}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Auto-renew: {sub.auto_renew ? 'Yes' : 'No'}
      </p>
    </div>
  )
})

export function SubscriptionsView({
  initialSubscriptions,
  initialMeta,
}: {
  initialSubscriptions: AdminSubscription[]
  initialMeta: SubscriptionListMeta
}) {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>(initialSubscriptions)
  const [meta, setMeta] = useState<SubscriptionListMeta>(initialMeta)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const filtered = useMemo(() => {
    let list = subscriptions
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase()
      list = list.filter(
        (s) =>
          displayUser(s).toLowerCase().includes(q) ||
          (s.user_email ?? '').toLowerCase().includes(q) ||
          (s.transaction_id ?? '').toLowerCase().includes(q) ||
          s.plan_type.toLowerCase().includes(q),
      )
    }
    if (statusFilter) list = list.filter((s) => s.status === statusFilter)
    return list
  }, [subscriptions, debouncedSearch, statusFilter])

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

  const goToPage = useCallback(
    async (next: number) => {
      const target = Math.max(1, Math.min(next, meta.last_page))
      if (target === meta.page || fetching) return

      setFetching(true)
      try {
        const result = await listSubscriptionsClient({
          page: target,
          per_page: meta.per_page,
          status: statusFilter || undefined,
        })
        setSubscriptions(result.subscriptions)
        setMeta(result.meta)
      } catch (err) {
        console.error('[subscriptions] page fetch failed', err)
      } finally {
        setFetching(false)
      }
    },
    [meta.last_page, meta.page, meta.per_page, statusFilter, fetching],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Subscriptions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse your subscriptions.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="w-full whitespace-nowrap sm:w-auto"
        >
          <Download size={14} /> Export
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Stat icon={CreditCard} label="Total" value={String(filtered.length)} />
        <Stat icon={CheckCircle2} label="Active" value={String(stats.active)} tone="success" />
        <Stat icon={XCircle} label="Expired" value={String(stats.expired)} tone="danger" />
        <Stat icon={Clock} label="Pending" value={String(stats.pending)} tone="warning" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search by user, transaction, or plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:col-span-2"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Any status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {filtered.length === 0 && !fetching ? (
        <EmptyState
          icon={CreditCard}
          title="No subscriptions match"
          description="Try changing the filters."
        />
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm">
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {['User', 'Plan', 'Amount', 'Status', 'Auto-renew', 'Start', 'End'].map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => <SubscriptionRow key={s.id} sub={s} />)}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:hidden">
              {filtered.map((s) => <MobileSubscriptionCard key={s.id} sub={s} />)}
            </div>
          </Card>

          <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
            <span className="text-center sm:text-left">
              Showing {filtered.length} of {meta.total} subscriptions
              {meta.last_page > 1 && ` · page ${meta.page} of ${meta.last_page}`}
            </span>
            {meta.last_page > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(meta.page - 1)}
                  disabled={meta.page <= 1 || fetching}
                  className="rounded-sm border border-border bg-card px-3 py-1.5 font-medium transition hover:border-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {fetching ? <Loader2 size={12} className="animate-spin" /> : 'Previous'}
                </button>
                <span className="px-2">Page {meta.page} of {meta.last_page}</span>
                <button
                  type="button"
                  onClick={() => goToPage(meta.page + 1)}
                  disabled={meta.page >= meta.last_page || fetching}
                  className="rounded-sm border border-border bg-card px-3 py-1.5 font-medium transition hover:border-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {fetching ? <Loader2 size={12} className="animate-spin" /> : 'Next'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}