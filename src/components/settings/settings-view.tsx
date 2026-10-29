'use client'

import { useState } from 'react'
import { ShieldCheck, Lock, Loader2, Eye, EyeOff, Trash2, AlertTriangle, Settings } from 'lucide-react'
import { changePasswordClient } from '@/lib/settings.client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast-provider'

export function SettingsView({ role }: { role: string }) {
  const { showToast } = useToast()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const [busy, setBusy] = useState(false)

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

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
      
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl lg:text-3xl" style={{ color: 'var(--brand-primary)' }}>
          <Settings size={26} className="shrink-0 sm:h-7 sm:w-7" />
          <span>Settings</span>
        </h1>
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
                {busy && <Loader2 size={16} className="animate-spin mr-2" />}
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

          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-danger-border/40 bg-danger-bg/30 p-5 opacity-50 cursor-not-allowed sm:flex-row sm:items-center">
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
              disabled={true}
              className="w-full shrink-0 border-danger-border/40 text-danger-fg sm:w-auto pointer-events-none"
            >
              <Trash2 size={16} /> Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}