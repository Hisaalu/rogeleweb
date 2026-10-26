'use client'

import { useMemo, useState, useCallback } from 'react'
import { CreditCard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast-provider'
import {
  createPlanClient,
  deletePlanClient,
  updatePlanClient,
} from '@/lib/plans.client'
import type { SubscriptionPlan } from '@/types/admin'
import { PlanTable } from './plan-table'
import { PlanFormModal, type PlanFormValues } from './plan-form-modal'

export function PlansView({ initialPlans }: { initialPlans: SubscriptionPlan[] }) {
  const { showToast } = useToast()

  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionPlan | null>(null)

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

  const handleNew = useCallback(() => {
    setEditing(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((p: SubscriptionPlan) => {
    setEditing(p)
    setFormOpen(true)
  }, [])

  const handleFormSubmit = useCallback(async (values: PlanFormValues) => {
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
        showToast('Plan updated successfully.', 'success')
      } else {
        const created = await createPlanClient(payload)
        setPlans((list) => [created, ...list])
        showToast('Plan created successfully.', 'success')
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save plan')
    }
  }, [editing, showToast])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deletePlanClient(deleteTarget.id)
      setPlans((list) => list.filter((p) => p.id !== deleteTarget.id))
      showToast('Plan deleted.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget, showToast])

  const handleToggleActive = useCallback(async (p: SubscriptionPlan) => {
    try {
      const updated = await updatePlanClient(p.id, { is_active: !p.is_active })
      setPlans((list) => list.map((x) => (x.id === updated.id ? updated : x)))
      showToast(updated.is_active ? 'Plan activated.' : 'Plan deactivated.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update plan', 'error')
    }
  }, [showToast])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define Subscription Plans.
          </p>
        </div>

        <Button onClick={handleNew}>
          <Plus size={16} /> New plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No plans yet"
          description="Create your first plan so users can subscribe."
          action={
            <Button onClick={handleNew}>
              <Plus size={16} /> New plan
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