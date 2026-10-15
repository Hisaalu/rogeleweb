import type { Metadata } from 'next'
import {
  listClassesServer,
  listSubjectsServer,
  listTeachersServer,
} from '@/lib/subjects.server'
import type { Class, Subject, TeacherOption } from '@/types/admin'
import { SubjectsView } from './subjects-view'

export const metadata: Metadata = {
  title: 'Subjects',
}

export default async function AdminSubjectsPage() {
  let subjects: Subject[] = []
  let classes: Class[] = []
  let teachers: TeacherOption[] = []

  try {
    subjects = await listSubjectsServer({ per_page: 100 })
  } catch {
    subjects = []
  }
  try {
    classes = await listClassesServer()
  } catch {
    classes = []
  }
  try {
    teachers = await listTeachersServer()
  } catch {
    teachers = []
  }

  return (
    <SubjectsView
      initialSubjects={subjects}
      classes={classes}
      teachers={teachers}
    />
  )
}