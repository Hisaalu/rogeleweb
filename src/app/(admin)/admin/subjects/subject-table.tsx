'use client'

import { useEffect, useRef, useState } from 'react'
import { BookOpen, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import type { Class, Subject, TeacherOption } from '@/types/admin'

function teacherName(t?: TeacherOption): string {
  if (!t) return '—'
  const name = [t.first_name, t.last_name].filter(Boolean).join(' ')
  return name || t.email
}

export function SubjectTable({
  subjects,
  classesById,
  teachersById,
  onEdit,
  onDelete,
}: {
  subjects: Subject[]
  classesById: Map<number, Class>
  teachersById: Map<number, TeacherOption>
  onEdit: (s: Subject) => void
  onDelete: (s: Subject) => void
}) {
  if (subjects.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No matching subjects"
        description="Try changing the filters or search term."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-12 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((s) => {
          const classObj = s.class_id ? classesById.get(s.class_id) : null
          const teacher = s.teacher_id ? teachersById.get(s.teacher_id) : null
          return (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {s.code ?? '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {classObj?.name ?? '—'}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                {teacherName(teacher ?? undefined)}
              </TableCell>
              <TableCell>
                {s.is_active ? (
                  <Badge tone="success">Active</Badge>
                ) : (
                  <Badge>Inactive</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(s.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <RowActions subject={s} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function RowActions({
  subject,
  onEdit,
  onDelete,
}: {
  subject: Subject
  onEdit: (s: Subject) => void
  onDelete: (s: Subject) => void
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
              onEdit(subject)
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
              onDelete(subject)
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