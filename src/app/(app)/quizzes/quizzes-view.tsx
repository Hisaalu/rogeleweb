'use client'

import { useEffect, useMemo, useState } from 'react'
import { HelpCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { useBranding } from '@/components/brand/brand-provider'
import {
  createQuizClient,
  deleteQuizClient,
  listMyAttemptsClient,
  setQuizApprovedClient,
  updateQuizClient,
} from '@/lib/quiz.client'
import type { Class, Subject } from '@/types/lesson'
import type { Quiz, QuizAttempt } from '@/types/quiz'
import { QuizTable } from './quiz-table'
import { QuizFormModal, type QuizFormValues } from './quiz-form-modal'
import { QuizQuestionsModal } from './quiz-questions-modal'
import { QuizAttemptsModal } from './quiz-attempts-modal'
import { TakeQuizModal } from './take-quiz-modal'

export function QuizzesView({
  initialQuizzes,
  classes,
  subjects,
  role,
  currentUserId,
}: {
  initialQuizzes: Quiz[]
  classes: Class[]
  subjects: Subject[]
  role: string
  currentUserId: number
}) {
  const branding = useBranding()

  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes)
  const [myAttempts, setMyAttempts] = useState<QuizAttempt[]>([])
  const [classFilter, setClassFilter] = useState<number | null>(null)
  const [subjectFilter, setSubjectFilter] = useState<number | null>(null)
  const [publishedFilter, setPublishedFilter] = useState<boolean | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Quiz | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null)
  const [questionsTarget, setQuestionsTarget] = useState<Quiz | null>(null)
  const [attemptsTarget, setAttemptsTarget] = useState<Quiz | null>(null)
  const [takeTarget, setTakeTarget] = useState<Quiz | null>(null)

  useEffect(() => {
    if (role === 'learner') {
      listMyAttemptsClient().then(setMyAttempts).catch(() => {})
    }
  }, [role])

  const attemptsByQuiz = useMemo(() => {
    const m = new Map<number, number>()
    for (const a of myAttempts) {
      if (a.quiz_id && a.status === 'completed') {
        m.set(a.quiz_id, (m.get(a.quiz_id) ?? 0) + 1)
      }
    }
    return m
  }, [myAttempts])

  const classesById = useMemo(() => {
    const m = new Map<number, Class>()
    for (const c of classes) m.set(c.id, c)
    return m
  }, [classes])

  const subjectsById = useMemo(() => {
    const m = new Map<number, Subject>()
    for (const s of subjects) m.set(s.id, s)
    return m
  }, [subjects])

  const filterableSubjects = useMemo(() => {
    if (!classFilter) return subjects
    return subjects.filter((s) => !s.class_id || s.class_id === classFilter)
  }, [subjects, classFilter])

  const filtered = useMemo(() => {
    let list = quizzes
    if (classFilter !== null) list = list.filter((q) => q.class_id === classFilter)
    if (subjectFilter !== null) list = list.filter((q) => q.subject_id === subjectFilter)
    if (publishedFilter !== null) list = list.filter((q) => q.is_published === publishedFilter)
    return list
  }, [quizzes, classFilter, subjectFilter, publishedFilter])

  const canCreate = role === 'admin' || role === 'teacher'

  function handleNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function handleEdit(q: Quiz) {
    setEditing(q)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: QuizFormValues): Promise<Quiz> {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      class_id: values.class_id!,
      subject_id: values.subject_id!,
      time_limit: values.time_limit ?? undefined,
      passing_score: values.passing_score ?? 50,
      max_attempts: values.max_attempts ?? 3,
      is_published: values.is_published,
    }

    let result: Quiz
    if (editing) {
      result = await updateQuizClient(editing.id, payload)
      setQuizzes((list) => list.map((q) => (q.id === result.id ? result : q)))
    } else {
      result = await createQuizClient(payload)
      setQuizzes((list) => [result, ...list])
    }
    return result
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteQuizClient(deleteTarget.id)
    setQuizzes((list) => list.filter((q) => q.id !== deleteTarget.id))
  }

  async function handleTogglePublish(q: Quiz) {
    try {
      const updated = await updateQuizClient(q.id, { is_published: !q.is_published })
      setQuizzes((list) => list.map((x) => (x.id === updated.id ? updated : x)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  async function handleToggleApprove(q: Quiz) {
    try {
      const updated = await setQuizApprovedClient(q.id, !q.is_approved)
      setQuizzes((list) => list.map((x) => (x.id === updated.id ? updated : x)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Quizzes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canCreate
              ? 'Create quizzes, add questions, and review attempts.'
              : 'Take quizzes assigned to your class.'}
          </p>
        </div>

        {canCreate && (
          <Button onClick={handleNew} style={{ backgroundColor: branding.colorPrimary }}>
            <Plus size={16} />
            New quiz
          </Button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No quizzes yet"
          description={
            canCreate
              ? 'Create your first quiz to get started.'
              : 'Your teacher has not published any quizzes for your class yet.'
          }
          action={
            canCreate ? (
              <Button onClick={handleNew}>
                <Plus size={16} />
                New quiz
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <select
              value={classFilter ?? ''}
              onChange={(e) => {
                setClassFilter(e.target.value ? Number(e.target.value) : null)
                setSubjectFilter(null)
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            >
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={subjectFilter ?? ''}
              onChange={(e) =>
                setSubjectFilter(e.target.value ? Number(e.target.value) : null)
              }
              disabled={!classFilter}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25 disabled:opacity-60"
            >
              <option value="">{classFilter ? 'All subjects' : 'Pick a class first'}</option>
              {filterableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={publishedFilter === null ? '' : publishedFilter ? 'true' : 'false'}
              onChange={(e) => {
                const v = e.target.value
                setPublishedFilter(v === '' ? null : v === 'true')
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            >
              <option value="">Any status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>

          <QuizTable
            quizzes={filtered}
            classesById={classesById}
            subjectsById={subjectsById}
            attemptsByQuiz={attemptsByQuiz}
            role={role}
            currentUserId={currentUserId}
            onTake={setTakeTarget}
            onManageQuestions={setQuestionsTarget}
            onViewAttempts={setAttemptsTarget}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onTogglePublish={handleTogglePublish}
            onToggleApprove={handleToggleApprove}
          />

          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {quizzes.length}
          </p>
        </>
      )}

      <QuizFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        quiz={editing}
        classes={classes}
        subjects={subjects}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete quiz"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" and all its questions and attempts will be permanently deleted.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />

      <QuizQuestionsModal
        open={questionsTarget !== null}
        onOpenChange={(o) => !o && setQuestionsTarget(null)}
        quiz={questionsTarget}
        canEdit={
          role === 'admin' ||
          (role === 'teacher' && questionsTarget?.teacher_id === currentUserId)
        }
      />

      <TakeQuizModal
        open={takeTarget !== null}
        onOpenChange={(o) => !o && setTakeTarget(null)}
        quiz={takeTarget}
        onCompleted={(attempt) => {
          setMyAttempts((list) => [attempt, ...list])
        }}
      />

        <QuizAttemptsModal
            open={attemptsTarget !== null}
            onOpenChange={(o) => !o && setAttemptsTarget(null)}
            quiz={attemptsTarget}
            canDelete={
            role === 'admin' ||
            (role === 'teacher' && attemptsTarget?.teacher_id === currentUserId)
            }
            onDeleted={() => {
            }}
        />
    </div>
  )
}