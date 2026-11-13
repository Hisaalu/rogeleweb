'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'nextjs-toploader/app'
import {
  Camera, Calendar, Clock, Edit, Save, User, Mail, Phone,
  Shield, Loader2, IdCard, AlignLeft, type LucideIcon,
} from 'lucide-react'
import { getInitials, formatDate } from '@/lib/utils'
import { updateProfileClient, uploadAvatarClient } from '@/lib/profile.client'
import { useToast } from '@/components/ui/toast-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { User as ProfileUser } from '@/types/api'

function displayName(u: ProfileUser): string {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return name || u.email
}

const InfoRow = React.memo(function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-muted/50 sm:p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
})

const Field = React.memo(function Field({
  label,
  icon: Icon,
  required,
  children,
}: {
  label: string
  icon: LucideIcon
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon size={14} className="shrink-0 text-brand-accent" />
        {label} {required && <span className="text-danger-fg">*</span>}
      </label>
      {children}
    </div>
  )
})

export function AdminProfileView({ profile: initialProfile }: { profile: ProfileUser }) {
  const router = useRouter()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile] = useState<ProfileUser>(initialProfile)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [busy, setBusy] = useState(false)

  const [firstName, setFirstName] = useState(profile.first_name ?? '')
  const [lastName, setLastName] = useState(profile.last_name ?? '')
  const [email, setEmail] = useState(profile.email ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')

  const name = displayName(profile)
  const initials = getInitials(name) || 'A'

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file', 'error')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image exceeds 2 MB limit', 'error')
      return
    }

    setPhotoBusy(true)
    try {
      await uploadAvatarClient(file)
      showToast('Profile photo updated!', 'success')
      router.refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to upload photo', 'error')
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
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      })
      showToast('Profile updated successfully!', 'success')
      router.refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Profile</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[350px_1fr]">
        <Card>
          <CardContent className="space-y-6 p-5 sm:p-8">
            <div className="text-center">
              <div className="relative mx-auto mb-5 h-32 w-32 sm:h-[150px] sm:w-[150px]">
                {profile.profile_photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profile_photo}
                    alt={name}
                    className="h-full w-full rounded-full border-4 border-card object-cover shadow-xl"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-card bg-brand-primary text-4xl font-bold text-white shadow-xl sm:text-5xl">
                    {initials}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoBusy}
                  className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-lg transition hover:scale-110 hover:bg-brand-primary hover:text-white disabled:opacity-50"
                  aria-label="Change profile photo"
                >
                  {photoBusy ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
              </div>

              <h2 className="text-lg font-bold text-foreground sm:text-xl">{name}</h2>
              <p className="capitalize text-sm text-muted-foreground">{profile.role}</p>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {profile.is_active && !profile.is_suspended ? (
                  <Badge tone="success">Active</Badge>
                ) : profile.is_suspended ? (
                  <Badge tone="danger">Suspended</Badge>
                ) : (
                  <Badge tone="warning">Deactivated</Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-6">
              <InfoRow
                icon={Calendar}
                label="Member Since"
                value={profile.created_at ? formatDate(profile.created_at) : '—'}
              />
              <InfoRow
                icon={Clock}
                label="Last Login"
                value={profile.last_login ? formatDate(profile.last_login) : 'Never'}
              />
              <InfoRow icon={IdCard} label="User ID" value={`#${profile.id}`} />
              <InfoRow icon={Shield} label="Role" value={profile.role} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Edit size={18} className="text-brand-accent" />
              Edit Personal Information
            </CardTitle>
            <Link
              href={`/admin/users/${profile.id}`}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent sm:w-auto"
            >
              <Edit size={12} /> Full editor
            </Link>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <Field label="First Name" icon={User} required>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                    placeholder="Enter your first name"
                  />
                </Field>
                <Field label="Last Name" icon={User} required>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                    placeholder="Enter your last name"
                  />
                </Field>
              </div>

              <Field label="Email Address" icon={Mail} required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Enter your email address"
                />
              </Field>

              <Field label="Phone Number" icon={Phone}>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                />
              </Field>

              <Field label="Bio / About" icon={AlignLeft}>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell others a little about yourself..."
                />
              </Field>

              <div className="flex justify-end border-t border-border pt-5 sm:pt-6">
                <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                  <Save size={16} className="mr-2" /> {busy ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}