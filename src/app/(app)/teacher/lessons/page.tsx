import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import {
  listClassesServer,
  listLessonsServer,
  listSubjectsServer,
} from '@/lib/lessons.server'
import { TeacherLessonsView } from './teacher-lessons-view'

export const metadata: Metadata = {
  title: 'My Lessons',
}

export const dynamic = 'force-dynamic'

export default async function TeacherLessonsPage({
  searchParams,
}: {
  searchParams: {
    q?: string
    page?: string
    class_id?: string
    subject_id?: string
  }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const q = searchParams.q ?? ''
  const page = searchParams.page ? Number(searchParams.page) : 1
  const classId = searchParams.class_id ? Number(searchParams.class_id) : undefined
  const subjectId = searchParams.subject_id
    ? Number(searchParams.subject_id)
    : undefined

  const [lessonsResult, classes, subjects] = await Promise.all([
    listLessonsServer({
      q: q || undefined,
      class_id: classId,
      subject_id: subjectId,
      page,
      per_page: 12,
    }),
    listClassesServer(),
    listSubjectsServer(),
  ])

  return (
    <TeacherLessonsView
      lessons={lessonsResult.lessons}
      meta={lessonsResult.meta}
      classes={classes}
      subjects={subjects}
    />
  )
}