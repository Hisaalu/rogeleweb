'use client'

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { DollarSign, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
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

const STATUSES = ['pending', 'completed', 'failed', 'refunded']

function displayUser(p: AdminPayment): string {
  const name = [p.user_first_name, p.user_last_name].filter(Boolean).join(' ')
  return name || p.user_email || `User #${p.user_id ?? '—'}`
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
    p.payment_date ? dateFormatter.format(new Date(p.payment_date)) : dateFormatter.format(new Date(p.created_at)),
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
  label, value, tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'success' | 'danger' | 'primary'
}) {
  const colors = {
    default: 'text-foreground',
    success: 'text-success-fg',
    danger: 'text-danger-fg',
    primary: 'text-brand-primary',
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${colors[tone]}`}>{value}</p>
    </div>
  )
})

const PaymentRow = React.memo(function PaymentRow({ payment }: { payment: AdminPayment }) {
  return (
    <tr className="transition hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{displayUser(payment)}</p>
          {payment.user_email && <p className="truncate text-xs text-muted-foreground">{payment.user_email}</p>}
        </div>
      </td>
      <td className="px-4 py-3 font-semibold">
        {payment.amount != null ? currencyFormatter.format(payment.amount) : '—'}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{payment.plan_type ?? '—'}</td>
      <td className="px-4 py-3 text-muted-foreground">{payment.payment_method ?? '—'}</td>
      <td className="max-w-[140px] truncate px-4 py-3 text-muted-foreground">{payment.transaction_id ?? '—'}</td>
      <td className="px-4 py-3">
        <Badge tone={payment.status === 'completed' ? 'success' : payment.status === 'failed' ? 'danger' : payment.status === 'refunded' ? 'default' : 'warning'}>
          {payment.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {payment.payment_date ? dateFormatter.format(new Date(payment.payment_date)) : dateFormatter.format(new Date(payment.created_at))}
      </td>
    </tr>
  )
})

const MobilePaymentCard = React.memo(function MobilePaymentCard({ payment }: { payment: AdminPayment }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground">{displayUser(payment)}</span>
          {payment.user_email && <span className="truncate text-xs text-muted-foreground">{payment.user_email}</span>}
        </div>
        <Badge tone={payment.status === 'completed' ? 'success' : payment.status === 'failed' ? 'danger' : payment.status === 'refunded' ? 'default' : 'warning'}>
          {payment.status}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="font-semibold">{payment.amount != null ? currencyFormatter.format(payment.amount) : '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Plan</p>
          <p className="font-medium">{payment.plan_type ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Method</p>
          <p className="font-medium">{payment.payment_method ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="font-medium">
            {payment.payment_date ? dateFormatter.format(new Date(payment.payment_date)) : dateFormatter.format(new Date(payment.created_at))}
          </p>
        </div>
      </div>
      {payment.transaction_id && (
        <p className="text-xs text-muted-foreground truncate">Txn: {payment.transaction_id}</p>
      )}
    </div>
  )
})

export function PaymentsView({ initialPayments }: { initialPayments: AdminPayment[] }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const filtered = useMemo(() => {
    let list = initialPayments
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase()
      list = list.filter(
        (p) =>
          (p.user_email ?? '').toLowerCase().includes(q) ||
          (p.transaction_id ?? '').toLowerCase().includes(q) ||
          (p.phone_number ?? '').toLowerCase().includes(q),
      )
    }
    if (statusFilter) list = list.filter((p) => p.status === statusFilter)
    return list
  }, [initialPayments, debouncedSearch, statusFilter])

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">All your payment activities.</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total filtered" value={String(filtered.length)} />
        <Stat label="Completed" value={String(stats.completed)} tone="success" />
        <Stat label="Failed" value={String(stats.failed)} tone="danger" />
        <Stat label="Collected" value={currencyFormatter.format(stats.total)} tone="primary" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search by email, transaction, or phone..."
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
          icon={DollarSign}
          title="No payments match"
          description="Try changing the filters."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  {['User', 'Amount', 'Plan', 'Method', 'Transaction', 'Status', 'Date'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-semibold tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => <PaymentRow key={p.id} payment={p} />)}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:hidden">
            {filtered.map((p) => <MobilePaymentCard key={p.id} payment={p} />)}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {initialPayments.length} payments
      </p>
    </div>
  )
}