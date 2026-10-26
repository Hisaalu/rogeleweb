'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2, CreditCard, MoreHorizontal, Pencil, Trash2, XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { SubscriptionPlan } from '@/types/admin'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: 'UGX',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
})

function formatDuration(days: number): string {
  if (days === 30 || days === 31) return 'Monthly'
  if (days === 90 || days === 91 || days === 92) return 'Termly'
  if (days === 365 || days === 366) return 'Yearly'
  return `${days} days`
}

const RowActions = React.memo(function RowActions({
  plan, onEdit, onDelete, onToggleActive,
}: {
  plan: SubscriptionPlan
  onEdit: (p: SubscriptionPlan) => void
  onDelete: (p: SubscriptionPlan) => void
  onToggleActive: (p: SubscriptionPlan) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label="Row actions">
        <MoreHorizontal size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <button type="button" onClick={() => { onEdit(plan); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted">
            <Pencil size={14} /> Edit
          </button>
          <button type="button" onClick={() => { onToggleActive(plan); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted">
            {plan.is_active ? (<><XCircle size={14} /> Deactivate</>) : (<><CheckCircle2 size={14} /> Activate</>)}
          </button>
          <button type="button" onClick={() => { onDelete(plan); setOpen(false) }} className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-danger-fg transition hover:bg-danger-bg">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
})

const PlanRow = React.memo(function PlanRow({
  plan, onEdit, onDelete, onToggleActive,
}: {
  plan: SubscriptionPlan
  onEdit: (p: SubscriptionPlan) => void
  onDelete: (p: SubscriptionPlan) => void
  onToggleActive: (p: SubscriptionPlan) => void
}) {
  return (
    <TableRow>
      <TableCell className="max-w-xs">
        <span className="font-medium">{plan.name}</span>
        {plan.description && (
          <span className="mt-0.5 block line-clamp-1 text-xs text-muted-foreground">
            {plan.description}
          </span>
        )}
      </TableCell>
      <TableCell className="font-semibold">{currencyFormatter.format(plan.price)}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDuration(plan.duration_days)} ({plan.duration_days} days)
      </TableCell>
      <TableCell>
        {plan.is_active ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {dateFormatter.format(new Date(plan.created_at))}
      </TableCell>
      <TableCell className="text-right">
        <RowActions plan={plan} onEdit={onEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
      </TableCell>
    </TableRow>
  )
})

const MobilePlanCard = React.memo(function MobilePlanCard({
  plan, onEdit, onDelete, onToggleActive,
}: {
  plan: SubscriptionPlan
  onEdit: (p: SubscriptionPlan) => void
  onDelete: (p: SubscriptionPlan) => void
  onToggleActive: (p: SubscriptionPlan) => void
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground">{plan.name}</span>
          {plan.description && <span className="truncate text-xs text-muted-foreground">{plan.description}</span>}
        </div>
        <RowActions plan={plan} onEdit={onEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="font-semibold">{currencyFormatter.format(plan.price)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Duration</p>
          <p className="font-medium">{formatDuration(plan.duration_days)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">{dateFormatter.format(new Date(plan.created_at))}</span>
        {plan.is_active ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
      </div>
    </div>
  )
})

export function PlanTable({
  plans, onEdit, onDelete, onToggleActive,
}: {
  plans: SubscriptionPlan[]
  onEdit: (p: SubscriptionPlan) => void
  onDelete: (p: SubscriptionPlan) => void
  onToggleActive: (p: SubscriptionPlan) => void
}) {
  if (plans.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No matching plans"
        description="Try changing the filters or search term."
      />
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((p) => (
              <PlanRow key={p.id} plan={p} onEdit={onEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:hidden">
        {plans.map((p) => (
          <MobilePlanCard key={p.id} plan={p} onEdit={onEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
        ))}
      </div>
    </div>
  )
}