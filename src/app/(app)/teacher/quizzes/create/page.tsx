import { listClassesServer, listSubjectsServer } from '@/lib/lessons.server'
import { QuizForm } from '../components/quiz-form'

export default async function CreateQuizPage() {
  const [classes, subjects] = await Promise.all([listClassesServer(), listSubjectsServer()])
  return <QuizForm classes={classes} subjects={subjects} mode="create" />
}