'use client'

import { useMemo, useState } from 'react'
import { CreditCard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useBranding } from '@/components/brand/brand-provider'
import {
  createPlanClient,
  deletePlanClient,
  updatePlanClient,
} from '@/lib/plans.client'
import type { SubscriptionPlan } from '@/types/admin'
import { PlanTable } from './plan-table'
import { PlanFormModal, type PlanFormValues } from './plan-form-modal'

export function PlansView({ initialPlans }: { initialPlans: SubscriptionPlan[] }) {
  const branding = useBranding()

  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = plans
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q),
      )
    }
    if (activeFilter !== null) {
      list = list.filter((p) => p.is_active === activeFilter)
    }
    return list
  }, [plans, search, activeFilter])

  function handleNew() {
    setEditing(null)
    setError(null)
    setFormOpen(true)
  }

  function handleEdit(p: SubscriptionPlan) {
    setEditing(p)
    setError(null)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: PlanFormValues) {
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        price: values.price,
        duration_days: values.duration_days,
        is_active: values.is_active,
      }

      if (editing) {
        const updated = await updatePlanClient(editing.id, payload)
        setPlans((list) => list.map((p) => (p.id === updated.id ? updated : p)))
      } else {
        const created = await createPlanClient(payload)
        setPlans((list) => [created, ...list])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save plan'
      throw new Error(message)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deletePlanClient(deleteTarget.id)
      setPlans((list) => list.filter((p) => p.id !== deleteTarget.id))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
      setDeleteTarget(null)
    }
  }

  async function handleToggleActive(p: SubscriptionPlan) {
    try {
      const updated = await updatePlanClient(p.id, { is_active: !p.is_active })
      setPlans((list) => list.map((x) => (x.id === updated.id ? updated : x)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Subscription plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define the plans users can subscribe to.
          </p>
        </div>

        <Button onClick={handleNew} style={{ backgroundColor: branding.colorPrimary }}>
          <Plus size={16} />
          New plan
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {plans.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No plans yet"
          description="Create your first plan so users can subscribe."
          action={
            <Button onClick={handleNew}>
              <Plus size={16} />
              New plan
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={activeFilter === null ? '' : activeFilter ? 'true' : 'false'}
              onChange={(e) => {
                const v = e.target.value
                setActiveFilter(v === '' ? null : v === 'true')
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            >
              <option value="">Any status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <div className="hidden lg:block" />
          </div>

          <PlanTable
            plans={filtered}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onToggleActive={handleToggleActive}
          />

          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {plans.length}
          </p>
        </>
      )}

      <PlanFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        plan={editing}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete plan"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently deleted. If any subscription references this plan, deletion will be blocked.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}