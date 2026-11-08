import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getQuizServer, listQuestionsServer } from '@/lib/quizzes.server'
import { EditQuestionForm } from './edit-question-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Edit Question' }

export default async function EditQuestionPage({ params }: { params: { id: string, questionId: string } }) {
  const quizId = Number(params.id)
  const qId = Number(params.questionId)
  if (!Number.isFinite(quizId) || !Number.isFinite(qId)) notFound()

  const [quiz, questions] = await Promise.all([getQuizServer(quizId), listQuestionsServer(quizId)])
  const question = questions.find(q => q.id === qId)
  
  if (!quiz || !question) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="relative flex items-center justify-between gap-3">
        
        <Link
          href={`/teacher/quizzes/${quiz.id}/questions`}
          aria-label="Go back"
          className="inline-flex items-center gap-1.5 rounded-full p-1.5 text-2xl font-bold text-foreground transition hover:bg-muted hover:opacity-100 sm:text-3xl"
        >
          <ArrowLeft size={26} className="shrink-0" />
          <span className="sr-only">Go back</span>
        </Link>

        <div className="pointer-events-none absolute left-1/2 w-full max-w-[70%] -translate-x-1/2 text-center">
          <h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl">
            Edit Question
          </h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            Editing question for: {quiz.title}
          </p>
        </div>
      </div>

      <EditQuestionForm quizId={quiz.id} question={question} />
    </div>
  )
}