import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listQuizzesServer } from '@/lib/quiz.server'
import {
  listClassesServer,
  listSubjectsServer,
} from '@/lib/lessons.server'
import type { Class, Subject } from '@/types/lesson'
import type { Quiz } from '@/types/quiz'
import { QuizzesView } from './quizzes-view'

export const metadata: Metadata = {
  title: 'Quizzes',
}

export default async function QuizzesPage() {
  const session = await getSessionUser()
  if (!session) return null

  let quizzes: Quiz[] = []
  let classes: Class[] = []
  let subjects: Subject[] = []

  try {
    quizzes = await listQuizzesServer({ per_page: 50 })
  } catch {
    quizzes = []
  }
  try {
    classes = await listClassesServer()
  } catch {
    classes = []
  }
  try {
    subjects = await listSubjectsServer()
  } catch {
    subjects = []
  }

  return (
    <QuizzesView
      initialQuizzes={quizzes}
      classes={classes}
      subjects={subjects}
      role={session.role}
      currentUserId={session.id}
    />
  )
}