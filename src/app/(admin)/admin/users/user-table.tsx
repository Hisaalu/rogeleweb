'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  Ban,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Shield,
  UserCog,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getInitials, formatDate } from '@/lib/utils'
import type { AdminUser, Class } from '@/types/admin'

function roleTone(role: string): 'default' | 'info' | 'warning' | 'success' {
  switch (role) {
    case 'admin':
      return 'info'
    case 'teacher':
      return 'warning'
    case 'learner':
      return 'success'
    default:
      return 'default'
  }
}

function displayName(u: AdminUser): string {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return name || u.email
}

export function UserTable({
  users,
  classes,
  selectedIds,
  onSelectOne,
  onSelectAll,
  onChangeRole,
  onChangeStatus,
}: {
  users: AdminUser[]
  classes: Class[]
  selectedIds: Set<number>
  onSelectOne: (id: number, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onChangeRole: (u: AdminUser) => void
  onChangeStatus: (u: AdminUser) => void
}) {
  const classesById = new Map<number, Class>()
  for (const c of classes) classesById.set(c.id, c)

  const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id))
  const someSelected = users.some((u) => selectedIds.has(u.id)) && !allSelected

  const headerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  if (users.length === 0) {
    return (
      <EmptyState
        icon={UserCog}
        title="No users"
        description="Try changing the filters."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <input
              ref={headerRef}
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="h-4 w-4 rounded border-input"
              aria-label="Select all users on this page"
            />
          </TableHead>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last login</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-12 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => {
          const classObj = u.class_id ? classesById.get(u.class_id) : null
          const name = displayName(u)
          const selected = selectedIds.has(u.id)
          return (
            <TableRow key={u.id} className={selected ? 'bg-brand-primary/5' : ''}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => onSelectOne(u.id, e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                  aria-label={`Select ${name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: 'var(--brand-accent)' }}
                  >
                    {getInitials(name)}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="block truncate font-medium text-foreground hover:text-brand-primary"
                    >
                      {name}
                    </Link>
                    <span className="block truncate text-xs text-muted-foreground">
                      {u.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge tone={roleTone(u.role)}>{u.role}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {classObj?.name ?? '—'}
              </TableCell>
              <TableCell>
                {u.is_suspended ? (
                  <Badge tone="danger">Suspended</Badge>
                ) : u.is_active ? (
                  <Badge tone="success">Active</Badge>
                ) : (
                  <Badge>Deactivated</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {u.last_login ? formatDate(u.last_login) : 'Never'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(u.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <RowActions
                  user={u}
                  onChangeRole={onChangeRole}
                  onChangeStatus={onChangeStatus}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function RowActions({
  user,
  onChangeRole,
  onChangeStatus,
}: {
  user: AdminUser
  onChangeRole: (u: AdminUser) => void
  onChangeStatus: (u: AdminUser) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label="Row actions"
      >
        <MoreHorizontal size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <Link
            href={`/admin/users/${user.id}`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
          >
            <Eye size={14} />
            View profile
          </Link>

          <button
            type="button"
            onClick={() => {
              onChangeRole(user)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
          >
            <Shield size={14} />
            Change role
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeStatus(user)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm transition hover:bg-muted"
          >
            {user.is_suspended ? (
              <>
                <CheckCircle2 size={14} />
                Reactivate
              </>
            ) : user.is_active ? (
              <>
                <Ban size={14} />
                Suspend
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Activate
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}