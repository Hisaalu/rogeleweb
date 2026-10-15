'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  CreditCard,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import type { SubscriptionPlan } from '@/types/admin'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

function formatDuration(days: number): string {
  if (days === 30 || days === 31) return 'Monthly'
  if (days === 90 || days === 91 || days === 92) return 'Termly'
  if (days === 365 || days === 366) return 'Yearly'
  return `${days} days`
}

export function PlanTable({
  plans,
  onEdit,
  onDelete,
  onToggleActive,
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
          <TableRow key={p.id}>
            <TableCell className="max-w-xs">
              <span className="font-medium">{p.name}</span>
              {p.description && (
                <span className="mt-0.5 block line-clamp-1 text-xs text-muted-foreground">
                  {p.description}
                </span>
              )}
            </TableCell>
            <TableCell className="font-semibold">{formatPrice(p.price)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDuration(p.duration_days)} ({p.duration_days} days)
            </TableCell>
            <TableCell>
              {p.is_active ? (
                <Badge tone="success">Active</Badge>
              ) : (
                <Badge>Inactive</Badge>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(p.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <RowActions
                plan={p}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function RowActions({
  plan,
  onEdit,
  onDelete,
  onToggleActive,
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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label="Row actions"
      >
        <MoreHorizontal size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <button
            type="button"
            onClick={() => {
              onEdit(plan)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleActive(plan)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
          >
            {plan.is_active ? (
              <>
                <XCircle size={14} />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Activate
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(plan)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}