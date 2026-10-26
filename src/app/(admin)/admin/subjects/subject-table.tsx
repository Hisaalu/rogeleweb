'use client'

import React, { useEffect, useRef, useState } from 'react'
import { BookOpen, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { Class, Subject, TeacherOption } from '@/types/admin'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
})

function teacherName(t?: TeacherOption): string {
  if (!t) return '—'
  const name = [t.first_name, t.last_name].filter(Boolean).join(' ')
  return name || t.email
}

const RowActions = React.memo(function RowActions({
  subject, onEdit, onDelete,
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
      <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label="Row actions">
        <MoreHorizontal size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <button type="button" onClick={() => { onEdit(subject); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted">
            <Pencil size={14} /> Edit
          </button>
          <button type="button" onClick={() => { onDelete(subject); setOpen(false) }} className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-danger-fg transition hover:bg-danger-bg">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
})

const SubjectRow = React.memo(function SubjectRow({
  subject, classObj, teacher, onEdit, onDelete,
}: {
  subject: Subject
  classObj: Class | null
  teacher: TeacherOption | null
  onEdit: (s: Subject) => void
  onDelete: (s: Subject) => void
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{subject.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{subject.code ?? '—'}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{classObj?.name ?? '—'}</TableCell>
      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
        {teacherName(teacher ?? undefined)}
      </TableCell>
      <TableCell>
        {subject.is_active ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {dateFormatter.format(new Date(subject.created_at))}
      </TableCell>
      <TableCell className="text-right">
        <RowActions subject={subject} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
})

const MobileSubjectCard = React.memo(function MobileSubjectCard({
  subject, classObj, teacher, onEdit, onDelete,
}: {
  subject: Subject
  classObj: Class | null
  teacher: TeacherOption | null
  onEdit: (s: Subject) => void
  onDelete: (s: Subject) => void
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{subject.name}</span>
          {subject.code && <span className="text-xs text-muted-foreground">{subject.code}</span>}
        </div>
        <RowActions subject={subject} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Class</p>
          <p className="font-medium">{classObj?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Teacher</p>
          <p className="truncate font-medium">{teacherName(teacher ?? undefined)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">{dateFormatter.format(new Date(subject.created_at))}</span>
        {subject.is_active ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
      </div>
    </div>
  )
})

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
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="hidden sm:block">
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
            {subjects.map((s) => (
              <SubjectRow
                key={s.id}
                subject={s}
                classObj={s.class_id ? classesById.get(s.class_id) ?? null : null}
                teacher={s.teacher_id ? teachersById.get(s.teacher_id) ?? null : null}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:hidden">
        {subjects.map((s) => (
          <MobileSubjectCard
            key={s.id}
            subject={s}
            classObj={s.class_id ? classesById.get(s.class_id) ?? null : null}
            teacher={s.teacher_id ? teachersById.get(s.teacher_id) ?? null : null}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}