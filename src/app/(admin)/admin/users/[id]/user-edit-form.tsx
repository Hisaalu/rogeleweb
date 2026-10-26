'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    setSubmitting(true)
    try {
      const updated = await updateUserClient(user.id, {
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
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">Profile</h3>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" value={values.first_name} onChange={(e) => set('first_name', e.target.value)} disabled={submitting} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" value={values.last_name} onChange={(e) => set('last_name', e.target.value)} disabled={submitting} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={values.phone} onChange={(e) => set('phone', e.target.value)} disabled={submitting} />
          </div>
          {isLearner && (
            <div className="space-y-1.5">
              <Label htmlFor="class_id">Class</Label>
              <Select id="class_id" value={values.class_id ?? ''} onChange={(e) => set('class_id', e.target.value ? Number(e.target.value) : null)} disabled={submitting}>
                <option value="">Unassigned</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
          )}
          {isTeacher && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" value={values.qualification} onChange={(e) => set('qualification', e.target.value)} disabled={submitting} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" value={values.specialization} onChange={(e) => set('specialization', e.target.value)} disabled={submitting} />
              </div>
            </>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={values.bio} onChange={(e) => set('bio', e.target.value)} rows={3} disabled={submitting} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 size={14} className="animate-spin" />} Save changes
          </Button>
        </div>
      </form>
    </section>
  )
}