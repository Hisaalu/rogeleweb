'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Lock, LogOut, Loader2, Eye, EyeOff } from 'lucide-react'
import { changePasswordClient } from '@/lib/settings.client'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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
  
  const [logoutOpen, setLogoutOpen] = useState(false)
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
              <button 
                type="submit" 
                disabled={busy} 
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 sm:w-auto sm:px-8 sm:py-3" 
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                {busy && <Loader2 size={16} className="animate-spin" />}
                Update Password
              </button>
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
            <button 
              onClick={() => setLogoutOpen(true)}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto" 
              style={{ backgroundColor: 'var(--danger-border)' }}
            >
              <LogOut size={16} /> Log Out
            </button>
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
    </div>
  )
}