'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import {
  Ban, CheckCircle2, Eye, MoreHorizontal, Shield, UserCog,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getInitials, formatDate } from '@/lib/utils'
import type { AdminUser, Class } from '@/types/admin'

function roleTone(role: string): 'default' | 'info' | 'warning' | 'success' {
  switch (role) {
    case 'admin': return 'info'
    case 'teacher': return 'warning'
    case 'learner': return 'success'
    default: return 'default'
  }
}

function displayName(u: AdminUser): string {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return name || u.email
}

const RowActions = React.memo(function RowActions({
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
      <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label="Row actions">
        <MoreHorizontal size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <Link href={`/admin/users/${user.id}`} onClick={() => setOpen(false)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted">
            <Eye size={14} /> View profile
          </Link>
          <button type="button" onClick={() => { onChangeRole(user); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted">
            <Shield size={14} /> Change role
          </button>
          <button type="button" onClick={() => { onChangeStatus(user); setOpen(false) }} className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm transition hover:bg-muted">
            {user.is_suspended ? (
              <><CheckCircle2 size={14} /> Reactivate</>
            ) : user.is_active ? (
              <><Ban size={14} /> Suspend</>
            ) : (
              <><CheckCircle2 size={14} /> Activate</>
            )}
          </button>
        </div>
      )}
    </div>
  )
})

const UserTableRow = React.memo(function UserTableRow({
  user,
  classObj,
  selected,
  onSelectOne,
  onChangeRole,
  onChangeStatus,
}: {
  user: AdminUser
  classObj: Class | null
  selected: boolean
  onSelectOne: (id: number, selected: boolean) => void
  onChangeRole: (u: AdminUser) => void
  onChangeStatus: (u: AdminUser) => void
}) {
  const name = displayName(user)
  return (
    <TableRow className={selected ? 'bg-brand-primary/5' : ''}>
      <TableCell>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelectOne(user.id, e.target.checked)}
          className="h-4 w-4 rounded border-input"
          aria-label={`Select ${name}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: 'var(--brand-accent)' }}>
            {getInitials(name)}
          </div>
          <div className="min-w-0">
            <Link href={`/admin/users/${user.id}`} className="block truncate font-medium text-foreground hover:text-brand-primary">
              {name}
            </Link>
            <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell><Badge tone={roleTone(user.role)}>{user.role}</Badge></TableCell>
      <TableCell className="text-sm text-muted-foreground">{classObj?.name ?? '—'}</TableCell>
      <TableCell>
        {user.is_suspended ? <Badge tone="danger">Suspended</Badge> : user.is_active ? <Badge tone="success">Active</Badge> : <Badge>Deactivated</Badge>}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{user.last_login ? formatDate(user.last_login) : 'Never'}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatDate(user.created_at)}</TableCell>
      <TableCell className="text-right">
        <RowActions user={user} onChangeRole={onChangeRole} onChangeStatus={onChangeStatus} />
      </TableCell>
    </TableRow>
  )
})

const MobileUserCard = React.memo(function MobileUserCard({
  user,
  classObj,
  selected,
  onSelectOne,
  onChangeRole,
  onChangeStatus,
}: {
  user: AdminUser
  classObj: Class | null
  selected: boolean
  onSelectOne: (id: number, selected: boolean) => void
  onChangeRole: (u: AdminUser) => void
  onChangeStatus: (u: AdminUser) => void
}) {
  const name = displayName(user)
  return (
    <div className={`flex flex-col gap-3 border-b border-border p-4 transition-colors last:border-0 ${selected ? 'bg-brand-primary/5' : 'hover:bg-muted/30'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectOne(user.id, e.target.checked)}
            className="h-4 w-4 rounded border-input mt-1"
          />
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: 'var(--brand-accent)' }}>
            {getInitials(name)}
          </div>
          <div className="min-w-0">
            <Link href={`/admin/users/${user.id}`} className="block truncate font-medium text-foreground hover:text-brand-primary">
              {name}
            </Link>
            <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <RowActions user={user} onChangeRole={onChangeRole} onChangeStatus={onChangeStatus} />
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm ml-7">
        <div>
          <p className="text-xs text-muted-foreground">Role</p>
          <Badge tone={roleTone(user.role)} className="mt-1">{user.role}</Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <div className="mt-1">
            {user.is_suspended ? <Badge tone="danger">Suspended</Badge> : user.is_active ? <Badge tone="success">Active</Badge> : <Badge>Deactivated</Badge>}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Class</p>
          <p className="font-medium">{classObj?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Joined</p>
          <p className="font-medium">{formatDate(user.created_at)}</p>
        </div>
      </div>
    </div>
  )
})

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
    if (headerRef.current) headerRef.current.indeterminate = someSelected
  }, [someSelected])

  if (users.length === 0) {
    return <EmptyState icon={UserCog} title="No users" description="Try changing the filters." />
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="hidden sm:block">
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
            {users.map((u) => (
              <UserTableRow
                key={u.id}
                user={u}
                classObj={u.class_id ? classesById.get(u.class_id) ?? null : null}
                selected={selectedIds.has(u.id)}
                onSelectOne={onSelectOne}
                onChangeRole={onChangeRole}
                onChangeStatus={onChangeStatus}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:hidden">
        {users.map((u) => (
          <MobileUserCard
            key={u.id}
            user={u}
            classObj={u.class_id ? classesById.get(u.class_id) ?? null : null}
            selected={selectedIds.has(u.id)}
            onSelectOne={onSelectOne}
            onChangeRole={onChangeRole}
            onChangeStatus={onChangeStatus}
          />
        ))}
      </div>
    </div>
  )
}