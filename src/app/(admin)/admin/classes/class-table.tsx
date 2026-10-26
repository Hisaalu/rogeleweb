'use client'

import { useEffect, useRef, useState } from 'react'
import React from 'react'
import { GraduationCap, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { Class } from '@/types/admin'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
})

const RowActions = React.memo(function RowActions({
  classItem, onEdit, onDelete,
}: {
  classItem: Class
  onEdit: (c: Class) => void
  onDelete: (c: Class) => void
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
        <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <button type="button" onClick={() => { onEdit(classItem); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted">
            <Pencil size={14} /> Edit
          </button>
          <button type="button" onClick={() => { onDelete(classItem); setOpen(false) }} className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-danger-fg transition hover:bg-danger-bg">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
})

const ClassRow = React.memo(function ClassRow({
  classItem, onEdit, onDelete,
}: {
  classItem: Class
  onEdit: (c: Class) => void
  onDelete: (c: Class) => void
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{classItem.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{classItem.level}</TableCell>
      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
        {classItem.description ?? '—'}
      </TableCell>
      <TableCell>
        {classItem.is_active ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {dateFormatter.format(new Date(classItem.created_at))}
      </TableCell>
      <TableCell className="text-right">
        <RowActions classItem={classItem} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
})

const MobileClassCard = React.memo(function MobileClassCard({
  classItem, onEdit, onDelete,
}: {
  classItem: Class
  onEdit: (c: Class) => void
  onDelete: (c: Class) => void
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{classItem.name}</span>
          <span className="text-xs text-muted-foreground">{classItem.level}</span>
        </div>
        <RowActions classItem={classItem} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <p className="text-sm text-muted-foreground">{classItem.description ?? 'No description'}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">{dateFormatter.format(new Date(classItem.created_at))}</span>
        {classItem.is_active ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
      </div>
    </div>
  )
})

export function ClassTable({
  classes, onEdit, onDelete,
}: {
  classes: Class[]
  onEdit: (c: Class) => void
  onDelete: (c: Class) => void
}) {
  if (classes.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No matching classes"
        description="Try changing the filters or search term."
      />
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((c) => (
              <ClassRow key={c.id} classItem={c} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:hidden">
        {classes.map((c) => (
          <MobileClassCard key={c.id} classItem={c} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}