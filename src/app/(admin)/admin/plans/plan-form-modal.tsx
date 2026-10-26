'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import type { SubscriptionPlan } from '@/types/admin'

export interface PlanFormValues {
  name: string
  description: string
  price: number
  duration_days: number
  is_active: boolean
}

const EMPTY: PlanFormValues = {
  name: '', description: '', price: 0, duration_days: 30, is_active: true,
}

const DURATION_PRESETS = [
  { label: 'Monthly (30 days)', days: 30 },
  { label: 'Termly (90 days)', days: 90 },
  { label: 'Yearly (365 days)', days: 365 },
]

function fromPlan(p: SubscriptionPlan): PlanFormValues {
  return {
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    duration_days: p.duration_days,
    is_active: p.is_active,
  }
}

export function PlanFormModal({
  open, onOpenChange, plan, onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: SubscriptionPlan | null
  onSubmit: (values: PlanFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<PlanFormValues>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues(plan ? fromPlan(plan) : EMPTY)
    setError(null)
  }, [plan, open])

  function set<K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!values.name.trim()) return setError('Name is required')
    if (values.price < 0) return setError('Price must be zero or greater')
    if (values.duration_days < 1) return setError('Duration must be at least 1 day')

    setSubmitting(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save plan')
    } finally {
      setSubmitting(false)
    }
  }

  const matchedPreset = DURATION_PRESETS.find((p) => p.days === values.duration_days)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit plan' : 'New plan'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Monthly Basic" autoFocus disabled={submitting} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={values.description} onChange={(e) => set('description', e.target.value)} placeholder="What this plan includes..." rows={3} disabled={submitting} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (UGX)</Label>
              <Input id="price" type="number" min={0} step="1" value={values.price} onChange={(e) => set('price', Number(e.target.value) || 0)} disabled={submitting} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration_preset">Duration</Label>
              <Select id="duration_preset" value={matchedPreset ? String(matchedPreset.days) : 'custom'} onChange={(e) => { const v = e.target.value; if (v === 'custom') set('duration_days', values.duration_days || 30); else set('duration_days', Number(v)) }} disabled={submitting}>
                {DURATION_PRESETS.map((p) => <option key={p.days} value={p.days}>{p.label}</option>)}
                <option value="custom">Custom</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="duration_days">Duration (days)</Label>
            <Input id="duration_days" type="number" min={1} value={values.duration_days} onChange={(e) => set('duration_days', Number(e.target.value) || 1)} disabled={submitting} />
            <p className="text-xs text-muted-foreground">
              {values.duration_days >= 365 ? 'Equivalent to about 1 year.' : values.duration_days >= 90 ? 'Equivalent to about 1 term.' : values.duration_days >= 28 ? 'Equivalent to about 1 month.' : 'Custom duration.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input id="is_active" type="checkbox" checked={values.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-4 w-4 rounded border-input" disabled={submitting} />
            <Label htmlFor="is_active" className="cursor-pointer font-normal">
              Active (visible to users choosing a plan)
            </Label>
          </div>

          {error && (
            <div className="rounded-lg border border-danger-border/40 bg-danger-bg px-3 py-2 text-sm text-danger-fg">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {plan ? 'Save changes' : 'Create plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}