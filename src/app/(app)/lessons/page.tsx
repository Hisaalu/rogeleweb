import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import {
  listClassesServer,
  listLessonsServer,
  listSubjectsServer,
} from '@/lib/lessons.server'
import type { Class, Lesson, Subject } from '@/types/lesson'
import { LessonsView } from './lessons-view'

export const metadata: Metadata = {
  title: 'Lessons',
}

export default async function LessonsPage() {
  const session = await getSessionUser()
  if (!session) return null

  let lessons: Lesson[] = []
  let classes: Class[] = []
  let subjects: Subject[] = []

  try {
    lessons = await listLessonsServer({ per_page: 50 })
  } catch {
    lessons = []
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
    <LessonsView
      initialLessons={lessons}
      classes={classes}
      subjects={subjects}
      role={session.role}
      currentUserId={session.id}
    />
  )
}