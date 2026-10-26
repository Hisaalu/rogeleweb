'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import type { AdminUser, UserRole } from '@/types/admin'

function name(u: AdminUser): string {
  const n = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return n || u.email
}

export function UserRoleModal({
  user,
  onClose,
  onSubmit,
}: {
  user: AdminUser | null
  onClose: () => void
  onSubmit: (user: AdminUser, role: UserRole) => Promise<void>
}) {
  const [role, setRole] = useState<UserRole>('learner')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setRole(user.role)
      setError(null)
    }
  }, [user])

  if (!user) return null

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(user, role)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={user !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            Change the role of {name(user)}. This affects what they can see and do.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={submitting}
          >
            <option value="learner">Learner</option>
            <option value="teacher">Teacher</option>
            <option value="external">External</option>
            <option value="admin">Admin</option>
          </Select>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || role === user.role}>
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Save role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}