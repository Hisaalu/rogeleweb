'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import Link from 'next/link'
import { 
  UserCircle, Camera, Calendar, Clock, Gift, Edit, Save, User, Mail, Phone, 
  GraduationCap, Loader2, Lock
} from 'lucide-react'
import type { User as ProfileUser } from '@/types/api'
import type { Class } from '@/types/admin'
import type { SubscriptionSummary, TrialStatus } from '@/types/dashboard'
import { updateProfileClient, uploadAvatarClient } from '@/lib/profile.client'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast-provider'
import { Avatar } from '@/components/ui/avatar'
import { PremiumGate } from '@/components/premium-gate'
import type { AccessReason } from '@/lib/access'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export function LearnerProfileView({
  profile,
  classes,
  trial,
  subscription,
  hasAccess,
}: {
  profile: ProfileUser | null
  classes: Class[]
  trial: TrialStatus | null
  subscription: SubscriptionSummary | null
  hasAccess: boolean
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)

  const [firstName, setFirstName] = useState(profile?.first_name ?? '')
  const [lastName, setLastName] = useState(profile?.last_name ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [classId, setClassId] = useState(profile?.class_id ? String(profile.class_id) : '')

  useEffect(() => {
    setFirstName(profile?.first_name ?? '')
    setLastName(profile?.last_name ?? '')
    setEmail(profile?.email ?? '')
    setPhone(profile?.phone ?? '')
    setClassId(profile?.class_id ? String(profile.class_id) : '')
  }, [
    profile?.first_name, 
    profile?.last_name, 
    profile?.email, 
    profile?.phone, 
    profile?.class_id
  ])

  const initials = useMemo(() => {
    return [firstName, lastName].filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }, [firstName, lastName])

  const hasActiveSubscription = subscription?.status === 'active'
  const isInTrial = !hasActiveSubscription && trial?.is_in_trial

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!hasAccess) {
      return showToast('Subscribe to a plan to change your profile photo.', 'error')
    }

    if (file.size > 5 * 1024 * 1024) {
      return showToast('Image exceeds 5MB limit', 'error')
    }

    setPhotoBusy(true)
    try {
      await uploadAvatarClient(file)
      showToast('Profile photo updated!', 'success')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload photo'
      showToast(message, 'error')
    } finally {
      setPhotoBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      return showToast('Name and Email are required', 'error')
    }

    setBusy(true)
    try {
      await updateProfileClient({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || undefined,
        class_id: classId ? Number(classId) : undefined,
      })
      showToast('Profile updated successfully!', 'success')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      showToast(message, 'error')
    } finally {
      setBusy(false)
    }
  }

  function handlePhotoClick() {
    if (!hasAccess) {
      showToast('Upgrade to Premium to change your profile photo.', 'info')
      setGateOpen(true)
      return
    }
    fileInputRef.current?.click()
  }

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
        
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl lg:text-3xl" style={{ color: 'var(--brand-primary)' }}>
            <UserCircle size={26} className="shrink-0 sm:h-7 sm:w-7" />
            <span>Profile</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your Personal Information</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[350px_1fr] lg:gap-8">
          
          <Card className="space-y-6 p-5 sm:p-8">
            <div className="text-center">
              <div className="relative mx-auto mb-5 h-32 w-32 sm:h-[150px] sm:w-[150px]">
                
                <Avatar
                  src={profile?.profile_photo}
                  fallback={initials}
                  size={150}
                  className="h-full w-full border-4 border-white shadow-xl"
                />
                
                <button 
                  onClick={handlePhotoClick}
                  disabled={photoBusy}
                  className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-lg transition hover:scale-110 hover:bg-brand-primary hover:text-white disabled:opacity-50"
                  title={hasAccess ? "Change photo" : "Upgrade to change photo"}
                >
                  {photoBusy ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : hasAccess ? (
                    <Camera size={18} />
                  ) : (
                    <Lock size={18} style={{ color: 'var(--warning-border)' }} />
                  )}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                  disabled={!hasAccess}
                />
              </div>

              <h2 className="text-lg font-bold text-foreground sm:text-xl">{firstName} {lastName}</h2>
              <p className="capitalize text-sm text-muted-foreground">{profile?.role ?? 'Learner'}</p>
              
              {hasAccess ? (
                <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-xs text-muted-foreground">
                  <Camera size={13} style={{ color: 'var(--brand-accent)' }} />
                  Click icon to change photo
                </div>
              ) : (
                <button
                  onClick={handlePhotoClick}
                  className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition hover:opacity-80"
                  style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-fg)' }}
                >
                  <Lock size={12} />
                  Upgrade to change photo
                </button>
              )}
            </div>

            <div className="space-y-2 border-t border-border pt-6">
              <div className="flex items-center gap-3 rounded-md p-2.5 transition hover:bg-muted/50 sm:p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary sm:h-10 sm:w-10">
                  <Calendar size={16} className="sm:h-[18px] sm:w-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="truncate text-sm font-semibold text-foreground">{profile?.created_at ? formatDate(profile.created_at) : 'Today'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-md p-2.5 transition hover:bg-muted/50 sm:p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary sm:h-10 sm:w-10">
                  <Clock size={16} className="sm:h-[18px] sm:w-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <p className="truncate text-sm font-semibold text-foreground">{profile?.last_login ? formatDate(profile.last_login) : 'Today'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-md p-2.5 transition hover:bg-muted/50 sm:p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary sm:h-10 sm:w-10">
                  <Gift size={16} className="sm:h-[18px] sm:w-[18px]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plan Status</p>
                  {hasActiveSubscription ? (
                    <>
                      <p className="text-sm font-bold" style={{ color: 'var(--success-fg)' }}>Active Subscription</p>
                    </>
                  ) : isInTrial ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">{trial?.days_remaining} days left</p>
                      <span className="text-[10px] text-muted-foreground">Ends {trial?.end_date ? formatDate(trial.end_date) : 'NA'}</span>
                    </>
                  ) : (
                    <p className="text-sm font-bold" style={{ color: 'var(--danger-fg)' }}>Trial Ended</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-8 lg:p-10">
            <h3 className="mb-6 flex items-center gap-2 border-b border-border pb-4 text-base font-bold text-foreground sm:mb-8 sm:text-lg">
              <Edit size={18} style={{ color: 'var(--brand-accent)' }} className="shrink-0" />
              Edit Personal Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <Field label="First Name" icon={User}>
                  <Input 
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    required 
                    autoComplete="given-name"
                    placeholder="Enter your first name"
                  />
                </Field>
                <Field label="Last Name" icon={User}>
                  <Input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    required 
                    autoComplete="family-name"
                    placeholder="Enter your last name"
                  />
                </Field>
              </div>

              <Field label="Email Address" icon={Mail}>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  autoComplete="email"
                  placeholder="Enter your email address"
                />
              </Field>

              <Field label="Phone Number" icon={Phone}>
                <Input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                />
              </Field>

              <Field label="Class / Club" icon={GraduationCap}>
                {hasAccess ? (
                  <Select 
                    value={classId} 
                    onChange={e => setClassId(e.target.value)}
                  >
                    <option value="">Select your class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                ) : (
                  <div 
                    className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="shrink-0" style={{ color: 'var(--warning-border)' }} />
                      <span>Upgrade to change your class</span>
                    </div>
                    <Link 
                      href="/learner/subscription" 
                      className="font-bold hover:underline"
                      style={{ color: 'var(--brand-accent)' }}
                    >
                      View Plans
                    </Link>
                  </div>
                )}
              </Field>

              <div className="flex justify-end border-t border-border pt-5 sm:pt-6">
                <Button 
                  type="submit" 
                  disabled={busy} 
                  className="w-full sm:w-auto"
                >
                  <Save size={16} className="mr-2" /> {busy ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>

        </div>
      </div>

      {!hasAccess && (
        <PremiumGate
          open={gateOpen}
          context="profile"
          reason={(subscription?.status !== 'active' && trial && trial.end_date && trial.days_remaining <= 0) ? 'trial_expired' : 'no_plan'}
          onDismiss={() => setGateOpen(false)}
        />
      )}
    </>
  )
}

function Field({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon size={14} style={{ color: 'var(--brand-accent)' }} className="shrink-0" />
        {label}
      </label>
      {children}
    </div>
  )
}