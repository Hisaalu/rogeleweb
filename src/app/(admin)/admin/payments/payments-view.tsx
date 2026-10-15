'use client'

import { useMemo, useState } from 'react'
import { DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import type { AdminPayment } from '@/types/admin'

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
    p.payment_date ? formatDate(p.payment_date) : formatDate(p.created_at),
  ])
  const csv = [header, ...rows]
    .map((r) =>
      r
        .map((c) => {
          const s = String(c ?? '')
          if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return `"${s.replace(/"/g, '""')}"`
          }
          return s
        })
        .join(','),
    )
    .join('\n')
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

export function PaymentsView({ initialPayments }: { initialPayments: AdminPayment[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filtered = useMemo(() => {
    let list = initialPayments
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          (p.user_email ?? '').toLowerCase().includes(q) ||
          (p.transaction_id ?? '').toLowerCase().includes(q) ||
          (p.phone_number ?? '').toLowerCase().includes(q),
      )
    }
    if (statusFilter) {
      list = list.filter((p) => p.status === statusFilter)
    }
    return list
  }, [initialPayments, search, statusFilter])

  const stats = useMemo(() => {
    let completed = 0
    let failed = 0
    let pending = 0
    let total = 0
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All payment activity with filters and totals.
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
        <Stat label="Completed" value={String(stats.completed)} tone="success" />
        <Stat label="Failed" value={String(stats.failed)} tone="danger" />
        <Stat label="Collected" value={`$${stats.total.toFixed(2)}`} tone="primary" />
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
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No payments match"
          description="Try changing the filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                {['User', 'Amount', 'Plan', 'Method', 'Transaction', 'Status', 'Date'].map(
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
              {filtered.map((p) => (
                <tr key={p.id} className="transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{displayUser(p)}</p>
                      {p.user_email && (
                        <p className="truncate text-xs text-muted-foreground">
                          {p.user_email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {p.amount != null ? p.amount.toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.plan_type ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.payment_method ?? '—'}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-muted-foreground">
                    {p.transaction_id ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        p.status === 'completed'
                          ? 'success'
                          : p.status === 'failed'
                            ? 'danger'
                            : p.status === 'refunded'
                              ? 'default'
                              : 'warning'
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.payment_date ? formatDate(p.payment_date) : formatDate(p.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {initialPayments.length} payments
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
  tone?: 'default' | 'success' | 'danger' | 'primary'
}) {
  const colors = {
    default: 'text-foreground',
    success: 'text-green-600',
    danger: 'text-red-600',
    primary: 'text-brand-primary',
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${colors[tone]}`}>{value}</p>
    </div>
  )
}