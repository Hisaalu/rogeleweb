'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Loader2, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/components/ui/toast-provider'
import { listUsersClient, updateUserClient } from '@/lib/users.client'
import type {
  AdminUser, Class, UpdateUserPayload, UserListMeta, UserRole,
} from '@/types/admin'
import { UserFilters, type UserFilterState } from './user-filters'
import { UserTable } from './user-table'
import { UserRoleModal } from './user-role-modal'
import { UserStatusModal } from './user-status-modal'
import { UserCreateModal } from './user-create-modal'
import { BulkActionsBar } from './bulk-actions-bar'
import { ExportButton } from './export-button'

const INITIAL_FILTERS: UserFilterState = { q: '', role: '', class_id: null, status: 'all' }

function deriveStatusFilter(status: UserFilterState['status']) {
  switch (status) {
    case 'active': return { is_active: true, is_suspended: false }
    case 'suspended': return { is_suspended: true }
    case 'inactive': return { is_active: false }
    default: return {}
  }
}

export function UsersView({
  initialUsers, initialMeta, classes,
}: {
  initialUsers: AdminUser[]
  initialMeta: UserListMeta
  classes: Class[]
}) {
  const { showToast } = useToast()

  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [meta, setMeta] = useState<UserListMeta>(initialMeta)
  const [filters, setFilters] = useState<UserFilterState>(INITIAL_FILTERS)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null)
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.q), 300)
    return () => clearTimeout(timer)
  }, [filters.q])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const statusFilter = deriveStatusFilter(filters.status)
      const result = await listUsersClient({
        page, per_page: 20,
        q: debouncedSearch || undefined,
        role: filters.role || undefined,
        class_id: filters.class_id ?? undefined,
        ...statusFilter,
      })
      setUsers(result.users)
      setMeta(result.meta)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters.role, filters.class_id, filters.status, showToast])

  useEffect(() => { void fetchUsers() }, [fetchUsers])
  useEffect(() => { setSelectedIds(new Set()) }, [users])

  const handleFiltersChange = useCallback((next: UserFilterState) => {
    setFilters(next)
    setPage(1)
  }, [])

  const handleUserCreated = useCallback((user: AdminUser) => {
    setUsers((list) => [user, ...list])
    setMeta((m) => ({ ...m, total: m.total + 1 }))
    showToast('User created successfully.', 'success')
  }, [showToast])

  const handleSelectOne = useCallback((id: number, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedIds(selected ? new Set(users.map((u) => u.id)) : new Set())
  }, [users])

  const handleClear = useCallback(() => setSelectedIds(new Set()), [])

  const handleRoleChange = useCallback(async (user: AdminUser, role: UserRole) => {
    const updated = await updateUserClient(user.id, { role })
    setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
    showToast('User role updated successfully.', 'success')
  }, [showToast])

  const handleStatusChange = useCallback(async (user: AdminUser, action: 'suspend' | 'reactivate' | 'deactivate' | 'activate') => {
    let payload: UpdateUserPayload = {}
    if (action === 'suspend') payload = { is_suspended: true }
    if (action === 'reactivate') payload = { is_suspended: false }
    if (action === 'deactivate') payload = { is_active: false }
    if (action === 'activate') payload = { is_active: true }
    const updated = await updateUserClient(user.id, payload)
    setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
    showToast('User status updated successfully.', 'success')
  }, [showToast])

  const selectedUsers = useMemo(() => users.filter((u) => selectedIds.has(u.id)), [users, selectedIds])

  const bulkUpdate = useCallback(async (payload: UpdateUserPayload) => {
    setBulkBusy(true)
    try {
      const ids = Array.from(selectedIds)
      const results = await Promise.allSettled(ids.map((id) => updateUserClient(id, payload)))
      const failures = results.filter((r) => r.status === 'rejected').length
      const updates = new Map<number, AdminUser>()
      for (const r of results) {
        if (r.status === 'fulfilled') updates.set(r.value.id, r.value)
      }
      setUsers((list) => list.map((u) => updates.get(u.id) ?? u))
      if (failures > 0) showToast(`${failures} of ${ids.length} updates failed.`, 'error')
      else showToast(`Successfully updated ${ids.length} users.`, 'success')
      handleClear()
    } finally {
      setBulkBusy(false)
    }
  }, [selectedIds, handleClear, showToast])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage every account on the platform.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportButton users={users} classes={classes} />
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Add user
          </Button>
        </div>
      </div>

      <UserFilters filters={filters} classes={classes} onChange={handleFiltersChange} />

      <BulkActionsBar
        selectedUsers={selectedUsers}
        classes={classes}
        onClear={handleClear}
        onSuspend={() => bulkUpdate({ is_suspended: true })}
        onReactivate={() => bulkUpdate({ is_suspended: false })}
        onSetRole={(role) => bulkUpdate({ role })}
        busy={bulkBusy}
      />

      {loading ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> Loading users...
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users match your filters" description="Try changing the filters or search term." />
      ) : (
        <>
          <UserTable
            users={users}
            classes={classes}
            selectedIds={selectedIds}
            onSelectOne={handleSelectOne}
            onSelectAll={handleSelectAll}
            onChangeRole={setRoleTarget}
            onChangeStatus={setStatusTarget}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Showing {users.length} of {meta.total} users</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="rounded-lg border border-border bg-card px-3 py-1.5 font-medium transition hover:border-brand-accent disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
              <span className="px-2">Page {meta.page} of {meta.last_page}</span>
              <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.last_page || loading} className="rounded-lg border border-border bg-card px-3 py-1.5 font-medium transition hover:border-brand-accent disabled:cursor-not-allowed disabled:opacity-50">Next</button>
            </div>
          </div>
        </>
      )}

      <UserRoleModal user={roleTarget} onClose={() => setRoleTarget(null)} onSubmit={handleRoleChange} />
      <UserStatusModal user={statusTarget} onClose={() => setStatusTarget(null)} onSubmit={handleStatusChange} />
      <UserCreateModal open={createOpen} onOpenChange={setCreateOpen} classes={classes} onCreated={handleUserCreated} />
    </div>
  )
}