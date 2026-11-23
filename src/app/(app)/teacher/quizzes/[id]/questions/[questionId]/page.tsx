import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getQuizServer, listQuestionsServer } from '@/lib/quizzes.server'
import { PageHeader } from '@/components/layout/page-header'
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
    <>
      <PageHeader
        title={`Edit Question — ${quiz.title}`}
        fallbackHref={`/teacher/quizzes/${quiz.id}/questions`}
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <EditQuestionForm quizId={quiz.id} question={question} />
      </div>
    </>
  )
}