'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Users, CheckCircle2, AlertTriangle, Star, Edit2, Save } from 'lucide-react'
import type { Homework, HomeworkSubmission } from '@/types/homework'
import { gradeSubmissionClient } from '@/lib/homework.client'
import { materialDownloadUrl, formatFileSize } from '@/lib/materials'

export function SubmissionsView({ homework, submissions: initial }: { homework: Homework, submissions: HomeworkSubmission[] }) {
  const [submissions, setSubmissions] = useState(initial)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [grades, setGrades] = useState<Record<number, string>>({})
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({})
  const [busyId, setBusyId] = useState<number | null>(null)

  const total = submissions.length
  const gradedCount = submissions.filter(s => s.status === 'graded').length
  const lateCount = submissions.filter(s => s.status === 'late').length
  const avgGrade = gradedCount > 0 
    ? Math.round(submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedCount) 
    : 0

  async function handleGrade(id: number) {
    const gradeVal = grades[id]
    const feedbackVal = feedbacks[id] || ''
    if (!gradeVal) return alert('Please enter a grade')
    
    const num = Number(gradeVal)
    if (isNaN(num) || num < 0 || num > 100) return alert('Grade must be 0-100')

    setBusyId(id)
    try {
      await gradeSubmissionClient(id, num, feedbackVal)
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, grade: num, feedback: feedbackVal, status: 'graded' } : s))
      setEditingId(null)
    } catch {
      alert('Failed to save grade')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/teacher/homework" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Back to Homework
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Homework Submissions</h1>
          <p className="text-sm text-muted-foreground">{homework.title}</p>
        </div>
        <button onClick={() => alert('Exporting CSV... (Wire this to a client-side download)')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
          <Download size={15} /> Export Grades (CSV)
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Total Submissions" value={total} color="bg-[#f06724]" />
        <StatCard icon={CheckCircle2} label="Graded" value={gradedCount} color="bg-[#23a74c]" />
        <StatCard icon={AlertTriangle} label="Late" value={lateCount} color="bg-[#f06724]" />
        <StatCard icon={Star} label="Average Grade" value={`${avgGrade}%`} color="bg-[#f06724]" />
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Users size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--brand-accent)' }} />
          <h3 className="text-xl font-bold text-foreground">No Submissions Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Students haven't submitted this homework yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => {
            const isEditing = editingId === sub.id
            const passed = (sub.grade ?? 0) >= 50 // Assuming 50 is pass mark

            return (
              <div key={sub.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-brand-accent">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h3 className="font-bold text-foreground">{sub.student_first_name} {sub.student_last_name}</h3>
                    <p className="text-sm text-muted-foreground">{sub.student_email}</p>
                  </div>
                  <div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 
                      sub.status === 'late' ? 'bg-amber-100 text-amber-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Submitted At</p>
                    <p className="text-sm font-medium text-foreground">{new Date(sub.submitted_at).toLocaleString()}</p>
                  </div>
                </div>

                {sub.text_answer && (
                  <div className="mt-4">
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Answer</p>
                    <div className="rounded-xl bg-muted p-4 text-sm text-foreground whitespace-pre-wrap">{sub.text_answer}</div>
                  </div>
                )}

                {sub.files && sub.files.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Attachments</p>
                    <div className="space-y-2">
                      {sub.files.map(f => (
                        <a key={f.id} href={materialDownloadUrl(f.file_path)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-primary hover:underline">
                          <Download size={14} /> {f.file_name} <span className="text-xs text-muted-foreground">({formatFileSize(f.file_size)})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-xl bg-muted/30 p-4">
                  {!isEditing && sub.status === 'graded' ? (
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">Grade: <span className={passed ? 'text-emerald-500' : 'text-red-500'}>{sub.grade}%</span></span>
                        </div>
                        <button onClick={() => { setEditingId(sub.id); setGrades({...grades, [sub.id]: String(sub.grade)}); setFeedbacks({...feedbacks, [sub.id]: sub.feedback || ''}) }} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100">
                          <Edit2 size={12} /> Edit Grade
                        </button>
                      </div>
                      {sub.feedback && <p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">Feedback:</strong> {sub.feedback}</p>}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Grade (%)</label>
                        <input type="number" min={0} max={100} value={grades[sub.id] || ''} onChange={e => setGrades({...grades, [sub.id]: e.target.value})} className="w-32 rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand-accent" placeholder="0-100" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Feedback</label>
                        <textarea value={feedbacks[sub.id] || ''} onChange={e => setFeedbacks({...feedbacks, [sub.id]: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand-accent" placeholder="Provide feedback..." />
                      </div>
                      <button onClick={() => handleGrade(sub.id)} disabled={busyId === sub.id} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                        <Save size={14} /> {busyId === sub.id ? 'Saving...' : 'Save Grade'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}