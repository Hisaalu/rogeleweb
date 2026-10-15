'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { AdminUser } from '@/types/admin'

type Action = 'suspend' | 'reactivate' | 'deactivate' | 'activate'

function name(u: AdminUser): string {
  const n = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return n || u.email
}

function pickAction(u: AdminUser): Action {
  if (u.is_suspended) return 'reactivate'
  if (u.is_active) return 'suspend'
  return 'activate'
}

export function UserStatusModal({
  user,
  onClose,
  onSubmit,
}: {
  user: AdminUser | null
  onClose: () => void
  onSubmit: (user: AdminUser, action: Action) => Promise<void>
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null

  const action = pickAction(user)

  const titles: Record<Action, string> = {
    suspend: 'Suspend user',
    reactivate: 'Reactivate user',
    deactivate: 'Deactivate user',
    activate: 'Activate user',
  }

  const descriptions: Record<Action, string> = {
    suspend: `${name(user)} will not be able to log in until you reactivate them.`,
    reactivate: `${name(user)} will regain access to the platform.`,
    deactivate: `${name(user)}'s account will be marked inactive. They can be re-activated later.`,
    activate: `${name(user)}'s account will be marked active again.`,
  }

  const destructive = action === 'suspend' || action === 'deactivate'
  const confirmLabel = titles[action].split(' ')[0]

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(user, action)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={user !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {destructive && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
            )}
            <div>
              <DialogTitle>{titles[action]}</DialogTitle>
              <DialogDescription>{descriptions[action]}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}