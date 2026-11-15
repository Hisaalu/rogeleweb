'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast-provider'
import { updateUserClient } from '@/lib/users.client'
import type { AdminUser, Class } from '@/types/admin'

export function UserEditForm({
  user, classes, onChange,
}: {
  user: AdminUser
  classes: Class[]
  onChange: (user: AdminUser) => void
}) {
  const { showToast } = useToast()
  const [values, setValues] = useState({
    email: user.email ?? '',
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    phone: user.phone ?? '',
    bio: user.bio ?? '',
    qualification: user.qualification ?? '',
    specialization: user.specialization ?? '',
    class_id: user.class_id ?? null,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setValues({
      email: user.email ?? '',
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      phone: user.phone ?? '',
      bio: user.bio ?? '',
      qualification: user.qualification ?? '',
      specialization: user.specialization ?? '',
      class_id: user.class_id ?? null,
    })
  }, [user])

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const email = values.email.trim().toLowerCase()
    if (!email) {
      showToast('Email is required', 'error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    setSubmitting(true)
    try {
      const updated = await updateUserClient(user.id, {
        email,
        first_name: values.first_name.trim() || undefined,
        last_name: values.last_name.trim() || undefined,
        phone: values.phone.trim() || undefined,
        bio: values.bio.trim() || undefined,
        qualification: values.qualification.trim() || undefined,
        specialization: values.specialization.trim() || undefined,
        class_id: values.class_id ?? undefined,
      })
      onChange(updated)
      showToast('Profile updated successfully.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const isTeacher = user.role === 'teacher'
  const isLearner = user.role === 'learner' || user.role === 'external'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => set('email', e.target.value)}
              disabled={submitting}
            />
            {user.email_verified ? (
              <p className="text-[11px] text-muted-foreground">
                This email is verified.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Changing this email may affect the user&apos;s login and notifications.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                value={values.first_name}
                onChange={(e) => set('first_name', e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                value={values.last_name}
                onChange={(e) => set('last_name', e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={values.phone}
                onChange={(e) => set('phone', e.target.value)}
                disabled={submitting}
              />
            </div>
            {isLearner && (
              <div className="space-y-1.5">
                <Label htmlFor="class_id">Class</Label>
                <Select
                  id="class_id"
                  value={values.class_id ?? ''}
                  onChange={(e) =>
                    set('class_id', e.target.value ? Number(e.target.value) : null)
                  }
                  disabled={submitting}
                >
                  <option value="">Unassigned</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {isTeacher && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={values.qualification}
                    onChange={(e) => set('qualification', e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={values.specialization}
                    onChange={(e) => set('specialization', e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={values.bio}
              onChange={(e) => set('bio', e.target.value)}
              rows={3}
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 size={14} className="animate-spin" />} Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}