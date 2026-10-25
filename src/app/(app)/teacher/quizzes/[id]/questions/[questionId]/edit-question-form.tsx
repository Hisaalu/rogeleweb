'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import type { QuizQuestion } from '@/types/quiz'
import { useToast } from '@/components/ui/toast-provider'

export function EditQuestionForm({ quizId, question }: { quizId: number, question: QuizQuestion }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [busy, setBusy] = useState(false)
  
  const [text, setText] = useState(question.question_text)
  const [optA, setOptA] = useState(question.option_a || '')
  const [optB, setOptB] = useState(question.option_b || '')
  const [optC, setOptC] = useState(question.option_c || '')
  const [optD, setOptD] = useState(question.option_d || '')
  const [correct, setCorrect] = useState(['A','B','C','D'][question.correct_option] || 'A')
  const [points, setPoints] = useState(question.points)
  const [explanation, setExplanation] = useState(question.explanation || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    
    try {
      const res = await fetch(`/api/proxy/quizzes/${quizId}/questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          option_a: optA,
          option_b: optB,
          option_c: optC,
          option_d: optD,
          correct_answer: correct,
          points,
          explanation
        })
      })
      
      if (!res.ok) throw new Error('Failed to update question')
      
      showToast('Question updated successfully', 'success')
      setTimeout(() => {
        router.push(`/teacher/quizzes/${quizId}/questions`)
        router.refresh()
      }, 1000)
    } catch {
      showToast('Error updating question', 'error')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-semibold">Question Text <span style={{ color: 'var(--danger-fg)' }}>*</span></label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3} required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-accent" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm font-semibold">Option A <span style={{ color: 'var(--danger-fg)' }}>*</span></label><input value={optA} onChange={e => setOptA(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent" /></div>
        <div><label className="mb-1 block text-sm font-semibold">Option B <span style={{ color: 'var(--danger-fg)' }}>*</span></label><input value={optB} onChange={e => setOptB(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent" /></div>
        <div><label className="mb-1 block text-sm font-semibold">Option C</label><input value={optC} onChange={e => setOptC(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent" /></div>
        <div><label className="mb-1 block text-sm font-semibold">Option D</label><input value={optD} onChange={e => setOptD(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Correct Answer <span style={{ color: 'var(--danger-fg)' }}>*</span></label>
          <select value={correct} onChange={e => setCorrect(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Points</label>
          <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} min={1} max={10} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Explanation</label>
        <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={2} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-accent" />
      </div>
      <div className="flex justify-end pt-4 border-t border-border">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary)' }}>
          <Save size={15} /> {busy ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
    </form>
  )
}