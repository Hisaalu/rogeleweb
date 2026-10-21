'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserCircle, Camera, Calendar, Clock, Edit, Save, User, Mail, Phone, 
  GraduationCap, Loader2, Star, BookOpen, Users, AlignLeft
} from 'lucide-react'
import type { User as ProfileUser } from '@/types/api'
import type { Class } from '@/types/admin'
import { updateProfileClient, uploadAvatarClient } from '@/lib/profile.client'
import { formatDate } from '@/lib/utils'
import { ToastViewport, type ToastMessage, type ToastTone } from '@/components/ui/toast'

export function TeacherProfileView({
  profile,
  classes,
  totalLessons,
  totalStudents,
}: {
  profile: ProfileUser | null
  classes: Class[]
  totalLessons: number
  totalStudents: number
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const pushToast = (message: string, tone: ToastTone) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, tone }])
  }
  const closeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

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
      return pushToast('Image exceeds 2MB limit', 'error')
    }

    setPhotoBusy(true)
    try {
      await uploadAvatarClient(file)
      pushToast('Profile photo updated!', 'success')
      router.refresh()
    } catch (err: any) {
      pushToast(err.message || 'Failed to upload photo', 'error')
    } finally {
      setPhotoBusy(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      return pushToast('First name, last name, and email are required', 'error')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return pushToast('Please enter a valid email address', 'error')
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
      pushToast('Profile updated successfully!', 'success')
      router.refresh()
    } catch (err: any) {
      pushToast(err.message || 'Failed to update profile', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--brand-primary)' }}>
          <UserCircle size={28} />
          <span>My Profile</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal information and account settings</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
        
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-8">
          <div className="text-center">
            <div className="relative mx-auto mb-5 h-[150px] w-[150px]">
              {profile?.profile_photo ? (
                <img 
                  src={profile.profile_photo} 
                  alt="Profile" 
                  className="h-full w-full rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-brand-primary text-5xl font-bold text-white shadow-xl">
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

            <h2 className="text-xl font-bold text-foreground">{firstName} {lastName}</h2>
            <p className="capitalize text-muted-foreground">{profile?.role ?? 'Teacher'}</p>
          </div>

          <div className="space-y-2 border-t border-border pt-6">
            <div className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-muted/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-semibold text-foreground">{profile?.created_at ? formatDate(profile.created_at) : 'Today'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-muted/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="text-sm font-semibold text-foreground">{profile?.last_login ? formatDate(profile.last_login) : 'Today'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-muted/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lessons Taught</p>
                <p className="text-sm font-semibold text-foreground">{totalLessons}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-muted/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                <Users size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-sm font-semibold text-foreground">{totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
          <h3 className="mb-8 flex items-center gap-2 border-b border-border pb-4 text-lg font-bold text-foreground">
            <Edit size={18} style={{ color: 'var(--brand-accent)' }} />
            Edit Personal Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="First Name" icon={User} required>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  required 
                  placeholder="Enter your first name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent" 
                />
              </Field>
              <Field label="Last Name" icon={User} required>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  required 
                  placeholder="Enter your last name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent" 
                />
              </Field>
            </div>

            <Field label="Email Address" icon={Mail} required>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent" 
              />
            </Field>

            <Field label="Phone Number" icon={Phone}>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent" 
              />
            </Field>

            <Field label="Bio / About" icon={AlignLeft}>
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                rows={4} 
                placeholder="Tell your students a little about yourself..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent resize-y min-h-[100px]" 
              />
            </Field>

            <Field label="Qualifications" icon={GraduationCap}>
              <input 
                type="text" 
                value={qualification} 
                onChange={e => setQualification(e.target.value)} 
                placeholder="e.g., Bachelor of Education"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent" 
              />
            </Field>

            <Field label="Specialization" icon={Star}>
              <input 
                type="text" 
                value={specialization} 
                onChange={e => setSpecialization(e.target.value)} 
                placeholder="e.g., Mathematics, Science"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent" 
              />
            </Field>

            <div className="flex justify-end border-t border-border pt-6">
              <button 
                type="submit" 
                disabled={busy} 
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50" 
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                <Save size={16} /> {busy ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>

      <ToastViewport toasts={toasts} onClose={closeToast} />
    </div>
  )
}

function Field({ label, icon: Icon, required, children }: { label: string, icon: any, required?: boolean, children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon size={14} style={{ color: 'var(--brand-accent)' }} />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}