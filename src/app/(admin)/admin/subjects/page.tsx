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

export const revalidate = 60

export default async function AdminSubjectsPage() {
  const [subjectsRes, classesRes, teachersRes] = await Promise.allSettled([
    listSubjectsServer({ per_page: 100 }),
    listClassesServer(),
    listTeachersServer(),
  ])

  const subjects = subjectsRes.status === 'fulfilled' ? subjectsRes.value : []
  const classes = classesRes.status === 'fulfilled' ? classesRes.value : []
  const teachers = teachersRes.status === 'fulfilled' ? teachersRes.value : []

  return (
    <SubjectsView
      initialSubjects={subjects}
      classes={classes}
      teachers={teachers}
    />
  )
}