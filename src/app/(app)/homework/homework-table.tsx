'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCheck,
  XCircle,
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
import { formatDate } from '@/lib/utils'
import type { Class, Subject } from '@/types/lesson'
import type { Homework } from '@/types/homework'

interface Props {
  homework: Homework[]
  classesById: Map<number, Class>
  subjectsById: Map<number, Subject>
  role: string
  currentUserId: number
  onSubmit: (hw: Homework) => void
  onEdit: (hw: Homework) => void
  onDelete: (hw: Homework) => void
  onToggleActive: (hw: Homework) => void
  onViewSubmissions: (hw: Homework) => void
}

export function HomeworkTable({
  homework,
  classesById,
  subjectsById,
  role,
  currentUserId,
  onSubmit,
  onEdit,
  onDelete,
  onToggleActive,
  onViewSubmissions,
}: Props) {
  if (homework.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No homework found"
        description="Try changing the filters or search term."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {homework.map((hw) => {
          const classObj = classesById.get(hw.class_id)
          const subjectObj = subjectsById.get(hw.subject_id)
          const isOwner = hw.teacher_id === currentUserId
          const canEdit = role === 'admin' || (role === 'teacher' && isOwner)
          const isLearner = role === 'learner'

          const dueDate = new Date(hw.due_date)
          const isOverdue = dueDate < new Date()

          return (
            <TableRow key={hw.id}>
              <TableCell className="max-w-xs">
                <span className="font-medium text-foreground">{hw.title}</span>
                {hw.description && (
                  <span className="mt-0.5 block line-clamp-1 text-xs text-muted-foreground">
                    {hw.description}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {classObj?.name ?? '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {subjectObj?.name ?? '—'}
              </TableCell>
              <TableCell className="text-sm">
                <span className={isOverdue ? 'text-destructive' : 'text-muted-foreground'}>
                  {formatDate(hw.due_date)}
                </span>
              </TableCell>
              <TableCell>
                {hw.is_active ? (
                  <Badge tone="success">Active</Badge>
                ) : (
                  <Badge>Inactive</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <RowActions
                  hw={hw}
                  canEdit={canEdit}
                  isLearner={isLearner}
                  onSubmit={onSubmit}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleActive={onToggleActive}
                  onViewSubmissions={onViewSubmissions}
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
  hw,
  canEdit,
  isLearner,
  onSubmit,
  onEdit,
  onDelete,
  onToggleActive,
  onViewSubmissions,
}: {
  hw: Homework
  canEdit: boolean
  isLearner: boolean
  onSubmit: (hw: Homework) => void
  onEdit: (hw: Homework) => void
  onDelete: (hw: Homework) => void
  onToggleActive: (hw: Homework) => void
  onViewSubmissions: (hw: Homework) => void
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

  const items: React.ReactNode[] = []

  if (isLearner && hw.is_active) {
    items.push(
      <MenuItem
        key="submit"
        icon={UserCheck}
        label="Submit answer"
        onClick={() => {
          onSubmit(hw)
          setOpen(false)
        }}
      />,
    )
  }

  if (canEdit) {
    items.push(
      <MenuItem
        key="submissions"
        icon={Eye}
        label="View submissions"
        onClick={() => {
          onViewSubmissions(hw)
          setOpen(false)
        }}
      />,
      <MenuItem
        key="edit"
        icon={Pencil}
        label="Edit"
        onClick={() => {
          onEdit(hw)
          setOpen(false)
        }}
      />,
      <MenuItem
        key="active"
        icon={hw.is_active ? XCircle : CheckCircle2}
        label={hw.is_active ? 'Deactivate' : 'Activate'}
        onClick={() => {
          onToggleActive(hw)
          setOpen(false)
        }}
      />,
      <MenuItem
        key="delete"
        icon={Trash2}
        label="Delete"
        destructive
        onClick={() => {
          onDelete(hw)
          setOpen(false)
        }}
      />,
    )
  }

  if (items.length === 0) return null

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
        <div className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {items}
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: typeof Pencil
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-muted'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}