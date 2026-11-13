'use client'

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { DollarSign, Download, Loader2, CheckCircle2, XCircle, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { listPaymentsClient } from '@/lib/payments.client'
import type { AdminPayment } from '@/types/admin'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: 'UGX',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
})

const STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const

const STAT_TONES = {
  default: 'text-foreground',
  success: 'text-success-fg',
  danger: 'text-danger-fg',
  primary: 'text-brand-primary',
} as const

type StatTone = keyof typeof STAT_TONES

export interface PaymentListMeta {
  page: number
  per_page: number
  total: number
  last_page: number
}

function displayUser(p: AdminPayment): string {
  const full = [p.user_first_name, p.user_last_name].filter(Boolean).join(' ').trim()
  if (full) return full
  return p.user_email?.trim() || `User #${p.user_id ?? '—'}`
}

function statusTone(status: string): 'success' | 'danger' | 'default' | 'warning' {
  if (status === 'completed') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'refunded') return 'default'
  return 'warning'
}

function exportCsv(payments: AdminPayment[]) {
  const header = ['ID', 'User', 'Email', 'Amount', 'Plan', 'Method', 'Transaction', 'Status', 'Date']
  const rows = payments.map((p) => [
    String(p.id),
    displayUser(p),
    p.user_email ?? '',
    p.amount != null ? String(p.amount) : '',
    p.plan_type ?? '',
    p.payment_method ?? '',
    p.transaction_id ?? '',
    p.status,
    p.payment_date
      ? dateFormatter.format(new Date(p.payment_date))
      : dateFormatter.format(new Date(p.created_at)),
  ])
  const csv = [header, ...rows]
    .map((r) =>
      r.map((c) => {
        const s = String(c ?? '')
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`
        }
        return s
      }).join(','),
    ).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  link.href = url
  link.download = `payments_${stamp}.csv`
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

const PaymentRow = React.memo(function PaymentRow({ payment }: { payment: AdminPayment }) {
  const name = displayUser(payment)
  const showEmail = Boolean(payment.user_email) && name !== payment.user_email

  return (
    <TableRow>
      <TableCell>
        <div className="min-w-0">
          <p className="truncate font-medium">{name}</p>
          {showEmail && <p className="truncate text-xs text-muted-foreground">{payment.user_email}</p>}
        </div>
      </TableCell>
      <TableCell className="font-semibold tabular-nums">
        {payment.amount != null ? currencyFormatter.format(payment.amount) : '—'}
      </TableCell>
      <TableCell className="text-muted-foreground">{payment.plan_type ?? '—'}</TableCell>
      <TableCell className="text-muted-foreground">{payment.payment_method ?? '—'}</TableCell>
      <TableCell className="max-w-[140px] truncate text-muted-foreground">
        {payment.transaction_id ?? '—'}
      </TableCell>
      <TableCell>
        <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {payment.payment_date
          ? dateFormatter.format(new Date(payment.payment_date))
          : dateFormatter.format(new Date(payment.created_at))}
      </TableCell>
    </TableRow>
  )
})

const MobilePaymentCard = React.memo(function MobilePaymentCard({ payment }: { payment: AdminPayment }) {
  const name = displayUser(payment)
  const showEmail = Boolean(payment.user_email) && name !== payment.user_email

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/30">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-foreground">{name}</span>
          {showEmail && <span className="truncate text-xs text-muted-foreground">{payment.user_email}</span>}
        </div>
        <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="break-words font-semibold tabular-nums">
            {payment.amount != null ? currencyFormatter.format(payment.amount) : '—'}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Plan</p>
          <p className="break-words font-medium">{payment.plan_type ?? '—'}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Method</p>
          <p className="break-words font-medium">{payment.payment_method ?? '—'}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="break-words font-medium">
            {payment.payment_date
              ? dateFormatter.format(new Date(payment.payment_date))
              : dateFormatter.format(new Date(payment.created_at))}
          </p>
        </div>
      </div>
      {payment.transaction_id && (
        <p className="truncate text-xs text-muted-foreground">Txn: {payment.transaction_id}</p>
      )}
    </div>
  )
})

export function PaymentsView({
  initialPayments,
  initialMeta,
}: {
  initialPayments: AdminPayment[]
  initialMeta: PaymentListMeta
}) {
  const [payments, setPayments] = useState<AdminPayment[]>(initialPayments)
  const [meta, setMeta] = useState<PaymentListMeta>(initialMeta)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const filtered = useMemo(() => {
    let list = payments
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase()
      list = list.filter(
        (p) =>
          displayUser(p).toLowerCase().includes(q) ||
          (p.user_email ?? '').toLowerCase().includes(q) ||
          (p.transaction_id ?? '').toLowerCase().includes(q) ||
          (p.phone_number ?? '').toLowerCase().includes(q),
      )
    }
    if (statusFilter) list = list.filter((p) => p.status === statusFilter)
    return list
  }, [payments, debouncedSearch, statusFilter])

  const stats = useMemo(() => {
    let completed = 0, failed = 0, pending = 0, total = 0
    for (const p of filtered) {
      if (p.status === 'completed') {
        completed++
        total += p.amount ?? 0
      }
      if (p.status === 'failed') failed++
      if (p.status === 'pending') pending++
    }
    return { completed, failed, pending, total }
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
        const result = await listPaymentsClient({
          page: target,
          per_page: meta.per_page,
          status: statusFilter || undefined,
        })
        setPayments(result.payments)
        setMeta(result.meta)
      } catch (err) {
        console.error('[payments] page fetch failed', err)
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
          <h1 className="text-2xl font-bold sm:text-3xl">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All your payment activities.
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
        <Stat icon={DollarSign} label="Total" value={String(filtered.length)} />
        <Stat icon={CheckCircle2} label="Completed" value={String(stats.completed)} tone="success" />
        <Stat icon={XCircle} label="Failed" value={String(stats.failed)} tone="danger" />
        <Stat icon={Wallet} label="Collected" value={currencyFormatter.format(stats.total)} tone="primary" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search by email, transaction, or phone..."
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
          icon={DollarSign}
          title="No payments match"
          description="Try changing the filters."
        />
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm">
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {['User', 'Amount', 'Plan', 'Method', 'Transaction', 'Status', 'Date'].map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => <PaymentRow key={p.id} payment={p} />)}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:hidden">
              {filtered.map((p) => <MobilePaymentCard key={p.id} payment={p} />)}
            </div>
          </Card>

          <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
            <span className="text-center sm:text-left">
              Showing {filtered.length} of {meta.total} payments
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