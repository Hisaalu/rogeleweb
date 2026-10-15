'use client'

import { useEffect, useRef, useState } from 'react'
import { GraduationCap, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { formatDate } from '@/lib/utils'
import type { Class } from '@/types/admin'

export function ClassTable({
  classes,
  onEdit,
  onDelete,
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
          <TableRow key={c.id}>
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{c.level}</TableCell>
            <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
              {c.description ?? '—'}
            </TableCell>
            <TableCell>
              {c.is_active ? (
                <Badge tone="success">Active</Badge>
              ) : (
                <Badge>Inactive</Badge>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(c.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <RowActions classItem={c} onEdit={onEdit} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function RowActions({
  classItem,
  onEdit,
  onDelete,
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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label="Row actions"
      >
        <MoreHorizontal size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <button
            type="button"
            onClick={() => {
              onEdit(classItem)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(classItem)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}