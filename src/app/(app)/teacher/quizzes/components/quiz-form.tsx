'use client'

import { useRouter } from 'nextjs-toploader/app'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Info, Cog, Globe, AlertTriangle, type LucideIcon } from 'lucide-react'
import type { Quiz } from '@/types/quiz'
import type { Class, Subject } from '@/types/admin'
import { useToast } from '@/components/ui/toast-provider'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function QuizForm({ 
  classes, subjects, mode, initial 
}: { 
  classes: Class[], subjects: Subject[], mode: 'create' | 'edit', initial?: Quiz 
}) {
  const router = useRouter()
  const { showToast } = useToast()
  
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

  const filteredSubjects = useMemo(() => {
    if (!classId) return []
    return subjects.filter(s => String(s.class_id) === classId)
  }, [classId, subjects])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !classId || !subjectId || !endDate) return showToast('Please fill all required fields', 'error')
    
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
      
      if (!res.ok) {
        const text = await res.text()
        let msg = 'Failed to save quiz'
        try {
          const data = JSON.parse(text)
          msg = data.error?.message || data.message || msg
        } catch { }
        throw new Error(msg)
      }
      
      showToast(mode === 'create' ? 'Quiz created successfully' : 'Quiz updated successfully', 'success')
      setTimeout(() => {
        router.push('/teacher/quizzes')
        router.refresh()
      }, 1000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save quiz'
      showToast(message, 'error')
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

      <Card className="p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <Section icon={Info} title="Basic Information">
            <Field label="Quiz Title" required>
              <Input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
            </Field>
            <Field label="Description">
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/25" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Class" required>
                <Select value={classId} onChange={e => { setClassId(e.target.value); setSubjectId('') }} required>
                  <option value="">Select a class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Subject" required>
                <Select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!classId}>
                  <option value="">Select a subject</option>
                  {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </Field>
            </div>
          </Section>

          <Section icon={Cog} title="Quiz Settings">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Time Limit (minutes)">
                <Input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} min={1} max={180} />
              </Field>
              <Field label="Passing Score (%)">
                <Input type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} min={0} max={100} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Maximum Attempts">
                <Input type="number" value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} min={1} max={10} />
              </Field>
              <Field label="Quiz Deadline" required>
                <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
              </Field>
            </div>
          </Section>

          <Section icon={Globe} title="Publishing Options">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="h-4 w-4 rounded border-input" style={{ accentColor: 'var(--brand-accent)' }} />
              Publish immediately
            </label>
            {!isPublished && (
              <div className="mt-4 flex items-start gap-3 rounded-md p-4 text-sm" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-fg)' }}>
                <AlertTriangle size={18} className="shrink-0" />
                <p>Don&apos;t forget to add questions after creating the quiz. Students will only see the quiz once you&apos;ve added questions and published it.</p>
              </div>
            )}
          </Section>

          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" disabled={busy} className="w-full sm:w-auto">
              <Save size={15} className="mr-2" /> {busy ? 'Saving...' : mode === 'create' ? 'Create Quiz' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: LucideIcon, title: string, children: React.ReactNode }) {
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
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span style={{ color: 'var(--danger-fg)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}