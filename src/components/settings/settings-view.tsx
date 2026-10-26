'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Lock, LogOut, Loader2, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react'
import { changePasswordClient, deleteAccountClient } from '@/lib/settings.client'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast-provider'

export function SettingsView({ role }: { role: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showToast('Please fill out all fields', 'error')
    }
    if (newPassword !== confirmPassword) {
      return showToast('New passwords do not match', 'error')
    }
    if (newPassword.length < 8) {
      return showToast('Password must be at least 8 characters', 'error')
    }

    setBusy(true)
    try {
      await changePasswordClient({
        current_password: currentPassword,
        new_password: newPassword,
      })
      showToast('Password changed successfully', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password'
      showToast(message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.replace('/login')
      router.refresh()
    } catch {
      showToast('Failed to log out', 'error')
      setIsLoggingOut(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') {
      return showToast('Please type DELETE to confirm', 'error')
    }

    setDeleting(true)
    try {
      await deleteAccountClient()
      showToast('Account deleted successfully. Redirecting...', 'success')
      setTimeout(() => {
        router.replace('/login')
        router.refresh()
      }, 1500)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete account', 'error')
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account security and preferences</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <h2 className="mb-6 flex items-center gap-2 border-b border-border pb-4 text-base font-semibold text-foreground sm:text-lg">
            <Lock size={18} style={{ color: 'var(--brand-accent)' }} />
            Change Password
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrent ? 'text' : 'password'} 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-12 text-sm outline-none transition focus:border-brand-accent sm:py-3" 
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground transition hover:text-foreground"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">New Password</label>
              <div className="relative">
                <input 
                  type={showNew ? 'text' : 'password'} 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-12 text-sm outline-none transition focus:border-brand-accent sm:py-3" 
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground transition hover:text-foreground"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirm ? 'text' : 'password'} 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-12 text-sm outline-none transition focus:border-brand-accent sm:py-3" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground transition hover:text-foreground"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={busy} 
                className="w-full sm:w-auto"
              >
                {busy && <Loader2 size={16} className="animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <h2 className="mb-6 flex items-center gap-2 border-b border-border pb-4 text-base font-semibold text-foreground sm:text-lg">
            <ShieldCheck size={18} style={{ color: 'var(--brand-accent)' }} />
            Account Security
          </h2>

          <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-muted/30 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-foreground">Sign out of your account</p>
              <p className="text-sm text-muted-foreground">You will be required to log in again to access your dashboard.</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setLogoutOpen(true)}
              className="w-full shrink-0 sm:w-auto"
            >
              <LogOut size={16} /> Log Out
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-danger-border/40 bg-danger-bg/30 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-2 font-semibold text-danger-fg">
                <AlertTriangle size={16} /> Delete account
              </p>
              <p className="text-sm text-danger-fg/80 mt-1">
                Permanently remove your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                setDeleteConfirmText('')
                setDeleteOpen(true)
              }}
              className="w-full shrink-0 border-danger-border/40 text-danger-fg hover:bg-danger-bg sm:w-auto"
            >
              <Trash2 size={16} /> Delete Account
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out of account"
        description="Are you sure you want to log out? Any unsaved changes will be lost."
        confirmLabel="Log out"
        destructive
        loading={isLoggingOut}
        onConfirm={handleLogout}
      />

      <Dialog open={deleteOpen} onOpenChange={(o) => !o && setDeleteOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger-fg">
              <AlertTriangle size={20} /> Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data, including progress and submissions, will be erased.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <p className="text-sm text-foreground">
              Please type <strong className="text-danger-fg">DELETE</strong> to confirm.
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="uppercase"
              disabled={deleting}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteAccount} 
              disabled={deleting || deleteConfirmText !== 'DELETE'}
            >
              {deleting && <Loader2 size={14} className="animate-spin" />} 
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}