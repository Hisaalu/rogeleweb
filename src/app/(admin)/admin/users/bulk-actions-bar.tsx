'use client'

import { useState } from 'react'
import { Ban, CheckCircle2, Loader2, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { AdminUser, Class, UserRole } from '@/types/admin'
import { ExportButton } from './export-button'

type BulkAction = 'suspend' | 'reactivate' | 'role' | null

export function BulkActionsBar({
  selectedUsers,
  classes,
  onClear,
  onSuspend,
  onReactivate,
  onSetRole,
  busy,
}: {
  selectedUsers: AdminUser[]
  classes: Class[]
  onClear: () => void
  onSuspend: () => Promise<void>
  onReactivate: () => Promise<void>
  onSetRole: (role: UserRole) => Promise<void>
  busy: boolean
}) {
  const [pending, setPending] = useState<BulkAction>(null)

  const selectedCount = selectedUsers?.length ?? 0
  if (selectedCount === 0) return null

  async function handle(action: Exclude<BulkAction, 'role' | null>) {
    if (action === 'suspend') await onSuspend()
    if (action === 'reactivate') await onReactivate()
    setPending(null)
  }

  async function handleRole(role: UserRole) {
    await onSetRole(role)
    setPending(null)
  }

  return (
    <>
      <div className="sticky top-14 z-20 flex flex-wrap items-center gap-2 rounded-lg border border-brand-primary/30 bg-brand-primary/5 px-4 py-3 shadow-sm">
        <span className="text-sm font-medium text-brand-primary">
          {selectedCount} user{selectedCount === 1 ? '' : 's'} selected
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <ExportButton
            users={selectedUsers}
            classes={classes}
            label="Export selected"
            filename={`users_selected_${new Date().toISOString().slice(0, 10)}.csv`}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPending('role')}
            disabled={busy}
          >
            <Shield size={14} />
            Change role
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPending('suspend')}
            disabled={busy}
            className="text-amber-700 hover:bg-amber-50"
          >
            <Ban size={14} />
            Suspend
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPending('reactivate')}
            disabled={busy}
            className="text-green-700 hover:bg-green-50"
          >
            <CheckCircle2 size={14} />
            Reactivate
          </Button>

          {busy && <Loader2 size={14} className="animate-spin text-muted-foreground" />}

          <button
            type="button"
            onClick={onClear}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Clear selection"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={pending === 'suspend'}
        onOpenChange={(o) => !o && setPending(null)}
        title={`Suspend ${selectedCount} user${selectedCount === 1 ? '' : 's'}`}
        description="They will not be able to log in until reactivated."
        confirmLabel="Suspend"
        destructive
        onConfirm={() => handle('suspend')}
      />

      <ConfirmDialog
        open={pending === 'reactivate'}
        onOpenChange={(o) => !o && setPending(null)}
        title={`Reactivate ${selectedCount} user${selectedCount === 1 ? '' : 's'}`}
        description="They will regain access to the platform."
        confirmLabel="Reactivate"
        onConfirm={() => handle('reactivate')}
      />

      <Dialog open={pending === 'role'} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change role for {selectedCount} users</DialogTitle>
            <DialogDescription>
              All selected users will have their role changed. This affects their
              permissions on the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            {(['learner', 'teacher', 'external', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRole(r)}
                disabled={busy}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-left text-sm font-medium capitalize transition hover:border-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{r}</span>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPending(null)}
              disabled={busy}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}