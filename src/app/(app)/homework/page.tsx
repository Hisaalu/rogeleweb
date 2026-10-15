import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listHomeworkServer } from '@/lib/homework.server'
import {
  listClassesServer,
  listSubjectsServer,
} from '@/lib/lessons.server'
import type { Class, Subject } from '@/types/lesson'
import type { Homework } from '@/types/homework'
import { HomeworkView } from './homework-view'

export const metadata: Metadata = {
  title: 'Homework',
}

export default async function HomeworkPage() {
  const session = await getSessionUser()
  if (!session) return null

  let homework: Homework[] = []
  let classes: Class[] = []
  let subjects: Subject[] = []

  try {
    homework = await listHomeworkServer({ per_page: 50 })
  } catch {
    homework = []
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
    <HomeworkView
      initialHomework={homework}
      classes={classes}
      subjects={subjects}
      role={session.role}
      currentUserId={session.id}
    />
  )
}