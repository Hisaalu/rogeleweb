'use client'

import { useState } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import Link from 'next/link'
import { ArrowLeft, Save, PlusCircle, X, HelpCircle } from 'lucide-react'
import type { Quiz } from '@/types/quiz'
import { useToast } from '@/components/ui/toast-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

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
          <Card key={q.id} className="relative border-2 p-6 transition hover:border-brand-accent">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <HelpCircle size={18} style={{ color: 'var(--brand-accent)' }} /> Question {idx + 1}
              </h3>
              {questions.length > 1 && (
                <Button type="button" variant="danger" size="icon" onClick={() => removeQuestion(q.id)}>
                  <X size={16} />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold">Question Text <span style={{ color: 'var(--danger-fg)' }}>*</span></label>
                <textarea name={`q_${idx}_text`} rows={2} required className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-brand-accent" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><label className="block text-sm font-semibold">Option A <span style={{ color: 'var(--danger-fg)' }}>*</span></label><Input name={`q_${idx}_a`} required /></div>
                <div className="space-y-1.5"><label className="block text-sm font-semibold">Option B <span style={{ color: 'var(--danger-fg)' }}>*</span></label><Input name={`q_${idx}_b`} required /></div>
                <div className="space-y-1.5"><label className="block text-sm font-semibold">Option C</label><Input name={`q_${idx}_c`} /></div>
                <div className="space-y-1.5"><label className="block text-sm font-semibold">Option D</label><Input name={`q_${idx}_d`} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold">Correct Answer <span style={{ color: 'var(--danger-fg)' }}>*</span></label>
                  <Select name={`q_${idx}_correct`} required>
                    <option value="">Select...</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold">Points</label>
                  <Input type="number" name={`q_${idx}_points`} defaultValue={1} min={1} max={10} />
                </div>
              </div>
            </div>
          </Card>
        ))}

        <div className="text-center">
          <Button type="button" variant="outline" onClick={addQuestion} className="border-dashed">
            <PlusCircle size={16} className="mr-2" /> Add Another Question
          </Button>
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <Button type="submit" disabled={busy}>
            <Save size={16} className="mr-2" /> {busy ? 'Saving...' : 'Save Questions'}
          </Button>
        </div>
      </form>
    </div>
  )
}