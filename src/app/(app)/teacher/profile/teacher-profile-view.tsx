'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserCircle, Camera, Calendar, Clock, Edit, Save, User, Mail, Phone, 
  GraduationCap, Loader2, Star, BookOpen, Users, AlignLeft, type LucideIcon
} from 'lucide-react'
import type { User as ProfileUser } from '@/types/api'
import { updateProfileClient, uploadAvatarClient } from '@/lib/profile.client'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast-provider'

export function TeacherProfileView({
  profile,
  totalLessons,
  totalStudents,
}: {
  profile: ProfileUser | null
  totalLessons: number
  totalStudents: number
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)

  const [firstName, setFirstName] = useState(profile?.first_name ?? '')
  const [lastName, setLastName] = useState(profile?.last_name ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [qualification, setQualification] = useState(profile?.qualification ?? '')
  const [specialization, setSpecialization] = useState(profile?.specialization ?? '')

  const initials = [firstName, lastName].filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'T'

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 2 * 1024 * 1024) {
      return showToast('Image exceeds 2MB limit', 'error')
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
      return showToast('First name, last name, and email are required', 'error')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return showToast('Please enter a valid email address', 'error')
    }

    setBusy(true)
    try {
      await updateProfileClient({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || undefined,
        bio: bio || undefined,
        qualification: qualification || undefined,
        specialization: specialization || undefined,
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

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
      
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl lg:text-3xl" style={{ color: 'var(--brand-primary)' }}>
          <UserCircle size={26} className="shrink-0 sm:h-7 sm:w-7" />
          <span>Profile</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal information and account settings</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[350px_1fr] lg:gap-8">
        
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-8">
          <div className="text-center">
            <div className="relative mx-auto mb-5 h-32 w-32 sm:h-[150px] sm:w-[150px]">
              {profile?.profile_photo ? (
                <img 
                  src={profile.profile_photo} 
                  alt="Profile" 
                  className="h-full w-full rounded-full border-4 border-card object-cover shadow-xl"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-card bg-brand-primary text-4xl font-bold text-white shadow-xl sm:text-5xl">
                  {initials}
                </div>
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={photoBusy}
                className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-lg transition hover:scale-110 hover:bg-brand-primary hover:text-white disabled:opacity-50"
              >
                {photoBusy ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/jpeg,image/png,image/gif" 
                className="hidden" 
              />
            </div>

            <h2 className="text-lg font-bold text-foreground sm:text-xl">{firstName} {lastName}</h2>
            <p className="capitalize text-sm text-muted-foreground">{profile?.role ?? 'Teacher'}</p>
          </div>

          <div className="space-y-2 border-t border-border pt-6">
            <div className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-muted/50 sm:p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="truncate text-sm font-semibold text-foreground">{profile?.created_at ? formatDate(profile.created_at) : 'Today'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-muted/50 sm:p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>
                <Clock size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="truncate text-sm font-semibold text-foreground">{profile?.last_login ? formatDate(profile.last_login) : 'Today'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-muted/50 sm:p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>
                <BookOpen size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Lessons Taught</p>
                <p className="text-sm font-semibold text-foreground">{totalLessons}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-muted/50 sm:p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>
                <Users size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-sm font-semibold text-foreground">{totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10">
          <h3 className="mb-6 flex items-center gap-2 border-b border-border pb-4 text-base font-bold text-foreground sm:mb-8 sm:text-lg">
            <Edit size={18} style={{ color: 'var(--brand-accent)' }} />
            Edit Personal Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <Field label="First Name" icon={User} required>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  required 
                  autoComplete="given-name"
                  placeholder="Enter your first name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-brand-accent sm:py-3" 
                />
              </Field>
              <Field label="Last Name" icon={User} required>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  required 
                  autoComplete="family-name"
                  placeholder="Enter your last name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-brand-accent sm:py-3" 
                />
              </Field>
            </div>

            <Field label="Email Address" icon={Mail} required>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                autoComplete="email"
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-brand-accent sm:py-3" 
              />
            </Field>

            <Field label="Phone Number" icon={Phone}>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                autoComplete="tel"
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-brand-accent sm:py-3" 
              />
            </Field>

            <Field label="Bio / About" icon={AlignLeft}>
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                rows={4} 
                placeholder="Tell your students a little about yourself..."
                className="w-full resize-y rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-brand-accent sm:py-3" 
              />
            </Field>

            <Field label="Qualifications" icon={GraduationCap}>
              <input 
                type="text" 
                value={qualification} 
                onChange={e => setQualification(e.target.value)} 
                placeholder="e.g., Bachelor of Education"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-brand-accent sm:py-3" 
              />
            </Field>

            <Field label="Specialization" icon={Star}>
              <input 
                type="text" 
                value={specialization} 
                onChange={e => setSpecialization(e.target.value)} 
                placeholder="e.g., Mathematics, Science"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-brand-accent sm:py-3" 
              />
            </Field>

            <div className="flex justify-end border-t border-border pt-5 sm:pt-6">
              <button 
                type="submit" 
                disabled={busy} 
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 sm:w-auto sm:px-8 sm:py-3" 
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                <Save size={16} /> {busy ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  )
}

function Field({ label, icon: Icon, required, children }: { label: string, icon: LucideIcon, required?: boolean, children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon size={14} style={{ color: 'var(--brand-accent)' }} className="shrink-0" />
        {label} {required && <span style={{ color: 'var(--danger-fg)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}