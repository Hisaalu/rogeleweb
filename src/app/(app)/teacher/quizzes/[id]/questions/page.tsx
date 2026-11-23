import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Edit, PlusCircle } from 'lucide-react'
import { getQuizServer, listQuestionsServer } from '@/lib/quizzes.server'
import { PageHeader } from '@/components/layout/page-header'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Manage Questions' }

export default async function ManageQuestionsPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [quiz, questions] = await Promise.all([getQuizServer(id), listQuestionsServer(id)])
  if (!quiz) notFound()

  return (
    <>
      <PageHeader
        title={`Questions: ${quiz.title}`}
        fallbackHref="/teacher/quizzes"
        action={
          <Link
            href={`/teacher/quizzes/${quiz.id}/questions/add`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:px-5 sm:py-2.5 sm:text-sm"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <PlusCircle size={16} /> Add Questions
          </Link>
        }
      />

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
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
    </>
  )
}