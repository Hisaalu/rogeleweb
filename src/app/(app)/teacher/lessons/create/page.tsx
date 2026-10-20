import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listClassesServer, listSubjectsServer } from '@/lib/lessons.server'
import { LessonForm } from './lesson-form'

export const metadata: Metadata = {
  title: 'Create Lesson',
}

export default async function CreateLessonPage() {
  const session = await getSessionUser()
  if (!session) return null

  const [classes, subjects] = await Promise.all([
    listClassesServer(),
    listSubjectsServer(),
  ])

  return <LessonForm classes={classes} subjects={subjects} mode="create" />
}