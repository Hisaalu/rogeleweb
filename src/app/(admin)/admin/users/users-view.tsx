'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useBranding } from '@/components/brand/brand-provider'
import { listUsersClient, updateUserClient } from '@/lib/users.client'
import type {
  AdminUser,
  Class,
  UpdateUserPayload,
  UserListMeta,
  UserRole,
} from '@/types/admin'
import { UserFilters, type UserFilterState } from './user-filters'
import { UserTable } from './user-table'
import { UserRoleModal } from './user-role-modal'
import { UserStatusModal } from './user-status-modal'
import { UserCreateModal } from './user-create-modal'
import { BulkActionsBar } from './bulk-actions-bar'
import { ExportButton } from './export-button'

const INITIAL_FILTERS: UserFilterState = {
  q: '',
  role: '',
  class_id: null,
  status: 'all',
}

export function UsersView({
  initialUsers,
  initialMeta,
  classes,
}: {
  initialUsers: AdminUser[]
  initialMeta: UserListMeta
  classes: Class[]
}) {
  const branding = useBranding()

  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [meta, setMeta] = useState<UserListMeta>(initialMeta)
  const [filters, setFilters] = useState<UserFilterState>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null)
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchUsers()
    }, 250)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [users])

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const statusFilter = deriveStatusFilter(filters.status)
      const result = await listUsersClient({
        page,
        per_page: 20,
        q: filters.q || undefined,
        role: filters.role || undefined,
        class_id: filters.class_id ?? undefined,
        is_active: statusFilter.is_active,
        is_suspended: statusFilter.is_suspended,
      })
      setUsers(result.users)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  function handleFiltersChange(next: UserFilterState) {
    setFilters(next)
    setPage(1)
  }

  function handleUserCreated(user: AdminUser) {
    setUsers((list) => [user, ...list])
    setMeta((m) => ({ ...m, total: m.total + 1 }))
  }

  function handleSelectOne(id: number, selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleSelectAll(selected: boolean) {
    if (selected) {
      setSelectedIds(new Set(users.map((u) => u.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  function handleClear() {
    setSelectedIds(new Set())
  }

  async function handleRoleChange(user: AdminUser, role: UserRole) {
    const updated = await updateUserClient(user.id, { role })
    setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
  }

  async function handleStatusChange(
    user: AdminUser,
    action: 'suspend' | 'reactivate' | 'deactivate' | 'activate',
  ) {
    let payload: UpdateUserPayload = {}
    if (action === 'suspend') payload = { is_suspended: true }
    if (action === 'reactivate') payload = { is_suspended: false }
    if (action === 'deactivate') payload = { is_active: false }
    if (action === 'activate') payload = { is_active: true }

    const updated = await updateUserClient(user.id, payload)
    setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
  }

  const selectedUsers = useMemo(
    () => users.filter((u) => selectedIds.has(u.id)),
    [users, selectedIds],
  )

  async function bulkUpdate(payload: UpdateUserPayload) {
    setBulkBusy(true)
    setError(null)
    try {
      const ids = Array.from(selectedIds)
      const results = await Promise.allSettled(
        ids.map((id) => updateUserClient(id, payload)),
      )

      const failures = results.filter((r) => r.status === 'rejected').length
      const updates = new Map<number, AdminUser>()
      for (const r of results) {
        if (r.status === 'fulfilled') {
          updates.set(r.value.id, r.value)
        }
      }
      setUsers((list) => list.map((u) => updates.get(u.id) ?? u))

      if (failures > 0) {
        setError(
          `${failures} of ${ids.length} updates failed. Refresh to see the current state.`,
        )
      }
      handleClear()
    } finally {
      setBulkBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage every account on the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportButton users={users} classes={classes} />
          <Button
            onClick={() => setCreateOpen(true)}
            style={{ backgroundColor: branding.colorPrimary }}
          >
            <Plus size={16} />
            Add user
          </Button>
        </div>
      </div>

      <UserFilters
        filters={filters}
        classes={classes}
        onChange={handleFiltersChange}
      />

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

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
          <Loader2 size={14} className="animate-spin" />
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match your filters"
          description="Try changing the filters or search term."
        />
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
            <span>
              Showing {users.length} of {meta.total} users
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-border bg-card px-3 py-1.5 font-medium transition hover:border-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-2">
                Page {meta.page} of {meta.last_page}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.last_page || loading}
                className="rounded-lg border border-border bg-card px-3 py-1.5 font-medium transition hover:border-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <UserRoleModal
        user={roleTarget}
        onClose={() => setRoleTarget(null)}
        onSubmit={handleRoleChange}
      />

      <UserStatusModal
        user={statusTarget}
        onClose={() => setStatusTarget(null)}
        onSubmit={handleStatusChange}
      />

      <UserCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        classes={classes}
        onCreated={handleUserCreated}
      />
    </div>
  )
}

function deriveStatusFilter(status: UserFilterState['status']): {
  is_active?: boolean
  is_suspended?: boolean
} {
  switch (status) {
    case 'active':
      return { is_active: true, is_suspended: false }
    case 'suspended':
      return { is_suspended: true }
    case 'inactive':
      return { is_active: false }
    default:
      return {}
  }
}