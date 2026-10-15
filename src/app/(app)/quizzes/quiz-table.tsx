'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  HelpCircle,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Play,
  Trash2,
  Users,
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
import type { Quiz } from '@/types/quiz'

interface Props {
  quizzes: Quiz[]
  classesById: Map<number, Class>
  subjectsById: Map<number, Subject>
  attemptsByQuiz: Map<number, number>
  role: string
  currentUserId: number
  onTake: (quiz: Quiz) => void
  onManageQuestions: (quiz: Quiz) => void
  onViewAttempts: (quiz: Quiz) => void
  onEdit: (quiz: Quiz) => void
  onDelete: (quiz: Quiz) => void
  onTogglePublish: (quiz: Quiz) => void
  onToggleApprove: (quiz: Quiz) => void
}

export function QuizTable({
  quizzes,
  classesById,
  subjectsById,
  attemptsByQuiz,
  role,
  currentUserId,
  onTake,
  onManageQuestions,
  onViewAttempts,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleApprove,
}: Props) {
  if (quizzes.length === 0) {
    return (
      <EmptyState
        icon={HelpCircle}
        title="No quizzes found"
        description="Try changing the filters."
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
          <TableHead>Time</TableHead>
          <TableHead>Attempts</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-12 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quizzes.map((q) => {
          const classObj = q.class_id ? classesById.get(q.class_id) : null
          const subjectObj = q.subject_id ? subjectsById.get(q.subject_id) : null
          const isOwner = q.teacher_id === currentUserId
          const canEdit = role === 'admin' || (role === 'teacher' && isOwner)
          const isLearner = role === 'learner' || role === 'external'

          const attemptsUsed = attemptsByQuiz.get(q.id) ?? 0
          const attemptsRemaining = Math.max(0, q.max_attempts - attemptsUsed)
          const attemptsExhausted = isLearner && attemptsRemaining === 0

          return (
            <TableRow key={q.id}>
              <TableCell className="max-w-xs">
                <span className="font-medium text-foreground">{q.title}</span>
                {q.description && (
                  <span className="mt-0.5 block line-clamp-1 text-xs text-muted-foreground">
                    {q.description}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {classObj?.name ?? '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {subjectObj?.name ?? '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {q.time_limit ? `${q.time_limit} min` : '—'}
              </TableCell>
              <TableCell className="text-sm">
                {isLearner ? (
                  <span
                    className={
                      attemptsExhausted
                        ? 'font-medium text-destructive'
                        : 'text-muted-foreground'
                    }
                  >
                    {attemptsUsed} / {q.max_attempts}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{q.max_attempts}</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {q.is_published ? (
                    <Badge tone="success">Published</Badge>
                  ) : (
                    <Badge>Draft</Badge>
                  )}
                  {q.is_approved && <Badge tone="info">Approved</Badge>}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(q.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <RowActions
                  quiz={q}
                  canEdit={canEdit}
                  isLearner={isLearner}
                  isAdmin={role === 'admin'}
                  attemptsExhausted={attemptsExhausted}
                  attemptsUsed={attemptsUsed}
                  onTake={onTake}
                  onManageQuestions={onManageQuestions}
                  onViewAttempts={onViewAttempts}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onTogglePublish={onTogglePublish}
                  onToggleApprove={onToggleApprove}
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
  quiz,
  canEdit,
  isLearner,
  isAdmin,
  attemptsExhausted,
  attemptsUsed,
  onTake,
  onManageQuestions,
  onViewAttempts,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleApprove,
}: {
  quiz: Quiz
  canEdit: boolean
  isLearner: boolean
  isAdmin: boolean
  attemptsExhausted: boolean
  attemptsUsed: number
  onTake: (q: Quiz) => void
  onManageQuestions: (q: Quiz) => void
  onViewAttempts: (q: Quiz) => void
  onEdit: (q: Quiz) => void
  onDelete: (q: Quiz) => void
  onTogglePublish: (q: Quiz) => void
  onToggleApprove: (q: Quiz) => void
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

  if (isLearner && quiz.is_published) {
    items.push(
      <MenuItem
        key="take"
        icon={Play}
        label={
          attemptsExhausted
            ? `No attempts left (${attemptsUsed}/${quiz.max_attempts})`
            : attemptsUsed === 0
              ? 'Start attempt'
              : `Retry (${quiz.max_attempts - attemptsUsed} left)`
        }
        disabled={attemptsExhausted}
        onClick={() => {
          onTake(quiz)
          setOpen(false)
        }}
      />,
    )
  }

  if (canEdit) {
    items.push(
      <MenuItem
        key="questions"
        icon={ListChecks}
        label="Manage questions"
        onClick={() => {
          onManageQuestions(quiz)
          setOpen(false)
        }}
      />,
      <MenuItem
        key="attempts"
        icon={Users}
        label="View attempts"
        onClick={() => {
          onViewAttempts(quiz)
          setOpen(false)
        }}
      />,
      <MenuItem
        key="edit"
        icon={Pencil}
        label="Edit"
        onClick={() => {
          onEdit(quiz)
          setOpen(false)
        }}
      />,
      <MenuItem
        key="publish"
        icon={quiz.is_published ? XCircle : CheckCircle2}
        label={quiz.is_published ? 'Unpublish' : 'Publish'}
        onClick={() => {
          onTogglePublish(quiz)
          setOpen(false)
        }}
      />,
    )
  }

  if (isAdmin) {
    items.push(
      <MenuItem
        key="approve"
        icon={quiz.is_approved ? XCircle : CheckCircle2}
        label={quiz.is_approved ? 'Unapprove' : 'Approve'}
        onClick={() => {
          onToggleApprove(quiz)
          setOpen(false)
        }}
      />,
    )
  }

  if (canEdit) {
    items.push(
      <MenuItem
        key="delete"
        icon={Trash2}
        label="Delete"
        destructive
        onClick={() => {
          onDelete(quiz)
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
        <div className="absolute right-0 z-10 mt-1 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
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
  disabled,
}: {
  icon: typeof Pencil
  label: string
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-muted'
      } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}