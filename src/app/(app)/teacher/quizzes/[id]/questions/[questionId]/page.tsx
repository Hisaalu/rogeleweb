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
      <Link href={`/teacher/quizzes/${quiz.id}/questions`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Questions
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Question</h1>
        <p className="text-sm text-muted-foreground mt-1">Editing question for: {quiz.title}</p>
      </div>

      <EditQuestionForm quizId={quiz.id} question={question} />
    </div>
  )
}