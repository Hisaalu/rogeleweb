import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, HelpCircle, Clock, Trophy, Calendar, RefreshCw, CheckCircle2, Eye } from 'lucide-react'
import { getQuizServer, listQuestionsServer } from '@/lib/quizzes.server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Preview Quiz' }

export default async function PreviewQuizPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [quiz, questions] = await Promise.all([getQuizServer(id), listQuestionsServer(id)])
  if (!quiz) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/teacher/quizzes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Quizzes
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold">
            <Eye size={22} style={{ color: 'var(--brand-primary)' }} /> Preview: {quiz.title}
          </h1>
        </div>
        <Link href={`/teacher/quizzes/${quiz.id}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          <Edit size={15} /> Edit Quiz
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 border-b border-border pb-4 mb-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><HelpCircle size={14} style={{ color: 'var(--brand-accent)' }} /> {questions.length} Questions</span>
          <span className="flex items-center gap-1"><Clock size={14} style={{ color: 'var(--brand-accent)' }} /> {quiz.time_limit ?? 30} minutes</span>
          <span className="flex items-center gap-1"><Calendar size={14} style={{ color: 'var(--brand-accent)' }} /> {quiz.end_date ? new Date(quiz.end_date).toLocaleString() : 'No Deadline'}</span>
          <span className="flex items-center gap-1"><Trophy size={14} style={{ color: 'var(--brand-accent)' }} /> {quiz.passing_score ?? 70}% to pass</span>
          <span className="flex items-center gap-1"><RefreshCw size={14} style={{ color: 'var(--brand-accent)' }} /> {quiz.max_attempts ?? 1} attempts</span>
        </div>
        {quiz.description && <p className="text-sm text-foreground">{quiz.description}</p>}
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
              <span className="font-semibold text-foreground">Question {idx + 1}</span>
              <span className="text-xs text-muted-foreground">{q.points} point(s)</span>
            </div>
            <p className="mb-4 text-base font-semibold text-foreground">{q.question_text}</p>
            <div className="space-y-2">
              {(q.options || []).map((opt, optIdx) => {
                const isCorrect = optIdx === q.correct_option
                return (
                  <div key={optIdx} className={`flex items-center gap-3 rounded-xl border p-3 ${isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-border bg-background'}`}>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {['A', 'B', 'C', 'D'][optIdx]}
                    </div>
                    <span className="flex-1 text-sm text-foreground">{opt}</span>
                    {isCorrect && <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={12}/> Correct</span>}
                  </div>
                )
              })}
            </div>
            {q.explanation && (
              <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}