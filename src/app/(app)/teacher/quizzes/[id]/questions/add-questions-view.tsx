'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, PlusCircle, X, HelpCircle } from 'lucide-react'
import type { Quiz } from '@/types/quiz'
import { useToast } from '@/components/ui/toast-provider'

export function AddQuestionsView({ quiz }: { quiz: Quiz }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [questions, setQuestions] = useState([{ id: 1 }])
  const [busy, setBusy] = useState(false)

  function addQuestion() {
    setQuestions(prev => [...prev, { id: Date.now() }])
  }

  function removeQuestion(id: number) {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    const formData = new FormData(e.currentTarget)
    
    const payload = questions.map((_, idx) => ({
      question: formData.get(`q_${idx}_text`),
      option_a: formData.get(`q_${idx}_a`),
      option_b: formData.get(`q_${idx}_b`),
      option_c: formData.get(`q_${idx}_c`) || null,
      option_d: formData.get(`q_${idx}_d`) || null,
      correct_answer: formData.get(`q_${idx}_correct`),
      points: Number(formData.get(`q_${idx}_points`)),
    }))

    try {
      const res = await fetch(`/api/proxy/quizzes/${quiz.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: payload })
      })
      if (!res.ok) throw new Error('Failed to add questions')
      
      showToast('Questions added successfully', 'success')
      setTimeout(() => {
        router.push(`/teacher/quizzes`)
        router.refresh()
      }, 1000)
    } catch {
      showToast('Error adding questions', 'error')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link href="/teacher/quizzes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Quizzes
      </Link>

      <h1 className="text-2xl font-bold text-foreground">Add Questions to: {quiz.title}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="relative rounded-2xl border-2 border-border bg-card p-6 transition hover:border-brand-accent">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <HelpCircle size={18} style={{ color: 'var(--brand-accent)' }} /> Question {idx + 1}
              </h3>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(q.id)} className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-80" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">Question Text <span style={{ color: 'var(--danger-fg)' }}>*</span></label>
                <textarea name={`q_${idx}_text`} rows={2} required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-accent" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1 block text-sm font-semibold">Option A <span style={{ color: 'var(--danger-fg)' }}>*</span></label><input name={`q_${idx}_a`} required className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent" /></div>
                <div><label className="mb-1 block text-sm font-semibold">Option B <span style={{ color: 'var(--danger-fg)' }}>*</span></label><input name={`q_${idx}_b`} required className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent" /></div>
                <div><label className="mb-1 block text-sm font-semibold">Option C</label><input name={`q_${idx}_c`} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent" /></div>
                <div><label className="mb-1 block text-sm font-semibold">Option D</label><input name={`q_${idx}_d`} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">Correct Answer <span style={{ color: 'var(--danger-fg)' }}>*</span></label>
                  <select name={`q_${idx}_correct`} required className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent">
                    <option value="">Select...</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Points</label>
                  <input type="number" name={`q_${idx}_points`} defaultValue={1} min={1} max={10} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="text-center">
          <button type="button" onClick={addQuestion} className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-brand-accent px-6 py-3 text-sm font-bold text-brand-primary transition hover:bg-brand-accent hover:text-white">
            <PlusCircle size={16} /> Add Another Question
          </button>
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <Save size={16} /> {busy ? 'Saving...' : 'Save Questions'}
          </button>
        </div>
      </form>

    </div>
  )
}