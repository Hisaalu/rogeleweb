'use client'

import { useState } from 'react'
import {
  Ban, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Shield, UserX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast-provider'
import {
  forcePasswordResetClient, setUserPasswordClient, updateUserClient,
} from '@/lib/users.client'
import type { AdminUser, UserRole } from '@/types/admin'

type PendingAction = 'reset' | 'suspend' | 'reactivate' | 'deactivate' | 'activate' | null

export function UserActionsCard({
  user, onChange,
}: {
  user: AdminUser
  onChange: (user: AdminUser) => void
}) {
  const { showToast } = useToast()
  const [pending, setPending] = useState<PendingAction>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [setPasswordOpen, setSetPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleForceReset() {
    setBusy(true)
    try {
      const res = await forcePasswordResetClient(user.id)
      showToast(res.message ?? 'Reset email sent.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send reset', 'error')
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  async function handleSetPassword() {
    if (newPassword.length < 8) return showToast('Password must be at least 8 characters', 'error')
    if (newPassword !== confirmPassword) return showToast('Passwords do not match', 'error')

    setBusy(true)
    try {
      await setUserPasswordClient(user.id, newPassword)
      showToast('Password updated successfully.', 'success')
      setSetPasswordOpen(false)
      setNewPassword('')
      setConfirmPassword('')
      setShowPassword(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to set password', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function handleStatusAction() {
    if (!pending) return
    setBusy(true)

    let payload: Record<string, boolean> = {}
    if (pending === 'suspend') payload = { is_suspended: true }
    if (pending === 'reactivate') payload = { is_suspended: false }
    if (pending === 'deactivate') payload = { is_active: false }
    if (pending === 'activate') payload = { is_active: true }

    try {
      const updated = await updateUserClient(user.id, payload)
      onChange(updated)
      showToast('User status updated successfully.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update user', 'error')
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  async function handleRoleChange(role: UserRole) {
    setBusy(true)
    try {
      const updated = await updateUserClient(user.id, { role })
      onChange(updated)
      showToast('User role updated successfully.', 'success')
      setRoleModalOpen(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update role', 'error')
    } finally {
      setBusy(false)
    }
  }

  const currentStatus = user.is_suspended ? 'suspended' : user.is_active ? 'active' : 'deactivated'

  return (
    <>
      <section className="rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold">Actions</h3>
        </header>

        <div className="space-y-2 p-4">
          <Button variant="outline" className="w-full justify-start" onClick={() => setSetPasswordOpen(true)} disabled={busy}>
            <KeyRound size={14} /> Set new password
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setPending('reset')} disabled={busy}>
            <KeyRound size={14} /> Send password reset email
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setRoleModalOpen(true)} disabled={busy}>
            <Shield size={14} /> Change role
          </Button>

          {currentStatus === 'active' && (
            <Button variant="outline" className="w-full justify-start text-warning-fg hover:bg-warning-bg" onClick={() => setPending('suspend')} disabled={busy}>
              <Ban size={14} /> Suspend account
            </Button>
          )}
          {currentStatus === 'suspended' && (
            <Button variant="outline" className="w-full justify-start text-success-fg hover:bg-success-bg" onClick={() => setPending('reactivate')} disabled={busy}>
              <CheckCircle2 size={14} /> Reactivate account
            </Button>
          )}
          {currentStatus === 'active' && (
            <Button variant="outline" className="w-full justify-start text-danger-fg hover:bg-danger-bg" onClick={() => setPending('deactivate')} disabled={busy}>
              <UserX size={14} /> Deactivate account
            </Button>
          )}
          {currentStatus === 'deactivated' && (
            <Button variant="outline" className="w-full justify-start text-success-fg hover:bg-success-bg" onClick={() => setPending('activate')} disabled={busy}>
              <CheckCircle2 size={14} /> Activate account
            </Button>
          )}

          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Loader2 size={12} className="animate-spin" /> Working...
            </div>
          )}
        </div>
      </section>

      <Dialog open={setPasswordOpen} onOpenChange={(o) => { setSetPasswordOpen(o); if (!o) { setNewPassword(''); setConfirmPassword(''); setShowPassword(false) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set new password</DialogTitle>
            <DialogDescription>
              Directly set a new password for {user.email}. Share it with them securely.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new_password">New password</Label>
              <div className="relative">
                <Input id="new_password" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" disabled={busy} autoFocus className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <div className="relative">
                <Input id="confirm_password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat the password" disabled={busy} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetPasswordOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={handleSetPassword} disabled={busy || !newPassword || !confirmPassword}>
              {busy && <Loader2 size={14} className="animate-spin" />} Set password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={pending === 'reset'} onOpenChange={(o) => !o && setPending(null)} title="Send password reset email" description={`A reset link will be emailed to ${user.email}.`} confirmLabel="Send reset link" onConfirm={handleForceReset} />
      <ConfirmDialog open={pending === 'suspend'} onOpenChange={(o) => !o && setPending(null)} title="Suspend account" description={`${user.email} will not be able to log in until reactivated.`} confirmLabel="Suspend" destructive onConfirm={handleStatusAction} />
      <ConfirmDialog open={pending === 'reactivate'} onOpenChange={(o) => !o && setPending(null)} title="Reactivate account" description={`${user.email} will regain access to the platform.`} confirmLabel="Reactivate" onConfirm={handleStatusAction} />
      <ConfirmDialog open={pending === 'deactivate'} onOpenChange={(o) => !o && setPending(null)} title="Deactivate account" description={`${user.email} will be marked inactive. They can be reactivated later.`} confirmLabel="Deactivate" destructive onConfirm={handleStatusAction} />
      <ConfirmDialog open={pending === 'activate'} onOpenChange={(o) => !o && setPending(null)} title="Activate account" description={`${user.email}'s account will be marked active again.`} confirmLabel="Activate" onConfirm={handleStatusAction} />

      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>Choose the new role for this user.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {(['learner', 'teacher', 'external', 'admin'] as UserRole[]).map((r) => (
              <button key={r} type="button" onClick={() => handleRoleChange(r)} disabled={busy || r === user.role} className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${r === user.role ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-border hover:border-brand-accent'} disabled:cursor-not-allowed`}>
                <span className="capitalize">{r}</span>
                {r === user.role && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModalOpen(false)} disabled={busy}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}