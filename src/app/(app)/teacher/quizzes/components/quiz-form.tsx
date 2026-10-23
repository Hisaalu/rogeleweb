'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Info, Cog, Globe, AlertTriangle } from 'lucide-react'
import type { Quiz } from '@/types/quiz'
import type { Class, Subject } from '@/types/admin'
import { ToastViewport, type ToastMessage, type ToastTone } from '@/components/ui/toast'

export function QuizForm({ 
  classes, subjects, mode, initial 
}: { 
  classes: Class[], subjects: Subject[], mode: 'create' | 'edit', initial?: Quiz 
}) {
  const router = useRouter()
  
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [classId, setClassId] = useState(initial?.class_id ? String(initial.class_id) : '')
  const [subjectId, setSubjectId] = useState(initial?.subject_id ? String(initial.subject_id) : '')
  const [timeLimit, setTimeLimit] = useState(initial?.time_limit ?? 30)
  const [passingScore, setPassingScore] = useState(initial?.passing_score ?? 70)
  const [maxAttempts, setMaxAttempts] = useState(initial?.max_attempts ?? 1)
  const [endDate, setEndDate] = useState(initial?.end_date ? initial.end_date.slice(0, 16) : '')
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true)

  const [busy, setBusy] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  
  const pushToast = useCallback((message: string, tone: ToastTone) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, tone }])
  }, [])
  const closeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const filteredSubjects = useMemo(() => {
    if (!classId) return []
    return subjects.filter(s => String(s.class_id) === classId)
  }, [classId, subjects])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !classId || !subjectId || !endDate) return pushToast('Please fill all required fields', 'error')
    
    setBusy(true)
    const payload = {
      title, description, 
      class_id: Number(classId), 
      subject_id: Number(subjectId),
      time_limit: Number(timeLimit), 
      passing_score: Number(passingScore),
      max_attempts: Number(maxAttempts), 
      end_date: new Date(endDate).toISOString(),
      is_published: isPublished
    }

    try {
      const url = mode === 'create' ? '/api/proxy/quizzes' : `/api/proxy/quizzes/${initial?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error('Failed to save quiz')
      
      pushToast(mode === 'create' ? 'Quiz created successfully' : 'Quiz updated successfully', 'success')
      setTimeout(() => {
        router.push('/teacher/quizzes')
        router.refresh()
      }, 1000)
    } catch (err: any) {
      pushToast(err.message || 'Failed to save quiz', 'error')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-5 sm:px-4 sm:py-8">
      <Link href="/teacher/quizzes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Quizzes
      </Link>
      
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <Globe size={22} style={{ color: 'var(--brand-primary)' }} className="shrink-0" />
          <span style={{ color: 'var(--brand-primary)' }}>{mode === 'create' ? 'Create New Quiz' : 'Edit Quiz'}</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:space-y-8 sm:p-8">
        <Section icon={Info} title="Basic Information">
          <Field label="Quiz Title" required>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-accent sm:py-3" />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-accent sm:py-3" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Class" required>
              <select value={classId} onChange={e => { setClassId(e.target.value); setSubjectId('') }} required className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-accent sm:py-3">
                <option value="">Select a class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Subject" required>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!classId} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-accent disabled:opacity-50 sm:py-3">
                <option value="">Select a subject</option>
                {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section icon={Cog} title="Quiz Settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Time Limit (minutes)">
              <input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} min={1} max={180} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-accent sm:py-3" />
            </Field>
            <Field label="Passing Score (%)">
              <input type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} min={0} max={100} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-accent sm:py-3" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Maximum Attempts">
              <input type="number" value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} min={1} max={10} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-accent sm:py-3" />
            </Field>
            <Field label="Quiz Deadline" required>
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-accent sm:py-3" />
            </Field>
          </div>
        </Section>

        <Section icon={Globe} title="Publishing Options">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="h-4 w-4 rounded accent-brand-accent" />
            Publish immediately
          </label>
          {!isPublished && (
            <div className="mt-4 flex items-start gap-3 rounded-xl p-4 text-sm" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-fg)' }}>
              <AlertTriangle size={18} className="shrink-0" />
              <p>Don't forget to add questions after creating the quiz. Students will only see the quiz once you've added questions and published it.</p>
            </div>
          )}
        </Section>

        <div className="flex justify-end border-t border-border pt-4">
          <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <Save size={15} /> {busy ? 'Saving...' : mode === 'create' ? 'Create Quiz' : 'Save Changes'}
          </button>
        </div>
      </form>
      
      <ToastViewport toasts={toasts} onClose={closeToast} />
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-b border-border pb-6 last:border-b-0 last:pb-0 sm:space-y-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Icon size={18} style={{ color: 'var(--brand-accent)' }} /> {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, required, children }: { label: string, required?: boolean, children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label} {required && <span style={{ color: 'var(--danger-fg)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}