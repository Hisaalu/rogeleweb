import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Edit, PlusCircle } from 'lucide-react'
import { getQuizServer, listQuestionsServer } from '@/lib/quizzes.server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Manage Questions' }

export default async function ManageQuestionsPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [quiz, questions] = await Promise.all([getQuizServer(id), listQuestionsServer(id)])
  if (!quiz) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:relative sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex items-center justify-between gap-3 sm:contents">
          <Link
            href="/teacher/quizzes"
            aria-label="Back to quizzes"
            className="inline-flex items-center gap-1.5 rounded-full p-1.5 text-2xl font-bold text-foreground transition hover:bg-muted hover:opacity-100 sm:text-3xl"          >
            <ArrowLeft size={26} className="shrink-0" />
            <span className="sr-only">Quizzes</span>
          </Link>

          <Link
            href={`/teacher/quizzes/${quiz.id}/questions/add`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:relative sm:z-10"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <PlusCircle size={16} /> Add Questions
          </Link>
        </div>

        <div className="text-center sm:pointer-events-none sm:absolute sm:left-1/2 sm:w-full sm:max-w-[60%] sm:-translate-x-1/2">
          <h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl">
            Questions for: {quiz.title}
          </h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {questions.length} questions currently added.
          </p>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-muted-foreground">No questions added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const safeOptions = q.options || []
            
            return (
              <div key={q.id} className="flex gap-4 rounded-2xl border-l-4 border-brand-primary bg-card p-5 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{q.question_text}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {safeOptions.map((opt, optIdx) => (
                      <span key={optIdx} className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm ${
                        optIdx === q.correct_option ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'border-border bg-background text-muted-foreground'
                      }`}>
                        {['A', 'B', 'C', 'D'][optIdx]}. {opt}
                        {optIdx === q.correct_option && <CheckCircle2 size={14} />}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Link href={`/teacher/quizzes/${quiz.id}/questions/${q.id}`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition hover:bg-brand-primary hover:text-white">
                    <Edit size={16} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}