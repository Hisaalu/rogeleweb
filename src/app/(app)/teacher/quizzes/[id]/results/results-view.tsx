'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Trash2, Users, Trophy, LineChart, X, Copy } from 'lucide-react'
import type { Quiz, QuizAttempt } from '@/types/quiz'

export function ResultsView({ quiz, attempts }: { quiz: Quiz, attempts: QuizAttempt[] }) {
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const totalAttempts = attempts.length
  const uniqueStudents = new Set(attempts.map(a => a.user_id)).size
  const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((s, a) => s + (a.score ?? 0), 0) / totalAttempts) : 0
  const passingScore = quiz.passing_score ?? 50
  const passRate = totalAttempts > 0 ? Math.round((attempts.filter(a => (a.score ?? 0) >= passingScore).length / totalAttempts) * 100) : 0

  function downloadCSV() {
    const headers = ['Student', 'Email', 'Score (%)', 'Result', 'Date']
    const rows = attempts.map(a => [
      `${a.student_first_name} ${a.student_last_name}`,
      a.student_email ?? '',
      a.score ?? 0,
      (a.score ?? 0) >= passingScore ? 'Passed' : 'Failed',
      a.completed_at ? new Date(a.completed_at).toLocaleString() : ''
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quiz.title.replace(/[^a-z0-9]/gi, '_')}_results.csv`
    a.click()
  }

  async function handleDeleteAttempts() {
    try {
      await fetch(`/api/proxy/quizzes/${quiz.id}/attempts`, { method: 'DELETE' })
      window.location.reload()
    } catch {
      alert('Failed to delete attempts')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/teacher/quizzes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Quizzes
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Results: {quiz.title}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
            <Download size={15} /> Export Excel (CSV)
          </button>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600">
            <Trash2 size={15} /> Delete Attempts
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Attempts" value={totalAttempts} color="bg-purple-500" />
        <StatCard icon={Users} label="Unique Students" value={uniqueStudents} color="bg-emerald-500" />
        <StatCard icon={LineChart} label="Average Score" value={`${avgScore}%`} color="bg-orange-500" />
        <StatCard icon={Trophy} label="Pass Rate" value={`${passRate}%`} color="bg-brand-primary" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">Student Attempts ({totalAttempts})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">#</th>
                <th className="px-6 py-3 font-semibold">Student</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Score (%)</th>
                <th className="px-6 py-3 font-semibold">Result</th>
                <th className="px-6 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attempts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No results yet.</td></tr>
              ) : (
                attempts.map((a, idx) => {
                  const passed = (a.score ?? 0) >= passingScore
                  return (
                    <tr key={a.id} className="hover:bg-muted/50">
                      <td className="px-6 py-3">{idx + 1}</td>
                      <td className="px-6 py-3 font-medium">{a.student_first_name} {a.student_last_name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{a.student_email}</td>
                      <td className={`px-6 py-3 font-bold ${passed ? 'text-emerald-500' : 'text-red-500'}`}>{a.score}%</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{a.completed_at ? new Date(a.completed_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card shadow-xl">
            <div className="flex items-center justify-between rounded-t-2xl border-b border-red-200 bg-red-50 px-6 py-4 dark:border-red-900/50 dark:bg-red-950/30">
              <h3 className="flex items-center gap-2 text-lg font-bold text-red-700 dark:text-red-400">
                <Trash2 size={18} /> Delete All Attempts
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm text-foreground">Are you sure you want to delete <strong>ALL {totalAttempts} attempts</strong> for this quiz?</p>
              <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-300">
                This action cannot be undone. First download the student scores and attempts because when you delete, all the data will be permanently removed!
              </div>
              <label className="mb-2 block text-sm font-medium">Type <strong>"DELETE"</strong> to confirm:</label>
              <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE" className="w-full rounded-xl border border-border px-4 py-2 text-center text-lg font-bold tracking-widest outline-none focus:border-red-500" />
            </div>
            <div className="flex justify-end gap-3 rounded-b-2xl border-t border-border px-6 py-4">
              <button onClick={() => setShowModal(false)} className="rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80">Cancel</button>
              <button onClick={handleDeleteAttempts} disabled={confirmText !== 'DELETE'} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                <Trash2 size={15} /> Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}