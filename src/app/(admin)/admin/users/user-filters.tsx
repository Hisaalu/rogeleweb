'use client'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Class } from '@/types/admin'

export type UserFilterStatus = 'all' | 'active' | 'suspended' | 'inactive'

export interface UserFilterState {
  q: string
  role: string
  class_id: number | null
  status: UserFilterStatus
}

export function UserFilters({
  filters,
  classes,
  onChange,
}: {
  filters: UserFilterState
  classes: Class[]
  onChange: (filters: UserFilterState) => void
}) {
  function set<K extends keyof UserFilterState>(
    key: K,
    value: UserFilterState[K],
  ) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        placeholder="Search name or email..."
        value={filters.q}
        onChange={(e) => set('q', e.target.value)}
      />

      <Select
        value={filters.role}
        onChange={(e) => set('role', e.target.value)}
      >
        <option value="">All roles</option>
        <option value="admin">Admin</option>
        <option value="teacher">Teacher</option>
        <option value="learner">Learner</option>
        <option value="external">External</option>
      </Select>

      <Select
        value={filters.class_id ?? ''}
        onChange={(e) =>
          set('class_id', e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">All classes</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select
        value={filters.status}
        onChange={(e) => set('status', e.target.value as UserFilterStatus)}
      >
        <option value="all">Any status</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
        <option value="inactive">Deactivated</option>
      </Select>
    </div>
  )
}