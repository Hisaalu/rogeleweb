'use client'

import {
  BookOpen,
  CheckCircle2,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
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
import type { Class, Lesson, Subject } from '@/types/lesson'
import { useEffect, useRef, useState } from 'react'

interface Props {
  lessons: Lesson[]
  classesById: Map<number, Class>
  subjectsById: Map<number, Subject>
  role: string
  currentUserId: number
  onEdit: (lesson: Lesson) => void
  onDelete: (lesson: Lesson) => void
  onTogglePublish: (lesson: Lesson) => void
  onToggleApprove: (lesson: Lesson) => void
  onMaterials: (lesson: Lesson) => void
}

export function LessonTable({
  lessons,
  classesById,
  subjectsById,
  role,
  currentUserId,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleApprove,
  onMaterials,
}: Props) {
  if (lessons.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No matching lessons"
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
          <TableHead>Status</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-12 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lessons.map((lesson) => {
          const classObj = lesson.class_id ? classesById.get(lesson.class_id) : null
          const subjectObj = lesson.subject_id ? subjectsById.get(lesson.subject_id) : null

          const isOwner = lesson.teacher_id === currentUserId
          const canEdit = role === 'admin' || (role === 'teacher' && isOwner)

          return (
            <TableRow key={lesson.id}>
              <TableCell className="max-w-xs">
                <span className="font-medium text-foreground">{lesson.title}</span>
                {lesson.content && (
                  <span className="mt-0.5 block line-clamp-1 text-xs text-muted-foreground">
                    {lesson.content}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {classObj?.name ?? '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {subjectObj?.name ?? '—'}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {lesson.is_published ? (
                    <Badge tone="success">Published</Badge>
                  ) : (
                    <Badge>Draft</Badge>
                  )}
                  {lesson.is_approved && <Badge tone="info">Approved</Badge>}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye size={14} />
                  {lesson.views}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(lesson.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <RowActions
                  lesson={lesson}
                  canEdit={canEdit}
                  isAdmin={role === 'admin'}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onTogglePublish={onTogglePublish}
                  onToggleApprove={onToggleApprove}
                  onMaterials={onMaterials}
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
  lesson,
  canEdit,
  isAdmin,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleApprove,
  onMaterials,
}: {
  lesson: Lesson
  canEdit: boolean
  isAdmin: boolean
  onEdit: (l: Lesson) => void
  onDelete: (l: Lesson) => void
  onTogglePublish: (l: Lesson) => void
  onToggleApprove: (l: Lesson) => void
  onMaterials: (l: Lesson) => void
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
        <div className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <MenuItem
            icon={FileText}
            label="Materials"
            onClick={() => {
              onMaterials(lesson)
              setOpen(false)
            }}
          />
          {canEdit && (
            <>
              <MenuItem
                icon={Pencil}
                label="Edit"
                onClick={() => {
                  onEdit(lesson)
                  setOpen(false)
                }}
              />
              <MenuItem
                icon={lesson.is_published ? XCircle : CheckCircle2}
                label={lesson.is_published ? 'Unpublish' : 'Publish'}
                onClick={() => {
                  onTogglePublish(lesson)
                  setOpen(false)
                }}
              />
            </>
          )}
          {isAdmin && (
            <MenuItem
              icon={lesson.is_approved ? XCircle : CheckCircle2}
              label={lesson.is_approved ? 'Unapprove' : 'Approve'}
              onClick={() => {
                onToggleApprove(lesson)
                setOpen(false)
              }}
            />
          )}
          {canEdit && (
            <MenuItem
              icon={Trash2}
              label="Delete"
              destructive
              onClick={() => {
                onDelete(lesson)
                setOpen(false)
              }}
            />
          )}
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