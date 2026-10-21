'use client'

import { useState } from 'react'
import { Lock, Shield, Key, Eye, EyeOff, Save, CheckCircle2, AlertTriangle } from 'lucide-react'
import { changePasswordClient } from '@/lib/settings.client'
import { ToastViewport, type ToastMessage, type ToastTone } from '@/components/ui/toast'

type Tab = 'password' | 'privacy'

export function SettingsView({ role }: { role: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('password')
  const [busy, setBusy] = useState(false)

  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const pushToast = (message: string, tone: ToastTone) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, tone }])
  }
  const closeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [publicProfile, setPublicProfile] = useState(true)
  const [showContact, setShowContact] = useState(true)
  const [leaderboard, setLeaderboard] = useState(true)
  const [dataCollection, setDataCollection] = useState(true)

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return pushToast('New passwords do not match', 'error')
    }
    if (newPassword.length < 8) {
      return pushToast('Password must be at least 8 characters', 'error')
    }

    setBusy(true)
    try {
      await changePasswordClient({
        current_password: currentPassword,
        new_password: newPassword,
      })
      pushToast('Password updated successfully!', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      pushToast(err.message || 'Failed to change password', 'error')
    } finally {
      setBusy(false)
    }
  }

  function handlePrivacySubmit(e: React.FormEvent) {
    e.preventDefault()
    pushToast('Privacy settings saved successfully!', 'success')
  }

  const getStrength = () => {
    let s = 0
    if (newPassword.length >= 8) s++
    if (/[a-z]/.test(newPassword)) s++
    if (/[A-Z]/.test(newPassword)) s++
    if (/[0-9]/.test(newPassword)) s++
    if (/[$@#&!]/.test(newPassword)) s++
    return s
  }
  const strength = getStrength()

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <Shield size={28} style={{ color: 'var(--brand-primary)' }} />
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveTab('password')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
            activeTab === 'password'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          <Lock size={16} /> Change Password
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
            activeTab === 'privacy'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          <Shield size={16} /> Privacy
        </button>
      </div>

      {activeTab === 'password' && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-foreground" style={{ color: 'var(--brand-accent)' }}>
            <Key size={20} /> Change Password
          </h2>
          <p className="mb-8 border-b border-border pb-4 text-sm text-muted-foreground">
            Ensure your account is secure by using a strong password
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-4 pr-10 text-sm outline-none transition focus:border-brand-accent"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-4 pr-10 text-sm outline-none transition focus:border-brand-accent"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          i <= strength
                            ? strength <= 2 ? '#EF4444' : strength <= 4 ? '#F97316' : '#23a74c'
                            : 'hsl(var(--border))',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-4 pr-10 text-sm outline-none transition focus:border-brand-accent"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`mt-2 text-xs font-semibold ${newPassword === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <Save size={16} /> {busy ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-foreground" style={{ color: 'var(--brand-accent)' }}>
            <Shield size={20} /> Privacy Settings
          </h2>
          <p className="mb-8 border-b border-border pb-4 text-sm text-muted-foreground">
            Control your privacy and data sharing preferences
          </p>

          <form onSubmit={handlePrivacySubmit} className="space-y-3">
            <ToggleItem
              title="Public Profile"
              desc={`Allow ${role === 'teacher' ? 'students' : 'others'} to see your profile`}
              checked={publicProfile}
              onChange={setPublicProfile}
            />
            <ToggleItem
              title="Show Contact Info"
              desc="Display your email publicly"
              checked={showContact}
              onChange={setShowContact}
            />
            <ToggleItem
              title="Leaderboard"
              desc="Include me in public leaderboards"
              checked={leaderboard}
              onChange={setLeaderboard}
            />
            <ToggleItem
              title="Data Collection"
              desc="Allow anonymous usage data collection"
              checked={dataCollection}
              onChange={setDataCollection}
            />

            <div className="pt-6">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                <Save size={16} /> Save Privacy Settings
              </button>
            </div>
          </form>
        </div>
      )}

      <ToastViewport toasts={toasts} onClose={closeToast} />
    </div>
  )
}

function ToggleItem({ title, desc, checked, onChange }: { title: string, desc: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition hover:bg-muted">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className="peer h-6 w-11 rounded-full bg-border after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-accent peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
      </label>
    </div>
  )
}