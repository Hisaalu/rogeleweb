'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createUserClient, updateUserClient } from '@/lib/users.client'
import type { AdminUser, Class, UserRole } from '@/types/admin'

export interface CreateUserValues {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
  role: UserRole
  class_id: number | null
  bio: string
  qualification: string
  specialization: string
}

const EMPTY: CreateUserValues = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'learner',
  class_id: null,
  bio: '',
  qualification: '',
  specialization: '',
}

export function UserCreateModal({
  open,
  onOpenChange,
  classes,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  classes: Class[]
  onCreated: (user: AdminUser) => void
}) {
  const [values, setValues] = useState<CreateUserValues>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setValues(EMPTY)
      setError(null)
    }
  }, [open])

  function set<K extends keyof CreateUserValues>(
    key: K,
    value: CreateUserValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!values.email.trim()) {
      setError('Email is required')
      return
    }
    if (!values.password || values.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setSubmitting(true)
    try {
      const created = await createUserClient({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        first_name: values.first_name.trim() || undefined,
        last_name: values.last_name.trim() || undefined,
        phone: values.phone.trim() || undefined,
        role: values.role,
        class_id: values.class_id ?? undefined,
      })

      // Step 2: patch in the extra fields the register endpoint doesn't accept
      const needsPatch =
        values.bio.trim() ||
        values.qualification.trim() ||
        values.specialization.trim()

      let finalUser = created
      if (needsPatch) {
        try {
          finalUser = await updateUserClient(created.id, {
            bio: values.bio.trim() || undefined,
            qualification: values.qualification.trim() || undefined,
            specialization: values.specialization.trim() || undefined,
          })
        } catch {
          // Non-fatal — base user exists
        }
      }

      onCreated(finalUser)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  const showClass = values.role === 'learner' || values.role === 'external'
  const showTeacherFields = values.role === 'teacher'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
          <DialogDescription>
            Create an account on behalf of a new user. They can change their password
            after their first login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="user@example.com"
                autoFocus
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Temporary password</Label>
              <Input
                id="password"
                type="password"
                value={values.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="At least 8 characters"
                disabled={submitting}
              />
            </div>

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

            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                value={values.role}
                onChange={(e) => set('role', e.target.value as UserRole)}
                disabled={submitting}
              >
                <option value="learner">Learner</option>
                <option value="teacher">Teacher</option>
                <option value="external">External</option>
                <option value="admin">Admin</option>
              </Select>
            </div>

            {showClass && (
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

            {showTeacherFields && (
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

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Create user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}